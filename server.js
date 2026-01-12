import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Load Config
const configPath = path.join(__dirname, 'servers.json');
let config = { servers: [] };

try {
    if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(raw);
        console.log(`✅ Loaded configuration with ${config.servers.length} servers.`);
    } else {
        console.warn("⚠️ servers.json not found in root!");
    }
} catch (e) {
    console.error("❌ Failed to load servers.json", e);
}

// API Endpoint
app.get('/api/status/:id', async (req, res) => {
    const { id } = req.params;
    const server = config.servers.find(s => s.id === id);

    if (!server) {
        return res.status(404).json({ error: 'Server not found' });
    }

    try {
        const apiRes = await fetch(`https://api.mcsrvstat.us/2/${server.ip}`);
        const data = await apiRes.json();
        res.json(data);
    } catch (e) {
        console.error(`Failed to fetch status for ${id}:`, e);
        res.status(500).json({ error: 'Upstream API error' });
    }
});

// Serve Static Frontend (Production)
// Assumes 'dist' folder is in the same directory or root
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    // SPA Fallback
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    console.log("ℹ️ 'dist' folder not found. Running in API-only mode.");
}

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
