import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Zap, Clock, ExternalLink, X, Settings } from 'lucide-react';

export default function QuotaModal({ isOpen, onClose, onOpenSettings }) {
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
            className="quota-modal glass max-w-md w-full p-10 text-center relative overflow-hidden rounded-[32px] border border-white/10"
            style={{ background: 'rgba(2, 4, 10, 0.8)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <button className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors" onClick={onClose}>
              <X size={20} />
            </button>

            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                <AlertCircle size={40} />
              </div>
            </div>

            <h2 className="text-3xl font-extrabold mb-4 gradient-text tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Capacity Reached</h2>
            <p className="text-gray-400 mb-10 leading-relaxed text-sm">
              Our AI engines are currently high-demand. We've automatically tried 12+ backup servers, but all are busy. 
              <br/><br/>
              Wait a few minutes or add your own token to skip the line.
            </p>

            <div className="space-y-4">
              <button 
                className="option-card glass p-5 flex items-center gap-5 text-left border-cyan-500/20 bg-cyan-500/5 group hover:bg-cyan-500/10 transition-all no-underline w-full"
                onClick={onOpenSettings}
              >
                <div className="p-2.5 bg-cyan-500/20 rounded-xl text-cyan-400">
                  <Settings size={22} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-white text-left">Add Personal Token</h4>
                  <p className="text-[11px] text-gray-400 text-left">Use your own HF/Replicate key to skip wait times.</p>
                </div>
                <ExternalLink size={18} className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
              </button>

              <div className="option-card glass p-5 flex items-center gap-5 text-left border-white/5 bg-white/[0.02]">
                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                  <Clock size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Wait for Reset</h4>
                  <p className="text-[11px] text-gray-500">Quotas usually refresh every hour.</p>
                </div>
              </div>
            </div>

            <button 
              className="mt-10 w-full py-4 rounded-2xl border border-white/10 text-gray-400 font-bold text-sm hover:bg-white/5 hover:text-white transition-all"
              onClick={onClose}
            >
              Close and Try Later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
