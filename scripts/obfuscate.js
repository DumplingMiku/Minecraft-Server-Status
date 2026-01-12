import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// 讀取 .env 檔案
dotenv.config({ path: path.join(rootDir, '.env') });

const inputPath = path.join(rootDir, 'servers.json');
const outputPath = path.join(rootDir, 'src', 'serverConfig.ts');
const SECRET_KEY = process.env.VITE_IP_KEY || 'default-insecure-key';

// XOR 加密函數
const xorEncrypt = (text, key) => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
};

const obfuscate = () => {
  try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    let config = JSON.parse(rawData);

    // Support legacy array format (just in case)
    if (Array.isArray(config)) {
        config = {
            app: { title: "Server Status", description: "Monitor your favorite Minecraft servers in real-time." },
            servers: config
        };
    }

    // SANITIZE: We strictly remove the 'ip' field for the frontend build.
    // The frontend will now query /api/status/:id instead of the IP directly.
    const sanitizedServers = config.servers.map(({ ip, ...rest }) => rest);

    const content = `// ------------------------------------------------------------------
// 這個檔案是自動產生的，請勿手動修改。
// 為了安全起見，此檔案僅包含伺服器 ID，不包含真實 IP。
// ------------------------------------------------------------------

import type { MinecraftServer } from './types';

export const APP_CONFIG = ${JSON.stringify(config.app, null, 2)};

// IP field is intentionally removed to prevent leaks.
export const SERVER_CONFIG: Omit<MinecraftServer, 'ip'>[] = ${JSON.stringify(sanitizedServers, null, 2)};
`;

    fs.writeFileSync(outputPath, content);
    console.log(`✅ 已生成前端設定 (IP 已隱藏)`);
  } catch (error) {
    console.error('❌ 加密失敗:', error.message);
  }
};

obfuscate();
