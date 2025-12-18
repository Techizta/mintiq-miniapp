import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ 
  title = 'Confirm', 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm, 
  onClose,
  icon,
}) {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const buttonVariants = {
    primary: 'btn-primary',
    danger: 'btn-danger',
    gold: 'btn-gold',
  };

  return (
    <div className="p-6 pt-12">
      {/* Icon */}
      <div className="flex justify-center mb-4">
        {icon || (
          <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center">
            <AlertTriangle size={32} className="text-warning" />
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white text-center mb-2">
        {title}
      </h3>

      {/* Message */}
      <p className="text-dark-400 text-center mb-6">
        {message}
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="btn-secondary flex-1"
        >
          {cancelText}
        </button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirm}
          className={`${buttonVariants[confirmVariant]} flex-1`}
        >
          {confirmText}
        </motion.button>
      </div>
    </div>
  );
}
