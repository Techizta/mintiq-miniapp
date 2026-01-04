/**
 * MintIQ LoadingScreen Component
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function LoadingScreen() {
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    // Show retry button after 10 seconds
    const timer = setTimeout(() => {
      setShowRetry(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
      />
      <p className="mt-4 text-dark-400 text-sm">Loading MintIQ...</p>
      
      {showRetry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <p className="text-dark-500 text-xs mb-3">Taking longer than expected?</p>
          <button
            onClick={handleReload}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white text-sm rounded-lg transition-colors"
          >
            <RefreshCw size={14} />
            Reload
          </button>
        </motion.div>
      )}
    </div>
  );
}
