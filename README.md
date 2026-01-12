# Minecraft Server Status Panel

A modern, secure, and lightweight dashboard to monitor your Minecraft servers (Java & Bedrock). Built with React, Vite, and Tailwind CSS.

![Project Preview](https://via.placeholder.com/800x400?text=Preview+Coming+Soon)

## ✨ Features

- **Live Status**: Real-time monitoring of online/offline status, player count, and version.
- **Visual Player List**: Displays player heads/skins (supports Crafatar & Minotar).
- **Rich MOTD**: Renders colorful server MOTDs (HTML support).
- **Secure Configuration**: 
  - IPs are **encrypted** during the build process to prevent plain-text leakage in source code.
  - "Hide IP" mode masks the address in the UI and disables copy functionality.
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
   # Copy templates
   cp .env.example .env
   cp servers.json.example servers.json
   ```

3. Edit `.env` and set a strong secret key:
   ```env
   VITE_IP_KEY=YourSuperSecretKeyHere123!
   ```

4. Edit `servers.json` with your real server information.

## ⚙️ Configuration (`servers.json`)

**First Time Setup:** Rename `.env.example` to `.env` and `servers.json.example` to `servers.json` in the root directory.

All settings are managed in `servers.json`. You can define your app branding and the server list here.

**Note:** You write **REAL** IPs in this file. The build script will automatically encrypt them.

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
    },
    {
      "id": "private",
      "name": "Admin Server",
      "ip": "192.168.1.50",
      "hideIp": true
    }
  ]
}
```

### Server Options
- `id`: Unique identifier for the server.
- `name`: Display name.
- `ip`: The actual server address (IP or Domain).
- `hideIp`: If `true`, the IP will be shown as `HIDDEN IP ADDRESS` and cannot be copied.

## 🛠️ Development & Build

### Development Mode
Runs the local dev server. The obfuscation script runs automatically before start.
```bash
npm run dev
```

### Production Build
Encrypts the configuration and builds the static site to the `dist/` folder.
```bash
npm run build
```

## 🔒 Security: How IP Protection Works

1. **Obfuscation**: When you run `dev` or `build`, a script reads `servers.json`.
2. **Encryption**: It uses the `VITE_IP_KEY` from your `.env` file to apply XOR encryption + Base64 encoding to your server IPs.
3. **Generation**: A TypeScript file (`src/serverConfig.ts`) is generated containing *only* the encrypted strings.
4. **Runtime**: The client-side app decrypts the IP internally just before querying the status API.

*Note: While this prevents casual users from reading IPs in your source code, the browser must eventually know the IP to fetch data. Sophisticated users can still inspect network traffic.*

## 📄 License

MIT