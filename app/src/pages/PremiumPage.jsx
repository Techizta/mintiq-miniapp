import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Crown, Check, Bitcoin, Zap, Shield, 
  Star, ArrowLeft, Gift, TrendingUp
} from 'lucide-react';
import api from '../services/api';
import telegram from '../services/telegram';
import { useUserStore } from '../stores/userStore';

export default function PremiumPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  const benefits = [
    { icon: Bitcoin, title: '600 SATZ Weekly', desc: '~2,400 sats/month ($2.50 value)', highlight: true },
    { icon: Zap, title: '2x Daily Bonus', desc: '10 sats vs 5 sats daily login' },
    { icon: Shield, title: 'Ad-Free Experience', desc: 'No interruptions, pure predictions' },
    { icon: Star, title: 'Exclusive Predictions', desc: 'Premium-only high-stakes quests' },
    { icon: Gift, title: 'Extra Spin', desc: '2 daily spins vs 1 for free users' },
    { icon: TrendingUp, title: 'Priority Withdrawals', desc: 'Faster BTC withdrawals' },
  ];

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      telegram.hapticImpact('medium');
      
      // Use Telegram Stars payment
      const result = await api.post('/api/miniapp/premium/subscribe', {
        plan: 'monthly'
      });
      
      if (result.invoiceUrl) {
        // Open Telegram payment
        window.Telegram?.WebApp?.openInvoice(result.invoiceUrl, (status) => {
          if (status === 'paid') {
            telegram.hapticNotification('success');
            refreshUser();
            navigate('/earn');
          }
        });
      } else if (result.success) {
        telegram.hapticNotification('success');
        refreshUser();
        navigate('/earn');
      }
    } catch (error) {
      alert(error.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-dark-950/95 backdrop-blur-sm z-10 px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-dark-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-white">Premium Membership</h1>
      </div>

      {/* Hero */}
      <div className="p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-500/30 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6 text-center"
        >
          <div className="w-20 h-20 bg-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown size={40} className="text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Go Premium</h2>
          <p className="text-dark-300 mb-4">
            Stack more sats, enjoy premium perks
          </p>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl font-bold text-white">$4.99</span>
            <span className="text-dark-400">/month</span>
          </div>
          <p className="text-yellow-400 text-sm">
            Get ~2,850 sats/month ($3+ value) for just $4.99!
          </p>
        </motion.div>
      </div>

      {/* Benefits */}
      <div className="px-4 space-y-3">
        <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wide">What you get</h3>
        
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-4 p-4 rounded-xl border ${
              benefit.highlight 
                ? 'bg-yellow-500/10 border-yellow-500/30' 
                : 'bg-dark-800 border-white/5'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              benefit.highlight ? 'bg-yellow-500/20' : 'bg-dark-700'
            }`}>
              <benefit.icon size={24} className={benefit.highlight ? 'text-yellow-400' : 'text-dark-300'} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white">{benefit.title}</h4>
              <p className="text-sm text-dark-400">{benefit.desc}</p>
            </div>
            <Check size={20} className="text-green-400" />
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-dark-950 via-dark-950 to-transparent">
        <button
          onClick={handleSubscribe}
          disabled={isLoading || user?.is_premium}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            user?.is_premium
              ? 'bg-dark-700 text-dark-400'
              : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40'
          }`}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
          ) : user?.is_premium ? (
            '✓ Already Premium'
          ) : (
            'Subscribe for $4.99/month'
          )}
        </button>
        <p className="text-center text-dark-500 text-xs mt-3">
          Cancel anytime • Billed via Telegram Stars
        </p>
      </div>
    </div>
  );
}
