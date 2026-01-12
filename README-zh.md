# Minecraft 伺服器狀態面板 (Minecraft Server Status Panel)

一個現代化、安全且輕量的 Minecraft 伺服器監控儀表板 (支援 Java 與 Bedrock 版)。使用 React, Vite 與 Tailwind CSS 建構。

## ✨ 特色功能

- **即時狀態**: 即時監控伺服器在線狀態、玩家數量與版本資訊。
- **玩家頭像**: 視覺化顯示在線玩家的頭顱/Skin (支援 Crafatar 與 Minotar，自動判斷 UUID)。
- **彩色 MOTD**: 完整支援伺服器的彩色 MOTD 顯示 (HTML 格式)。
- **安全配置**: 
  - **IP 加密**: 在 Build 過程中自動加密 IP，防止在原始碼中洩漏真實 IP。
  - **隱藏模式**: 設定 `hideIp: true` 的伺服器會在介面上隱藏 IP 並禁用複製功能。
- **高度自訂**: 透過簡單的 JSON 檔案即可自訂網站標題、Logo、Favicon 與描述。
- **響應式設計**: 完美支援電腦與手機版面。

## 🚀 快速開始

### 環境需求

- Node.js (v18 或更高)
- npm

### 安裝步驟

1. 下載專案並安裝依賴套件：
   ```bash
   npm install
   ```

2. 建立您的設定檔：
   ```bash
   # 從範例複製設定檔
   cp .env.example .env
   cp servers.json.example servers.json
   ```

3. 編輯 `.env` 並設定加密密鑰：
   ```env
   VITE_IP_KEY=這裡輸入你的自訂密碼!
   ```

4. 編輯 `servers.json` 填入您的伺服器資訊。

## ⚙️ 設定指南 (`servers.json`)

**首次設定：** 請將根目錄下的 `.env.example` 複製並重新命名為 `.env`，將 `servers.json.example` 複製並重新命名為 `servers.json`。

所有的設定都由 `servers.json` 管理。你可以在這裡定義網站外觀與伺服器列表。

**注意：** 請在此檔案填寫 **真實** 的 IP。編譯腳本會自動將其加密。

```json
{
  "app": {
    "title": "我的伺服器列表",
    "description": "即時監控我們的 Minecraft 伺服器狀態。",
    "metaTitle": "伺服器狀態",
    "favicon": "https://example.com/icon.png",
    "logo": "https://example.com/logo.png"
  },
  "servers": [
    {
      "id": "survival",
      "name": "生存伺服器",
      "ip": "play.myserver.com",
      "hideIp": false
    },
    {
      "id": "private",
      "name": "管理員伺服器",
      "ip": "192.168.1.50",
      "hideIp": true
    }
  ]
}
```

### 參數說明
- `id`: 伺服器的唯一識別碼 (請勿重複)。
- `name`: 顯示名稱。
- `ip`: 真實的伺服器位址 (IP 或網域)。
- `hideIp`: 若設為 `true`，介面上將顯示為 `HIDDEN IP ADDRESS` 並且無法複製。

## 🛠️ 開發與編譯

### 開發模式 (Development)
啟動本地開發伺服器。啟動前會自動執行加密腳本。
```bash
npm run dev
```

### 生產構建 (Production Build)
加密設定檔並將網站編譯至 `dist/` 資料夾。
```bash
npm run build
```

## 🔒 安全性：IP 保護機制原理

為了避免在 GitHub 或網頁原始碼中直接暴露您的伺服器 IP，本專案採用以下機制：

1. **混淆 (Obfuscation)**: 當你執行 `dev` 或 `build` 指令時，腳本會讀取 `servers.json`。
2. **加密 (Encryption)**: 腳本會使用你在 `.env` 中設定的 `VITE_IP_KEY`，對 IP 進行 **XOR 加密** 並轉為 Base64 字串。
3. **生成 (Generation)**: 系統會自動生成 `src/serverConfig.ts`，裡面只包含加密後的亂碼。
4. **運行時 (Runtime)**: 網頁在瀏覽器執行時，會在發送請求前一刻才將 IP 解密。

*注意：雖然這能有效防止他人直接查看原始碼獲取 IP，但由於瀏覽器必須知道 IP 才能連線 API，有經驗的使用者仍可透過瀏覽器的「開發者工具 (Network)」查看網路請求來獲取 IP。這是所有純前端網頁無法避免的特性。*

## 📄 授權

MIT
