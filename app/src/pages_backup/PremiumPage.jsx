import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crown, Check, Bitcoin, Zap, Shield,
  Star, ArrowLeft, Gift, TrendingUp, Copy, ExternalLink, Loader2
} from 'lucide-react';
import api from '../services/api';
import telegram from '../services/telegram';
import { useUserStore } from '../stores/userStore';
import { copyToClipboard } from '../utils/helpers';

export default function PremiumPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const benefits = [
    { icon: Bitcoin, title: '600 SATZ Weekly', desc: '~2,400 SATZ/month ($2.50 value)', highlight: true },
    { icon: Zap, title: '2x Daily Bonus', desc: '10 SATZ vs 5 SATZ daily login' },
    { icon: Shield, title: 'Ad-Free Experience', desc: 'No interruptions, pure predictions' },
    { icon: Star, title: 'Exclusive Predictions', desc: 'Premium-only high-stakes quests' },
    { icon: Gift, title: 'Extra Spin', desc: '2 daily spins vs 1 for free users' },
    { icon: TrendingUp, title: 'Priority Withdrawals', desc: 'Faster BTC withdrawals' },
  ];

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      telegram.hapticImpact('medium');

      const result = await api.post('/api/miniapp/premium/subscribe', {
        currency: 'usdtbsc'
      });

      if (result.payAddress) {
        setPaymentData(result);
        telegram.hapticNotification('success');
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

  const handleCopyAddress = async () => {
    if (paymentData?.payAddress) {
      const success = await copyToClipboard(paymentData.payAddress);
      if (success) {
        setCopied(true);
        telegram.hapticNotification('success');
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData?.orderId) return;
    
    setCheckingPayment(true);
    try {
      const result = await api.get(`/api/miniapp/premium/payment/${paymentData.orderId}`);
      
      if (result.status === 'completed' || result.isPremium) {
        telegram.hapticNotification('success');
        refreshUser();
        navigate('/earn');
      } else {
        telegram.hapticNotification('warning');
        alert('Payment not yet confirmed. Please wait a few minutes and try again.');
      }
    } catch (error) {
      alert('Failed to check payment status');
    } finally {
      setCheckingPayment(false);
    }
  };

  // Payment pending view
  if (paymentData) {
    return (
      <div className="min-h-screen bg-dark-950 pb-40">
        <div className="sticky top-0 bg-dark-950/95 backdrop-blur-sm z-10 px-4 py-3 flex items-center gap-3 border-b border-white/5">
          <button onClick={() => setPaymentData(null)} className="p-2 -ml-2 text-dark-400 hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-white">Complete Payment</h1>
        </div>

        <div className="p-4 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-orange-500/20 to-yellow-500/10 border border-orange-500/30 rounded-2xl p-6 text-center"
          >
            <Bitcoin size={48} className="text-orange-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Send USDT (BEP20)</h2>
            <p className="text-dark-300 text-sm mb-4">
              Send exactly the amount below to activate Premium
            </p>
            
            <div className="bg-black/30 rounded-xl p-4 mb-4">
              <p className="text-dark-400 text-xs mb-1">Amount to send</p>
              <p className="text-2xl font-bold text-orange-400">
                {paymentData.payAmount} {paymentData.payCurrency?.toUpperCase()}
              </p>
              <p className="text-dark-500 text-sm">≈ $4.99 USD</p>
            </div>

            <div className="bg-black/30 rounded-xl p-4 mb-4">
              <p className="text-dark-400 text-xs mb-2">Send to this address</p>
              <p className="text-white text-sm font-mono break-all mb-3">
                {paymentData.payAddress}
              </p>
              <button
                onClick={handleCopyAddress}
                className="w-full py-2 bg-orange-500/20 text-orange-400 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy Address'}
              </button>
            </div>

            <div className="text-dark-400 text-xs mb-4">
              <p>⏱️ Payment expires in ~20 minutes</p>
              <p className="mt-1">Confirmations required: 1</p>
            </div>

            <button
              onClick={checkPaymentStatus}
              disabled={checkingPayment}
              className="w-full py-4 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              {checkingPayment ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Check size={20} />
                  I've Sent the Payment
                </>
              )}
            </button>
          </motion.div>

          <div className="bg-dark-800 rounded-xl p-4">
            <h3 className="font-medium text-white mb-2">💡 How it works</h3>
            <ol className="text-dark-400 text-sm space-y-2">
              <li>1. Copy the USDT BEP20 address above</li>
              <li>2. Send exactly {paymentData.payAmount} USDT from your wallet</li>
              <li>3. Wait for 1 network confirmation (~10 min)</li>
              <li>4. Click "I've Sent the Payment" to check status</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 pb-40">
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
            Stack more SATZ, enjoy premium perks
          </p>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl font-bold text-white">$4.99</span>
            <span className="text-dark-400">/month</span>
          </div>
          <p className="text-yellow-400 text-sm">
            Get ~2,850 SATZ/month ($3+ value) for just $4.99!
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

      {/* Payment Methods */}
      <div className="px-4 mt-6">
        <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wide mb-3">Payment</h3>
        <div className="bg-dark-800 rounded-xl p-4 flex items-center gap-3">
          <Bitcoin size={24} className="text-orange-400" />
          <div className="flex-1">
            <p className="text-white font-medium">Pay with USDT (BEP20)</p>
            <p className="text-dark-400 text-sm">Secure crypto payment via NOWPayments</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-dark-950 via-dark-950 to-transparent">
        <button
          onClick={handleSubscribe}
          disabled={isLoading || user?.is_premium}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            user?.is_premium
              ? 'bg-dark-700 text-dark-400'
              : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40'
          }`}
        >
          {isLoading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : user?.is_premium ? (
            '✓ Already Premium'
          ) : (
            <>
              <Bitcoin size={20} />
              Subscribe for $4.99/month
            </>
          )}
        </button>
        <p className="text-center text-dark-500 text-xs mt-3">
          Secure payment • Instant activation after confirmation
        </p>
      </div>
    </div>
  );
}
