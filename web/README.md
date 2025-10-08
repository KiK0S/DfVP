# Defense for Very Pixi (DfVP Web)

A fully refreshed web remake of the original DfVP tower-defense prototype. The client has been rebuilt in **TypeScript + PixiJS**, ships with a polished lobby/game overlay, supports both **solo practice runs** and **WebSocket multiplayer rooms**, and is ready for one-click deployment to GitHub Pages.

## Highlights

- 🎨 **PixiJS renderer** – hardware accelerated sprites, smoother animations, and a layered playfield
- 🧑‍🤝‍🧑 **Room-based multiplayer** – create or join rooms with six-character codes
- 🧑‍💻 **Solo mode** – play instantly without a server using the built-in simulation of the Python game logic
- 🧭 **Responsive UI** – modern glassmorphism inspired layout, HUD overlays, and keyboard hints
- 🚀 **Automated deploys** – GitHub Actions workflow builds the Vite client and publishes it to GitHub Pages

## Controls

- `WASD` – move the defender
- `L` – fire while moving
- Keep enemies away from the central tower and survive the incoming waves.

## Project structure

```
web/
├── client/                 # PixiJS/Vite frontend
│   ├── public/assets/      # Sprites copied verbatim into the build
│   ├── src/                # TypeScript sources and Pixi scene management
│   ├── index.html          # Vite entry point
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                 # Node.js WebSocket game server
│   ├── server.js
│   ├── room-manager.js
│   └── game-handler.js
├── package.json            # Scripts for client + server
├── package-lock.json
└── README.md               # This guide
```

## Getting started

### Requirements

- Node.js 18+
- npm (bundled with Node.js)

### Install dependencies

```bash
cd web
npm install
```

### Run the PixiJS client (Vite dev server)

```bash
npm run dev
```

The client will be available on <http://localhost:5173>. You can join an external multiplayer room by entering the WebSocket URL (for example `ws://localhost:3000`).

### Run the multiplayer server

```bash
npm run dev:server
```

The server uses Express for static hosting and `ws` for WebSockets. By default it listens on `http://localhost:3000`. When running both dev servers, configure the client to use `ws://localhost:3000` as the server address from the lobby panel.

### Quick peer-hosted room (npx)

After publishing the package (see below), any player can host a multiplayer room without cloning the repo:

```bash
npx dfvp-room --public
```

- `--public` exposes the room on all interfaces (`0.0.0.0`) so friends on the same network can join.
- Use `--port 4000` (or any port) to override the default `3000`.
- Pass `--static-dir path/to/dist` if you also want to serve a local client build.

While developing locally you can run the same CLI straight from the repository:

```bash
node bin/dfvp-room.js --public
```

### Production build

```bash
npm run build
```

This command bundles the PixiJS client with Vite into `web/client/dist`. The Node server automatically serves the production build when it detects the `dist` folder. You can then start the server normally:

```bash
npm start
```

### Build standalone host executables

To generate ready-to-share binaries (Windows, macOS Intel/ARM, Linux Intel/ARM) run:

```bash
npm run package:host
```

Artifacts are written to `web/dist-host/`:

- `dfvp-room-win-x64.exe`
- `dfvp-room-macos-x64`
- `dfvp-room-macos-arm64`
- `dfvp-room-linux-x64`
- `dfvp-room-linux-arm64`

Distribute the binary that matches the host player’s platform; they can then double-click or run it from a terminal to start a room.

### Solo mode

Hit **Start Solo Run** in the lobby to launch an offline simulation that mirrors the server-side physics and enemy waves. Solo mode works even when the multiplayer server is unavailable, which makes it perfect for GitHub Pages deployments.

## Deployment

The repository contains a workflow at `.github/workflows/deploy.yml` that:

1. Installs the `web` dependencies
2. Builds the Vite client
3. Publishes `web/client/dist` to GitHub Pages using the official `actions/deploy-pages` action

Push to `main` (or run the workflow manually) to refresh the live build. Make sure GitHub Pages is configured to deploy from GitHub Actions.

To distribute the room host CLI publicly, publish the `web` package to npm (once you’re ready for others to use it):

```bash
cd web
npm publish --access public
```

After publishing, `npx dfvp-room` will pull the latest version automatically.

## Multiplayer flow

1. Create a room from the lobby – a six character code is generated automatically
2. Share the code and optionally the server address with friends on the same network
3. When everyone is ready, hit **Start match**
4. Coordinate defenses and protect the tower for as long as possible

## Troubleshooting

- **Unable to connect to server** – verify the WebSocket URL (must begin with `ws://` or `wss://`) and ensure the Node server is running
- **Assets missing after deployment** – rerun `npm run build`; the workflow copies assets from `client/public`
- **Controls unresponsive** – the lobby ignores key presses while form inputs are focused; click on the canvas area before playing

## Credits

- Original concept & assets: **KiK0S**
- Web & PixiJS rebuild: **AI Assistant**
