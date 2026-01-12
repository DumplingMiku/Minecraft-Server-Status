
/**
 * Cloudflare Worker for MC Status Panel (Debug Enhanced)
 * 
 * INSTRUCTIONS:
 * 1. Copy the content of your 'servers.json' into the CONFIG variable below.
 * 2. Deploy this worker to Cloudflare.
 */

const CONFIG = {
  // --- PASTE YOUR SERVERS.JSON CONTENT HERE ---
  "servers": [
    {
      "id": "survival",
      "name": "Survival SMP",
      "ip": "play.myserver.com",
      "hideIp": false
    },
    // ... add your other servers here
  ]
  // ---------------------------------------------
};

// Common CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight (OPTIONS request)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    // Path should be /id or /EvoLab%20SV1
    let serverId = url.pathname.slice(1); // Remove leading '/'
    try {
        serverId = decodeURIComponent(serverId);
    } catch (e) {
        // ignore decoding errors
    }

    if (!serverId) {
      return new Response(JSON.stringify({ error: "Missing Server ID" }), { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const server = CONFIG.servers.find(s => s.id === serverId);

    if (!server) {
      return new Response(JSON.stringify({ error: `Server config not found for ID: ${serverId}` }), { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!server.ip) {
        return new Response(JSON.stringify({ error: `IP address is missing in config for ID: ${serverId}` }), { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }

    // Proxy request to mcsrvstat.us
    try {
      const targetUrl = `https://api.mcsrvstat.us/2/${server.ip}`;
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "MC-Status-Panel-Worker/1.0"
        }
      });
      
      if (!response.ok) {
          throw new Error(`Upstream API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return new Response(JSON.stringify(data), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      // Return detailed error for debugging
      return new Response(JSON.stringify({ 
          error: "Failed to fetch status from upstream", 
          message: err.message,
          debug_id: serverId
      }), {
        status: 500,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
        },
      });
    }
  },
};
