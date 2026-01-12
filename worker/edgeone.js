/**
 * Tencent Cloud EdgeOne Function
 * 
 * 使用說明：
 * 1. 將 servers.json 的內容複製到下方的 CONFIG 變數。
 * 2. 在 EdgeOne 控制台建立新的邊緣函數，貼上此程式碼。
 * 3. 設定觸發規則 (Trigger Rule) 為 /api/status/*
 */

const CONFIG = {
  // --- 請在此處貼上 servers.json 的內容 ---
  "servers": [
    {
      "id": "survival",
      "name": "Survival Example",
      "ip": "play.myserver.com",
      "hideIp": false
    }
  ]
  // ---------------------------------------
};

// EdgeOne 支援 Service Worker 語法
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // CORS Headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 解析 ID: 假設 URL 是 https://your-domain.com/api/status/survival
  const parts = url.pathname.split('/');
  const id = parts[parts.length - 1];

  const server = CONFIG.servers.find(s => s.id === id);

  if (!server) {
    return new Response(JSON.stringify({ error: "Server not found" }), { 
      status: 404, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const response = await fetch(`https://api.mcsrvstat.us/2/${server.ip}`);
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Upstream API Error" }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
