/**
 * MintIQ Layout - FIXED
 * 
 * Key Fixes:
 * - Pass onClose callback to Celebration component
 * - Updated leaderboard title to "Ranks"
 */

import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from './BottomNav';
import Header from './Header';
import Toast from '../shared/Toast';
import Modal from '../shared/Modal';
import Celebration from '../shared/Celebration';
import { useUIStore } from '../../stores/uiStore';

export default function Layout() {
  const location = useLocation();
  const { isTabBarVisible, toasts, modal, celebration, clearCelebration } = useUIStore();

  const showHeader = !['/', '/more'].includes(location.pathname);
  
  const getPageTitle = () => {
    const routes = {
      '/predict': 'Predictions',
      '/earn': 'Earn',
      '/earn/tasks': 'Tasks',
      '/wallet': 'Wallet',
      '/wallet/transactions': 'Transactions',
      '/wallet/redeem': 'Redeem',
      '/friends': 'Friends',
      '/challenges': 'Challenges',
      '/groups': 'Groups',
      '/leaderboard': 'Ranks',  // FIXED: Changed from "Leaderboard"
      '/ranks': 'Ranks',
      '/vault': 'BTC Vault',
      '/shop': 'Shop',
      '/boosters': 'Boosters',
      '/stats': 'My Stats',
      '/settings': 'Settings',
      '/settings/notifications': 'Settings',
      '/settings/security': 'Settings',
      '/settings/language': 'Settings',
      '/support': 'Settings',
    };
    if (location.pathname.startsWith('/predict/')) return 'Quest';
    if (location.pathname.startsWith('/groups/')) return 'Group';
    return routes[location.pathname] || '';
  };

  return (
    <div className="fixed inset-0 bg-dark-950 flex flex-col overflow-hidden">
      {showHeader && <Header title={getPageTitle()} />}
      <main 
        className={`flex-1 overflow-y-auto overflow-x-hidden ${showHeader ? 'pt-14' : ''}`}
        style={{ paddingBottom: isTabBarVisible ? 'calc(4.5rem + env(safe-area-inset-bottom, 0px))' : '0' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {isTabBarVisible && <BottomNav />}
      <div className="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (<Toast key={toast.id} toast={toast} />))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {modal.isOpen && <Modal type={modal.type} props={modal.props} />}
      </AnimatePresence>
      <AnimatePresence>
        {celebration && (
          <Celebration 
            type={celebration.type} 
            data={celebration.data} 
            onClose={clearCelebration}  // FIXED: Added onClose callback
          />
        )}
      </AnimatePresence>
    </div>
  );
}
