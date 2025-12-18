import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import telegram from '../../services/telegram';

// Import modal content components
import BetModal from '../features/BetModal';
import ConfirmModal from './ConfirmModal';
import ResultModal from '../features/ResultModal';

const modalComponents = {
  bet: BetModal,
  confirm: ConfirmModal,
  result: ResultModal,
};

export default function Modal({ type, props }) {
  const { closeModal } = useUIStore();

  const handleClose = () => {
    telegram.hapticImpact('light');
    closeModal();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const ModalContent = modalComponents[type];

  if (!ModalContent) {
    console.warn(`Unknown modal type: ${type}`);
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-dark-850 rounded-t-3xl sm:rounded-3xl border border-white/10 max-h-[90vh] overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X size={18} className="text-dark-400" />
        </button>

        {/* Modal content */}
        <ModalContent {...props} onClose={handleClose} />
      </motion.div>
    </motion.div>
  );
}
