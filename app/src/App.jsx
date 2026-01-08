import { useEffect, Suspense, lazy, Component } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from './stores/userStore';
import { useUIStore } from './stores/uiStore';
import BottomNav from './components/layout/BottomNav';
import LoadingScreen from './components/shared/LoadingScreen';
import telegram from './services/telegram';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

const HomePage = lazy(() => import('./pages/HomePage'));
const PoolsPage = lazy(() => import('./pages/PoolsPage'));
const MinePage = lazy(() => import('./pages/MinePage'));
const EarnPage = lazy(() => import('./pages/EarnPage'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const QuestDetailPage = lazy(() => import('./pages/QuestDetailPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const FriendsPage = lazy(() => import('./pages/FriendsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PremiumPage = lazy(() => import('./pages/PremiumPage'));

// Global Error Boundary - prevents blank screens
class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorCode: null };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true, 
      error,
      errorCode: `MINTIQ-${Date.now().toString(36).toUpperCase()}`
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[MintIQ] App Error:', error);
    console.error('[MintIQ] Component Stack:', errorInfo.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-orange-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-dark-400 mb-2 max-w-sm">
            We encountered an error loading MintIQ. Please try again.
          </p>
          <p className="text-dark-500 text-xs mb-6">
            Error Code: {this.state.errorCode}
          </p>
          <button
            onClick={this.handleReload}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
          >
            <RefreshCw size={18} />
            Reload App
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-6 p-4 bg-dark-800 rounded-lg text-left text-xs text-red-400 max-w-full overflow-auto max-h-40">
              {this.state.error.toString()}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { initialize } = useUserStore();
  const { toast, hideToast } = useUIStore();

  useEffect(() => {
    console.log('[MintIQ] Initializing app...');
    telegram.init();
    telegram.ready();
    telegram.expand();
    // Initialize handles both auth and user data fetching
    initialize();
  }, []);

  const toastIcons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
  };
  const ToastIcon = toast ? (toastIcons[toast.type] || Info) : null;

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pools" element={<PoolsPage />} />
          <Route path="/predict" element={<PoolsPage />} />
          <Route path="/quests/:questId" element={<QuestDetailPage />} />
          <Route path="/mine" element={<MinePage />} />
          <Route path="/earn" element={<EarnPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<ProfilePage />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/elite" element={<PremiumPage />} />
          <Route path="/more" element={<Navigate to="/profile" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <BottomNav />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 z-[100] pointer-events-auto"
          >
            <div className={`
              flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-lg border
              ${toast.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-400' : ''}
              ${toast.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' : ''}
              ${toast.type === 'info' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : ''}
            `}>
              {ToastIcon && <ToastIcon size={20} />}
              <p className="flex-1 text-sm font-medium text-white">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// NOTE: BrowserRouter is in main.jsx - DO NOT add another one here!
export default function App() {
  return (
    <AppErrorBoundary>
      <AppContent />
    </AppErrorBoundary>
  );
}
