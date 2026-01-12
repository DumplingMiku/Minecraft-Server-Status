import { useEffect, useState } from 'react';
import { Trash2, RefreshCw, Copy, AlertTriangle, Clock } from 'lucide-react';
import type { MinecraftServer, ServerStatus } from '../types';
import clsx from 'clsx';
import DOMPurify from 'dompurify';

// The frontend config now omits 'ip', so we make it partial/optional here
interface ServerCardProps {
  server: Omit<MinecraftServer, 'ip'> & { ip?: string }; 
  onDelete: (id: string) => void;
}

export function ServerCard({ server, onDelete }: ServerCardProps) {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Use configured API URL (e.g. Cloudflare Worker) or default to relative path (Node.js backend)
  const API_BASE = import.meta.env.VITE_API_URL || '/api/status';

  const fetchStatus = async () => {
    setLoading(true);
    setError(false);
    try {
      // PROXY MODE: Request by ID, let the backend handle the IP lookup
      const res = await fetch(`${API_BASE}/${server.id}`);
      
      if (!res.ok) {
        // Attempt to read the error message from the backend (Cloudflare Worker)
        try {
            const errData = await res.json();
            console.error(`[ServerCard] Backend Error for ${server.name}:`, errData);
        } catch (jsonError) {
            console.error(`[ServerCard] Backend Error for ${server.name}: ${res.status} ${res.statusText}`);
        }
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.online) {
        // Normalize player list (can be string[] or object[])
        const rawList = data.players.list || [];
        const normalizedList = rawList.map((p: any) => {
            if (typeof p === 'string') {
                return { name: p, uuid: '' };
            }
            return p; // Already { name, uuid }
        });

        setStatus({
          online: true,
          motd: {
             clean: data.motd?.clean || [],
             html: data.motd?.html || []
          },
          players: {
            online: data.players.online,
            max: data.players.max,
            list: normalizedList,
          },
          version: data.version,
          icon: data.icon,
          hostname: data.hostname,
        });
      } else {
        setStatus({ online: false, players: { online: 0, max: 0 } });
      }
    } catch (e) {
      console.error(e);
      setError(true);
      setStatus(null);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Auto refresh every minute
    return () => clearInterval(interval);
  }, [server.id]); // Dependency changed from ip to id

  const copyIp = () => {
    // In proxy mode, we might not have the real IP in the frontend. 
    // If the backend returns it (e.g. in hostname), we could use that, 
    // otherwise disable copy if strictly hidden.
    if (status?.hostname) {
        navigator.clipboard.writeText(status.hostname);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg flex flex-col md:flex-row md:items-stretch">
      {/* Left Section: Icon & Identity */}
      <div className="p-4 md:w-64 md:border-r md:border-zinc-800/50 flex items-center gap-4 bg-zinc-800/20 shrink-0">
        <div className="relative shrink-0">
            {status?.icon ? (
                <img src={status.icon} alt="Server Icon" className="w-14 h-14 rounded-md shadow-sm" />
            ) : (
                <div className="w-14 h-14 bg-zinc-700 rounded-md flex items-center justify-center text-zinc-500 font-bold">
                    ?
                </div>
            )}
             <div className={clsx("absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-900", 
                    loading ? "bg-zinc-500 animate-pulse" : 
                    error ? "bg-amber-500" :
                    status?.online ? "bg-emerald-500" : "bg-red-500"
            )} />
        </div>
        
        <div className="min-w-0">
            <h3 className="font-bold text-lg text-white leading-tight truncate" title={server.name}>{server.name}</h3>
            
            <div className="flex items-center gap-2 mt-1">
                 {status?.version && (
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                        {status.version}
                    </span>
                )}
                 {error && (
                    <span className="text-xs text-amber-500 flex items-center gap-1">
                        <AlertTriangle size={10} /> Error
                    </span>
                 )}
            </div>
        </div>
      </div>

      {/* Middle Section: Details (IP & MOTD) */}
      <div className="p-4 flex-1 min-w-0 border-t md:border-t-0 border-zinc-800/50 flex flex-col justify-center gap-2">
        {/* IP Row */}
        <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-zinc-950/50 px-2 py-1 rounded-md border border-zinc-800/50 group w-fit max-w-full">
                <span className="text-xs font-mono text-zinc-500 select-none hidden sm:inline">IP</span>
                <code className="text-sm text-zinc-300 truncate font-mono">
                    {server.hideIp ? "HIDDEN IP ADDRESS" : (status?.hostname || "Connecting...")}
                </code>
                 {!server.hideIp && status?.hostname && (
                    <div className="flex items-center gap-1 pl-2 border-l border-zinc-800">
                        <button onClick={copyIp} className="hover:text-white text-zinc-500 transition-colors" title="Copy IP">
                            <Copy size={12} />
                        </button>
                    </div>
                 )}
            </div>
        </div>

        {/* MOTD */}
        {status?.motd?.html && status.motd.html.length > 0 ? (
            <div className="text-sm text-zinc-400 font-medium leading-relaxed">
                {status.motd.html.map((line, i) => (
                    <div 
                        key={i} 
                        className="break-words"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(line) }} 
                    />
                ))}
            </div>
        ) : status?.motd?.clean && (
            <div className="text-sm text-zinc-400 font-medium whitespace-pre-wrap">
                 {status.motd.clean.join('\n')}
            </div>
        )}
      </div>

      {/* Right Section: Players & Actions */}
      <div className="p-4 md:w-72 md:border-l md:border-zinc-800/50 bg-zinc-800/20 shrink-0 flex flex-col justify-center">
         {status?.online ? (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                     <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Online Players</span>
                     <span className="text-sm text-zinc-200 font-mono font-bold">
                        {status.players.online} <span className="text-zinc-600 font-normal">/</span> {status.players.max}
                    </span>
                </div>

                {/* Horizontal Player Strip */}
                 <div className="h-8 flex items-center">
                    {status.players.list && status.players.list.length > 0 ? (
                        <div className="flex -space-x-2 hover:space-x-1 transition-all duration-300">
                             {status.players.list.slice(0, 8).map((player) => (
                                <div key={player.uuid || player.name} className="relative group z-0 hover:z-10 transition-all">
                                    <img 
                                        src={
                                            player.uuid 
                                                ? `https://crafatar.com/avatars/${player.uuid}?size=32&overlay`
                                                : `https://minotar.net/avatar/${player.name}/32.png`
                                        }
                                        alt={player.name}
                                        className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 relative"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            // Prevent infinite loop if fallback fails
                                            if (!target.src.includes('ui-avatars.com')) {
                                                target.src = `https://ui-avatars.com/api/?name=${player.name}&background=3f3f46&color=fff&size=32`;
                                            }
                                        }}
                                    />
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                        {player.name}
                                    </div>
                                </div>
                            ))}
                            {status.players.list.length > 8 && (
                                <div className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-medium z-0">
                                    +{status.players.list.length - 8}
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="text-xs text-zinc-600 italic">No players online</span>
                    )}
                 </div>
            </div>
         ) : (
            <div className="flex items-center justify-center h-full text-zinc-500 italic text-sm">
                Server Offline
            </div>
         )}

         {/* Actions Footer */}
         <div className="mt-4 pt-3 border-t border-zinc-700/50 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                <Clock size={10} />
                <span>{lastUpdated.toLocaleTimeString()}</span>
            </div>
            <div className="flex gap-2">
                 <button onClick={fetchStatus} disabled={loading} className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors">
                    <RefreshCw size={14} className={clsx(loading && "animate-spin")} />
                </button>
                <button onClick={() => onDelete(server.id)} className="p-1.5 hover:bg-red-950/50 rounded text-zinc-400 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                </button>
            </div>
         </div>
      </div>
    </div>
  );
}