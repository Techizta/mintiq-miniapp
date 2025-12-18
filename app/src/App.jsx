import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

// Layout
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import PredictPage from './pages/PredictPage';
import QuestDetailPage from './pages/QuestDetailPage';
import EarnPage from './pages/EarnPage';
import PremiumPage from './pages/PremiumPage';
import WalletPage from './pages/WalletPage';
import MorePage from './pages/MorePage';

// More Sub-pages
import FriendsPage from './pages/FriendsPage';
import ChallengesPage from './pages/ChallengesPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import VaultPage from './pages/VaultPage';
import ShopPage from './pages/ShopPage';
import BoostersPage from './pages/BoostersPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import TasksPage from './pages/TasksPage';
import RedeemPage from './pages/RedeemPage';
import TransactionsPage from './pages/TransactionsPage';

// Stores
import { useAuthStore } from './stores/authStore';
import { useUserStore } from './stores/userStore';

// Components
import SplashScreen from './components/shared/SplashScreen';
import ErrorBoundary from './components/shared/ErrorBoundary';

function App() {
  const { isInitialized, isAuthenticated, initialize } = useAuthStore();
  const { fetchUser } = useUserStore();

  useEffect(() => {
    // Initialize auth on mount
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Fetch user data when authenticated
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  // Show splash screen while initializing
  if (!isInitialized) {
    return <SplashScreen />;
  }

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Main tabs with bottom navigation */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="predict" element={<PredictPage />} />
            <Route path="predict/:questId" element={<QuestDetailPage />} />
            <Route path="earn" element={<EarnPage />} />
            <Route path="earn/tasks" element={<TasksPage />} />
            <Route path="premium" element={<PremiumPage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="wallet/transactions" element={<TransactionsPage />} />
            <Route path="wallet/redeem" element={<RedeemPage />} />
            <Route path="more" element={<MorePage />} />
            
            {/* More sub-pages */}
            <Route path="friends" element={<FriendsPage />} />
            <Route path="challenges" element={<ChallengesPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="groups/:groupId" element={<GroupDetailPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="vault" element={<VaultPage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="boosters" element={<BoostersPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;
