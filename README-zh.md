# Minecraft 伺服器狀態面板 (Minecraft Server Status Panel)

一個現代化、安全且輕量的 Minecraft 伺服器監控儀表板 (支援 Java 與 Bedrock 版)。使用 React, Vite 與 Tailwind CSS 建構。

## ✨ 特色功能

- **即時狀態**: 即時監控伺服器在線狀態、玩家數量與版本資訊。
- **玩家頭像**: 視覺化顯示在線玩家的頭顱/Skin (支援 Crafatar 與 Minotar)。
- **彩色 MOTD**: 完整支援伺服器的彩色 MOTD 顯示 (HTML 格式)。
- **安全架構 (Proxy)**: 
  - **零 IP 洩漏**: 瀏覽器端完全不持有真實 IP。前端僅透過 ID 進行查詢。
  - **多端支援**: 可透過 Cloudflare Workers 或 Node.js 後端轉發請求。
  - **隱藏模式**: 設定 `hideIp: true` 的伺服器即便後端回傳網址，也會在介面上顯示為隱藏位址。
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
   cp servers.json.example servers.json
   ```

3. 編輯 `servers.json` 填入您的伺服器真實資訊。

## 🌐 後端部署 (安全性必要步驟)

為了徹底隱藏伺服器 IP，您**必須**部署一個後端中繼站。本專案已針對主流平台提供開箱即用的支援。

### 方案 A：Cloudflare Worker / 騰訊雲 EdgeOne
1. **Cloudflare:** 將 `worker/index.js` 的內容複製到新的 Worker。
2. **EdgeOne:** 將 `worker/edgeone.js` 的內容複製到新的邊緣函數。
3. **重要：** 將您的 `servers.json` 內容貼到腳本最上方的 `CONFIG` 變數中。
4. 部署並在 `.env` 中設定：`VITE_API_URL=https://your-function-url.com`

### 方案 B：Vercel (自動化部署)
1. 將此整個專案連結並上傳至 Vercel。
2. 系統會自動識別 `api/status.js` 並將其部署為 Serverless Function。
3. **重要：** Vercel 會同時處理前後端，通常無需額外設定 API 網址。

### 方案 C：Netlify
1. 將此專案連結並上傳至 Netlify。
2. 系統會自動讀取 `netlify.toml` 並部署位於 `netlify/functions` 的後端。
3. 同樣支援開箱即用，無需手動設定 API 網址。

### 方案 D：Node.js / VPS (自託管)
1. 執行 `npm run build`。
2. 確保 `servers.json` 與 `dist/` 資料夾與 `server.js` 放在伺服器上的同一個目錄。
3. 執行 `node server.js` (建議搭配 PM2)。
4. 設定 Nginx 將 `/api/` 導向 `localhost:3000` (參考 `nginx.conf.example`)。

## ⚙️ 設定指南 (`servers.json`)

**注意：** 請在此檔案填寫 **真實** 的 IP。編譯腳本會自動在前端設定檔中剔除這些 IP。

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
    }
  ]
}
```

## 🛠️ 開發與編譯

### 開發模式 (Development)
啟動本地開發伺服器。建議同時在另一個終端機執行 `node server.js` 以供 API 呼叫。
```bash
npm run dev
```

### 生產構建 (Production Build)
剔除前端設定檔中的 IP 並將網站編譯至 `dist/` 資料夾。
```bash
npm run build
```

## 🔒 安全性：IP 保護機制原理

為了徹底防止使用者透過「開發者工具 (Network)」獲取您的伺服器 IP，本專案採用以下機制：

1. **剔除 (Stripping)**: 當你執行 `build` 指令時，腳本會生成 `src/serverConfig.ts`，裡面會 **完全移除** `ip` 欄位。
2. **代理 (Proxying)**: 前端僅發送帶有 ID 的請求 (例如：`/api/status/survival`) 給中繼站。
3. **查詢 (Lookup)**: 後端中繼站 (Worker 或 Node.js) 根據 ID 在其內部的 `servers.json` 查找真實 IP，並向 Minecraft API 請求資料。
4. **零洩漏 (Zero-Leak)**: 瀏覽器的網路面板只會看到您的代理網址，永遠不會出現真實的伺服器 IP。

## ❓ 常見問題排查

### Cloudflare Worker 回傳 500 / Upstream 403 Forbidden
若您在 Worker 日誌中看到 `Upstream API error: 403 Forbidden`：
1. 上游 API (mcsrvstat.us) 要求請求必須包含 `User-Agent` 標頭。
2. 請確保您的 `worker/index.js` 程式碼在 `fetch` 時有加入以下標頭：
   ```javascript
   headers: { "User-Agent": "MC-Status-Panel-Worker/1.0" }
   ```
3. 請更新您在 Cloudflare 上部署的程式碼。

### 找不到伺服器 ID (Server config not found)
1. 請確保您已將 `servers.json` 的內容完整複製到 `worker/index.js` 內的 `CONFIG` 變數中。
2. 前端請求的 ID 必須與 Config 中的 `id` 完全一致（區分大小寫）。

## 📄 授權

MIT