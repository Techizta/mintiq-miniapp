/**
 * MintIQ PremiumPage - COMPLETE VERSION
 * 
 * Features:
 * - Elite membership benefits
 * - Monthly/Yearly pricing
 * - Telegram Stars payment
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Crown, Zap, TrendingUp, Shield, Star, Gift, 
  CheckCircle, Sparkles, Users, Target
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';

const BENEFITS = [
  {
    icon: Target,
    title: 'Create Prediction Pools',
    description: 'Launch your own pools and let others predict',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  },
  {
    icon: TrendingUp,
    title: '5% Creator Fee',
    description: 'Earn from every bet placed in your pools',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  },
  {
    icon: Zap,
    title: '2x Mining Speed',
    description: 'Double rewards when tap mining',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20'
  },
  {
    icon: Shield,
    title: 'Priority Support',
    description: 'Get help faster with dedicated support',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  {
    icon: Star,
    title: 'Exclusive Badges',
    description: 'Show off your Elite status with unique badges',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20'
  },
  {
    icon: Gift,
    title: 'Early Access',
    description: 'Be first to try new features and pools',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20'
  }
];

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 100,
    period: '/month',
    savings: null
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 720,
    period: '/year',
    originalPrice: 1200,
    savings: '40% OFF'
  }
];

export default function PremiumPage() {
  const navigate = useNavigate();
  const { user, fetchUser } = useUserStore();
  const { showToast } = useUIStore();
  
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const isElite = user?.is_elite || user?.is_premium;

  const handleUpgrade = async () => {
    if (isElite) return;
    
    setIsUpgrading(true);
    telegram.hapticImpact('medium');

    try {
      const response = await api.post('/api/miniapp/premium/upgrade', {
        plan: selectedPlan,
        method: 'stars'
      });

      if (response?.invoiceUrl) {
        // Open Telegram Stars payment
        telegram.openInvoice(response.invoiceUrl, async (status) => {
          if (status === 'paid') {
            showToast('Welcome to Elite! 🎉', 'success');
            await fetchUser();
          }
        });
      } else if (response?.success) {
        showToast('Welcome to Elite! 🎉', 'success');
        await fetchUser();
      } else {
        showToast('Elite upgrade coming soon!', 'info');
      }
    } catch (e) {
      showToast(e.message || 'Upgrade failed', 'error');
    } finally {
      setIsUpgrading(false);
    }
  };

  const selectedPlanData = PLANS.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-yellow-500/10 to-dark-950 px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Elite Membership</h1>
        </div>

        {/* Hero */}
        <div className="text-center py-6">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/30"
          >
            <Crown size={40} className="text-black" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isElite ? 'You\'re Elite! 👑' : 'Become Elite'}
          </h2>
          <p className="text-dark-400 text-sm">
            {isElite 
              ? 'Enjoy all your exclusive benefits' 
              : 'Unlock exclusive features and earn more'}
          </p>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Benefits */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-yellow-400" />
            Elite Benefits
          </h3>
          <div className="space-y-3">
            {BENEFITS.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-dark-800 rounded-xl p-4 border border-white/5 flex items-center gap-4"
              >
                <div className={`w-12 h-12 ${benefit.bgColor} rounded-xl flex items-center justify-center`}>
                  <benefit.icon size={24} className={benefit.color} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{benefit.title}</p>
                  <p className="text-xs text-dark-400">{benefit.description}</p>
                </div>
                {isElite && (
                  <CheckCircle size={20} className="text-green-400" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pricing - Only show if not Elite */}
        {!isElite && (
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Star size={14} className="text-yellow-400" />
              Choose Your Plan
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {PLANS.map(plan => (
                <motion.button
                  key={plan.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { telegram.hapticSelection(); setSelectedPlan(plan.id); }}
                  className={`relative p-4 rounded-2xl border-2 transition-all ${
                    selectedPlan === plan.id 
                      ? 'bg-yellow-500/10 border-yellow-500' 
                      : 'bg-dark-800 border-white/10'
                  }`}
                >
                  {plan.savings && (
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 rounded-full text-[10px] font-bold text-black">
                      {plan.savings}
                    </span>
                  )}
                  <p className="font-semibold text-white mb-1">{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <Star size={14} className="text-yellow-400" />
                    <span className="text-2xl font-bold text-white">{plan.price}</span>
                  </div>
                  <p className="text-xs text-dark-400">{plan.period}</p>
                  {plan.originalPrice && (
                    <p className="text-xs text-dark-500 line-through mt-1">
                      ⭐{plan.originalPrice}
                    </p>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade Button */}
        {!isElite && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl font-bold text-lg text-black flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/30"
          >
            {isUpgrading ? (
              'Processing...'
            ) : (
              <>
                <Crown size={20} />
                Upgrade for ⭐{selectedPlanData?.price}
              </>
            )}
          </motion.button>
        )}

        {/* Already Elite */}
        {isElite && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-4 text-center">
            <CheckCircle size={32} className="text-yellow-400 mx-auto mb-2" />
            <p className="font-bold text-white">You're an Elite Member!</p>
            <p className="text-xs text-dark-400 mt-1">
              All benefits are active on your account
            </p>
          </div>
        )}

        {/* Trust Info */}
        <div className="text-center text-xs text-dark-500 pt-4">
          <p>Secure payment via Telegram Stars ⭐</p>
          <p className="mt-1">Cancel anytime • Instant activation</p>
        </div>
      </div>
    </div>
  );
}
