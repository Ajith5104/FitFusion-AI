import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Shield, Zap, Info, X, Save, Trash2 } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const [hfToken, setHfToken] = useState('');
  const [replicateToken, setReplicateToken] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedHf = localStorage.getItem('ff_hf_token') || '';
    const savedRep = localStorage.getItem('ff_replicate_token') || '';
    setHfToken(savedHf);
    setReplicateToken(savedRep);
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('ff_hf_token', hfToken.trim());
    localStorage.setItem('ff_replicate_token', replicateToken.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  const clearTokens = () => {
    if (confirm('Are you sure you want to clear your personal tokens?')) {
      localStorage.removeItem('ff_hf_token');
      localStorage.removeItem('ff_replicate_token');
      setHfToken('');
      setReplicateToken('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="quota-modal glass max-w-lg w-full p-8 relative overflow-hidden rounded-[32px] border border-white/10"
            style={{ background: 'rgba(2, 4, 10, 0.9)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
          >
            <button className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors" onClick={onClose}>
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
                <Settings size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Studio Settings</h2>
                <p className="text-xs text-gray-500">Manage your AI API identifiers</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Shield size={12} />
                  Hugging Face Token
                </label>
                <div className="relative">
                  <input 
                    type="password"
                    placeholder="hf_xxx, hf_yyy, hf_zzz"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                    value={hfToken}
                    onChange={(e) => setHfToken(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Info size={10} />
                  Paste multiple tokens (comma-separated) to rotate between accounts and bypass daily limits.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={12} />
                  Replicate API Token
                </label>
                <input 
                  type="password"
                  placeholder="r8_xxx, r8_yyy"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  value={replicateToken}
                  onChange={(e) => setReplicateToken(e.target.value)}
                />
                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Info size={10} />
                  Supports multiple tokens. Best for high-volume, stable generation.
                </p>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex gap-3 items-start">
                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-500/80 leading-relaxed">
                  Tokens are stored **only on your device** (localStorage) and are sent securely to our backend for the duration of the request. We do not store them on our servers.
                </p>
              </div>
            </div>

            <div className="mt-10 flex gap-3">
              <button 
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all ${isSaved ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-cyan-500 text-black hover:scale-[1.02]'}`}
                onClick={handleSave}
              >
                {isSaved ? 'Settings Saved' : <><Save size={18} /> Save Settings</>}
              </button>
              <button 
                className="p-4 rounded-2xl border border-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                onClick={clearTokens}
                title="Clear tokens"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
