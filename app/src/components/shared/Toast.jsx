import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: 'bg-success/20 border-success/30 text-success',
  error: 'bg-danger/20 border-danger/30 text-danger',
  warning: 'bg-warning/20 border-warning/30 text-warning',
  info: 'bg-mint-500/20 border-mint-500/30 text-mint-400',
};

export default function Toast({ toast }) {
  const { removeToast } = useUIStore();
  const Icon = icons[toast.type] || icons.info;
  const colorClass = colors[toast.type] || colors.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`
        pointer-events-auto flex items-center gap-3 px-4 py-3 
        rounded-xl border backdrop-blur-lg
        ${colorClass}
      `}
    >
      <Icon size={20} className="flex-shrink-0" />
      <p className="flex-1 text-sm font-medium text-white">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}
