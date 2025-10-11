#!/usr/bin/env node
/* eslint-disable no-console */

const path = require('path');
const os = require('os');
const fs = require('fs');
const { spawn } = require('child_process');
const { startRoomServer } = require('../server/server');

function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {
    port: undefined,
    host: '127.0.0.1',
    serveStatic: false,
    staticDir: null,
    tlsKeyPath: null,
    tlsCertPath: null,
    tlsCaPath: null,
    useCloudflared: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case '--port':
      case '-p':
        options.port = Number(args[i + 1]);
        i += 1;
        break;

      case '--host':
        options.host = args[i + 1];
        i += 1;
        break;

      case '--public':
        options.host = '0.0.0.0';
        break;

      case '--static-dir':
        options.staticDir = path.resolve(process.cwd(), args[i + 1]);
        options.serveStatic = true;
        i += 1;
        break;

      case '--serve-static':
        options.serveStatic = true;
        break;

      case '--no-static':
        options.serveStatic = false;
        break;

      case '--tls-key':
        options.tlsKeyPath = path.resolve(process.cwd(), args[i + 1]);
        i += 1;
        break;

      case '--tls-cert':
        options.tlsCertPath = path.resolve(process.cwd(), args[i + 1]);
        i += 1;
        break;

      case '--tls-ca':
        options.tlsCaPath = path.resolve(process.cwd(), args[i + 1]);
        i += 1;
        break;

      case '--https':
        options.host = options.host || '0.0.0.0';
        break;

      case '--cloudflared':
      case '--tunnel':
        options.useCloudflared = true;
        break;

      case '--serve-static':
        options.serveStatic = true;
        break;

      case '--no-static':
        options.serveStatic = false;
        break;

      case '--help':
      case '-h':
        options.help = true;
        break;

      case '--version':
      case '-v':
        options.version = true;
        break;

      default:
        if (arg.startsWith('-')) {
          console.warn(`Unknown option "${arg}"`);
          options.help = true;
        }
    }
  }

  return options;
}

function showHelp() {
  const pkg = require('../package.json');
  console.log(`DfVP Room Server v${pkg.version}

Usage:
  npx dfvp-room [options]

Options:
  -p, --port <number>       Port to listen on (default: 3000 or $PORT)
      --host <host>         Host interface (default: 127.0.0.1)
      --public              Shortcut for --host 0.0.0.0
      --serve-static        Serve bundled client files if available
      --no-static           Disable static file hosting (default)
      --static-dir <path>   Serve static files from a custom directory
      --tls-key <path>      Path to private key (PEM) for HTTPS/WSS
      --tls-cert <path>     Path to certificate (PEM) for HTTPS/WSS
      --tls-ca <path>       Optional certificate chain (PEM)
      --cloudflared         Launch a Cloudflare quick tunnel (requires cloudflared in PATH)
  -h, --help                Show this help message
  -v, --version             Print the version number

Examples:
  npx dfvp-room
  npx dfvp-room --public -p 4000
  npx dfvp-room --static-dir ./web/client/dist
  npx dfvp-room --public --tls-key key.pem --tls-cert cert.pem
  npx dfvp-room --public --cloudflared
`);
}

function showVersion() {
  const pkg = require('../package.json');
  console.log(pkg.version);
}

let tunnelProcess = null;

function logLocalAddresses(port, host, secure) {
  const nets = os.networkInterfaces();
  const addresses = [];

  Object.values(nets).forEach((interfaces) => {
    interfaces?.forEach((net) => {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    });
  });

  if (addresses.length === 0) {
    return;
  }

  const wsScheme = secure ? 'wss' : 'ws';
  console.log('[dfvp-room] Share one of these addresses with friends on your network:');
  addresses.forEach((address) => {
    console.log(`  ${wsScheme}://${address}:${port}`);
  });
}

function launchCloudflared(port, secure) {
  const targetScheme = secure ? 'https' : 'http';
  const target = `${targetScheme}://127.0.0.1:${port}`;
  console.log(`[dfvp-room] starting cloudflared tunnel to ${target}`);

  tunnelProcess = spawn('cloudflared', ['tunnel', '--url', target], {
    stdio: 'inherit',
  });

  tunnelProcess.on('error', (error) => {
    console.error('[dfvp-room] Failed to start cloudflared:', error.message);
  });

  tunnelProcess.on('exit', (code, signal) => {
    if (signal) {
      console.log(`[dfvp-room] cloudflared exited with signal ${signal}`);
    } else {
      console.log(`[dfvp-room] cloudflared exited with code ${code}`);
    }
  });
}

async function main() {
  const options = parseArgs(process.argv);

  if (options.help) {
    showHelp();
    return;
  }

  if (options.version) {
    showVersion();
    return;
  }

  let tls = null;
  if (options.tlsKeyPath && options.tlsCertPath) {
    try {
      tls = {
        key: fs.readFileSync(options.tlsKeyPath),
        cert: fs.readFileSync(options.tlsCertPath),
        ca: options.tlsCaPath ? fs.readFileSync(options.tlsCaPath) : undefined,
      };
    } catch (error) {
      console.error('[dfvp-room] Failed to read TLS files:', error.message);
      process.exit(1);
    }
  } else if (options.tlsKeyPath || options.tlsCertPath || options.tlsCaPath) {
    console.error('[dfvp-room] TLS requires both --tls-key and --tls-cert.');
    process.exit(1);
  }

  const server = startRoomServer({
    port: options.port,
    host: options.host,
    serveStatic: options.serveStatic,
    staticDir: options.staticDir,
    tls,
    onReady(info) {
      const displayHost = info.host === '0.0.0.0' ? 'localhost' : info.host;
      const secure = Boolean(tls && tls.key && tls.cert);
      const wsScheme = secure ? 'wss' : 'ws';
      console.log(`[dfvp-room] room ready at ${wsScheme}://${displayHost}:${info.port}`);
      if (info.host === '0.0.0.0') {
        logLocalAddresses(info.port, info.host, secure);
      } else {
        logLocalAddresses(info.port, info.host, secure);
      }

      if (options.useCloudflared) {
        launchCloudflared(info.port, secure);
      }
    },
  });

  process.on('SIGINT', () => {
    console.log('\n[dfvp-room] shutting down…');
    if (tunnelProcess) {
      tunnelProcess.kill();
      tunnelProcess = null;
    }
    server.server.close(() => {
      process.exit(0);
    });
  });
}

main().catch((error) => {
  console.error('[dfvp-room] Failed to start server:', error);
  process.exit(1);
});
