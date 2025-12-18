import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Target, Gift, Wallet, MoreHorizontal } from 'lucide-react';
import telegram from '../../services/telegram';

const navItems = [
  { id: 'home', path: '/', icon: Home, label: 'Home' },
  { id: 'predict', path: '/predict', icon: Target, label: 'Predict' },
  { id: 'earn', path: '/earn', icon: Gift, label: 'Earn' },
  { id: 'wallet', path: '/wallet', icon: Wallet, label: 'Wallet' },
  { id: 'more', path: '/more', icon: MoreHorizontal, label: 'More' },
];

export default function BottomNav() {
  const location = useLocation();
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  const handleNavClick = () => { telegram.hapticSelection(); };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-900/95 backdrop-blur-lg border-t border-white/5 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <NavLink key={item.id} to={item.path} onClick={handleNavClick}
              className="relative flex flex-col items-center justify-center w-16 h-full">
              {active && (<motion.div layoutId="navIndicator"
                className="absolute -top-0.5 w-8 h-1 bg-mint-gradient rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }} />)}
              <motion.div animate={{ scale: active ? 1.1 : 1, y: active ? -2 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                <Icon size={22} className={`transition-colors duration-200 ${active ? 'text-white' : 'text-dark-400'}`}
                  strokeWidth={active ? 2.5 : 2} />
              </motion.div>
              <span className={`text-2xs mt-1 font-medium transition-colors duration-200 ${active ? 'text-white' : 'text-dark-400'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
