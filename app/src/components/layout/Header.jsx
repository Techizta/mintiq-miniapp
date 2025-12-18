import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import telegram from '../../services/telegram';

export default function Header({ title, showBack = true, rightAction, className = '' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    telegram.hapticImpact('light');
    navigate(-1);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 bg-dark-950/95 backdrop-blur-lg border-b border-white/5 safe-top ${className}`}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left - Back button */}
        <div className="w-10">
          {showBack && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
            >
              <ChevronLeft size={24} className="text-white" />
            </motion.button>
          )}
        </div>

        {/* Center - Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold text-white"
        >
          {title}
        </motion.h1>

        {/* Right - Action button */}
        <div className="w-10 flex justify-end">
          {rightAction}
        </div>
      </div>
    </header>
  );
}
