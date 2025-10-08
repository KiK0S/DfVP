#!/usr/bin/env node
/* eslint-disable no-console */

const path = require('path');
const os = require('os');
const { startRoomServer } = require('../server/server');

function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {
    port: undefined,
    host: '127.0.0.1',
    serveStatic: false,
    staticDir: null,
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
  -h, --help                Show this help message
  -v, --version             Print the version number

Examples:
  npx dfvp-room
  npx dfvp-room --public -p 4000
  npx dfvp-room --static-dir ./web/client/dist
`);
}

function showVersion() {
  const pkg = require('../package.json');
  console.log(pkg.version);
}

function logLocalAddresses(port, host) {
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

  console.log('[dfvp-room] Share one of these addresses with friends on your network:');
  addresses.forEach((address) => {
    console.log(`  ws://${address}:${port}`);
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

  const server = startRoomServer({
    port: options.port,
    host: options.host,
    serveStatic: options.serveStatic,
    staticDir: options.staticDir,
    onReady(info) {
      const displayHost = info.host === '0.0.0.0' ? 'localhost' : info.host;
      console.log(`[dfvp-room] room ready at ws://${displayHost}:${info.port}`);
      if (info.host === '0.0.0.0') {
        logLocalAddresses(info.port, info.host);
      } else {
        logLocalAddresses(info.port, info.host);
      }
    },
  });

  process.on('SIGINT', () => {
    console.log('\n[dfvp-room] shutting down…');
    server.server.close(() => {
      process.exit(0);
    });
  });
}

main().catch((error) => {
  console.error('[dfvp-room] Failed to start server:', error);
  process.exit(1);
});
