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

    const obfuscatedServers = config.servers.map(s => {
      // 1. 先做 XOR 加密
      const xorText = xorEncrypt(s.ip, SECRET_KEY);
      // 2. 再轉成 Base64
      const base64Text = Buffer.from(xorText, 'binary').toString('base64');
      
      return {
        ...s,
        ip: base64Text
      };
    });

    const content = `// ------------------------------------------------------------------
// 這個檔案是自動產生的，請勿手動修改。
// 請修改根目錄的 servers.json 並確保 .env 中的 VITE_IP_KEY 設定正確。
// ------------------------------------------------------------------

import type { MinecraftServer } from './types';

export const APP_CONFIG = ${JSON.stringify(config.app, null, 2)};

export const SERVER_CONFIG: MinecraftServer[] = ${JSON.stringify(obfuscatedServers, null, 2)};
`;

    fs.writeFileSync(outputPath, content);
    console.log(`✅ 已使用密鑰 '${SECRET_KEY}' 成功加密 IP`);
  } catch (error) {
    console.error('❌ 加密失敗:', error.message);
  }
};

obfuscate();
