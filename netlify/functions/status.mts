import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Netlify Functions run in a specific context. 
// Importing JSON directly might fail depending on bundler settings, so we try to read it.
// However, standard import usually works in modern Netlify functions.
import config from '../../servers.json' assert { type: 'json' };

export default async (req, context) => {
  // Config CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  // Handle OPTIONS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  // Parse ID from URL. 
  // Netlify rewrites /api/status/:id -> function. 
  // req.url will be the full URL.
  const url = new URL(req.url);
  const parts = url.pathname.split('/');
  const id = parts[parts.length - 1]; // Assumes /api/status/survival

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400, headers });
  }

  const server = config.servers.find(s => s.id === id);

  if (!server) {
    return new Response(JSON.stringify({ error: "Server not found" }), { status: 404, headers });
  }

  try {
    const apiRes = await fetch(`https://api.mcsrvstat.us/2/${server.ip}`, {
      headers: {
        'User-Agent': 'MC-Status-Panel-Netlify/1.0'
      }
    });
    const data = await apiRes.json();
    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Upstream error" }), { status: 500, headers });
  }
};
