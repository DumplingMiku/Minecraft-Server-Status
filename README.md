# Minecraft Server Status Panel

A modern, secure, and lightweight dashboard to monitor your Minecraft servers (Java & Bedrock). Built with React, Vite, and Tailwind CSS.

## ✨ Features

- **Live Status**: Real-time monitoring of online/offline status, player count, and version.
- **Visual Player List**: Displays player heads/skins (supports Crafatar & Minotar).
- **Rich MOTD**: Renders colorful server MOTDs (HTML support).
- **Secure Architecture (Proxy)**: 
  - **Zero-IP Frontend**: Real IPs are NEVER sent to the client. The frontend only knows server IDs.
  - **Multi-Backend Support**: Deploy via Cloudflare Workers or Node.js to bridge requests.
  - **Hide IP Mode**: Masks the address in the UI even if the backend returns a hostname.
- **Fully Customizable**: Customize the title, logo, favicon, and description via a simple JSON file.
- **Responsive Design**: Looks great on desktop and mobile.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up your configuration files:
   ```bash
   cp servers.json.example servers.json
   ```

3. Edit `servers.json` with your real server information.

## 🌐 Backend Deployment (Required for Security)

To hide your server IPs, you MUST deploy a backend proxy. This project supports multiple platforms out-of-the-box.

**Note:** Currently, only Cloudflare Worker and Node.js (Option D) have been thoroughly tested. Other options (Vercel, Netlify, EdgeOne) are provided for convenience but may require further testing.


### Option A: Cloudflare Worker / Tencent EdgeOne
1. **Cloudflare:** Copy `worker/index.js` to a new Worker.
2. **EdgeOne:** Copy `worker/edgeone.js` to a new Edge Function.
3. **CRITICAL:** Paste your `servers.json` content into the `CONFIG` variable at the top of the worker script.
4. Deploy and set `.env`: `VITE_API_URL=https://your-function-url.com`

### Option B: Vercel (Zero Config)
1. Deploy this entire repository to Vercel.
2. The project includes `api/status.js` which Vercel automatically deploys as a serverless function.
3. **Important:** Set the Environment Variable `VITE_API_URL` in Vercel to `/api/status` (or leave it empty to default to relative path).
4. Vercel will build the frontend and backend together.

### Option C: Netlify
1. Deploy this repository to Netlify.
2. The project includes `netlify.toml` and `netlify/functions/` configurations.
3. Netlify will automatically detect and deploy the functions.
4. No extra API URL config needed (defaults to relative path).

### Option D: Node.js / VPS (Self-Hosted)
The included `server.js` can serve both the frontend and the API simultaneously. For this setup, ensure you leave `VITE_API_URL` empty in your `.env` file.

1.  Build the frontend: `npm run build`.
2.  Place the generated `dist/` folder, `servers.json`, and `server.js` in the same directory on your server.
3.  Run the server: `node server.js`. It will host your panel on `http://localhost:3000`.

For production, it is recommended to place this behind a reverse proxy like Nginx to handle SSL and domain routing (see `nginx.conf.example` for a basic setup).

## ⚙️ Configuration (`servers.json`)

**Note:** You write **REAL** IPs in this file. The build script will strip them from the frontend config.

```json
{
  "app": {
    "title": "My Server Hub",
    "description": "Welcome to our community servers!",
    "metaTitle": "Server Status",
    "favicon": "https://example.com/icon.png",
    "logo": "https://example.com/logo.png"
  },
  "servers": [
    {
      "id": "survival",
      "name": "Survival SMP",
      "ip": "play.myserver.com",
      "hideIp": false
    }
  ]
}
```

## 🛠️ Development & Build

### Development Mode
This runs the Vite frontend dev server. For API calls to work, you must also run the Node.js backend in a separate terminal. The Vite configuration is pre-set to proxy API requests to the Node server.

**1. Start the Backend Server:**
```bash
node server.js
```

**2. In a new terminal, start the Frontend Dev Server:**
```bash
npm run dev
```

For this local setup, leave the `VITE_API_URL` in your `.env` file empty.

### Production Build
Strips IPs from the configuration and builds the static site to `dist/`.
```bash
npm run build
```

## 🔒 Security: How IP Protection Works

1. **Stripping**: When you run `build`, `scripts/obfuscate.js` generates `src/serverConfig.ts` which **completely removes** the `ip` field.
2. **Proxying**: The frontend requests status by ID (e.g., `/api/status/survival`).
3. **Lookup**: The backend (Worker or Node.js) looks up the real IP in its own copy of `servers.json` and fetches data from the Minecraft API.
4. **Zero-Leak**: The client's Network tab only sees your Proxy URL, never the real server IP.

## ❓ Troubleshooting

### ID Not Found
If you get "Server config not found for ID":
1. Ensure you have copied the contents of `servers.json` into the `CONFIG` variable inside `worker/index.js`.
2. Ensure the `id` requested matches the `id` in the config exactly (case-sensitive).

## 📄 License

MIT