import { useState, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import type { MinecraftServer } from './types';
import { SERVER_CONFIG, APP_CONFIG } from './serverConfig';
import { ServerCard } from './components/ServerCard';

function App() {
  // Initialize from config. Changes in config (rebuild/reload) will update this.
  const [servers, setServers] = useState<MinecraftServer[]>(SERVER_CONFIG);

  useEffect(() => {
    // Update Browser Title
    if (APP_CONFIG.metaTitle) {
      document.title = APP_CONFIG.metaTitle;
    }

    // Update Favicon
    if (APP_CONFIG.favicon) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = APP_CONFIG.favicon;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = APP_CONFIG.favicon;
        document.head.appendChild(newLink);
      }
    }
  }, []);

  const removeServer = (id: string) => {
    // Allows temporary removal from view
    setServers(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 w-14 h-14 flex items-center justify-center overflow-hidden">
                {APP_CONFIG.logo ? (
                    <img src={APP_CONFIG.logo} alt="App Logo" className="w-full h-full object-contain" />
                ) : (
                    <LayoutGrid className="text-emerald-500" size={32} />
                )}
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">{APP_CONFIG.title}</h1>
                <p className="text-zinc-500">
                    {APP_CONFIG.description}
                </p>
            </div>
          </div>
        </header>

        {/* List */}
        {servers.length === 0 ? (
             <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800 border-dashed">
                <h3 className="text-xl font-medium text-white mb-2">No servers configured</h3>
                <p className="text-zinc-500 max-w-md mx-auto">
                    Edit <code className="text-zinc-400">src/serverConfig.ts</code> to add your Minecraft servers.
                </p>
             </div>
        ) : (
            <div className="flex flex-col gap-4">
            {servers.map(server => (
                <ServerCard 
                    key={server.id} 
                    server={server} 
                    onDelete={removeServer} 
                />
            ))}
            </div>
        )}
        
        <footer className="mt-20 text-center text-zinc-600 text-sm">
            <p>Data provided by <a href="https://mcsrvstat.us/" target="_blank" rel="noreferrer" className="hover:text-zinc-400 underline decoration-zinc-800">mcsrvstat.us</a></p>
        </footer>
      </div>
    </div>
  );
}

export default App;
