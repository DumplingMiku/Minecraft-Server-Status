import { useState } from 'react';
import { X } from 'lucide-react';

interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (server: { name: string; ip: string; hideIp: boolean }) => void;
}

export function AddServerModal({ isOpen, onClose, onAdd }: AddServerModalProps) {
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [hideIp, setHideIp] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ip) return;
    onAdd({ name, ip, hideIp });
    setName('');
    setIp('');
    setHideIp(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md shadow-2xl p-6 relative">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
            <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Add Server</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Server Name</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. My Survival Server"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600"
                    autoFocus
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Server Address (IP)</label>
                <input 
                    type="text" 
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="e.g. play.hypixel.net"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600"
                />
            </div>

            <div className="flex items-center gap-2 mt-2">
                <input 
                    type="checkbox" 
                    id="hideIp"
                    checked={hideIp}
                    onChange={(e) => setHideIp(e.target.checked)}
                    className="rounded bg-zinc-950 border-zinc-800 text-emerald-500 focus:ring-emerald-500/20"
                />
                <label htmlFor="hideIp" className="text-sm text-zinc-400 cursor-pointer select-none">
                    Hide IP Address by default
                </label>
            </div>

            <button 
                type="submit"
                disabled={!name || !ip}
                className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Add Server
            </button>
        </form>
      </div>
    </div>
  );
}
