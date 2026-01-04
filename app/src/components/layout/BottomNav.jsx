/**
 * MintIQ BottomNav Component
 */

import { NavLink, useLocation } from 'react-router-dom';
import { Home, Target, Zap, Gift, User } from 'lucide-react';
import telegram from '../../services/telegram';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/pools', icon: Target, label: 'Pools' },
  { path: '/mine', icon: Zap, label: 'Mine' },
  { path: '/earn', icon: Gift, label: 'Earn' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();

  // Hide on certain pages
  const hiddenPaths = ['/quests/'];
  const shouldHide = hiddenPaths.some(path => location.pathname.includes(path));
  
  if (shouldHide) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-900 border-t border-white/5 px-2 pb-safe z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.path || 
            (item.path === '/pools' && location.pathname === '/predict');
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => telegram.hapticSelection()}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${
                isActive 
                  ? 'text-orange-400' 
                  : 'text-dark-500 hover:text-dark-300'
              }`}
            >
              <item.icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? 'text-orange-400' : ''}
              />
              <span className={`text-[10px] mt-1 font-medium ${
                isActive ? 'text-orange-400' : ''
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 bg-orange-400 rounded-full" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
