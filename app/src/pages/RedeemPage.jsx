import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bitcoin, 
  ArrowRight, 
  AlertCircle,
  Check,
  Loader2,
  Info
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz, formatBTC, isValidBTCAddress } from '../utils/helpers';
import { LIMITS, FEES } from '../utils/constants';

export default function RedeemPage() {
  const { user, deductBalance } = useUserStore();
  const { showToast } = useUIStore();
  
  const [amount, setAmount] = useState('');
  const [btcAddress, setBtcAddress] = useState('');
  const [redemptionInfo, setRedemptionInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [step, setStep] = useState(1);

  const balance = user?.satz_balance || 0;
  const minRedemption = LIMITS.MIN_REDEMPTION;
  const canRedeem = balance >= minRedemption;

  useEffect(() => {
    fetchRedemptionInfo();
  }, []);

  useEffect(() => {
    if (amount && parseInt(amount) >= minRedemption) {
      calculateRedemption();
    }
  }, [amount]);

  const fetchRedemptionInfo = async () => {
    try {
      const response = await api.getRedemptionInfo();
      setRedemptionInfo(response);
    } catch (error) {
      console.error('Failed to fetch redemption info:', error);
      // Mock data
      setRedemptionInfo({
        rate: 0.00000564,
        minAmount: 100000,
        feePercent: 2,
        estimatedTime: '24-72 hours',
      });
    }
  };

  const calculateRedemption = async () => {
    setIsCalculating(true);
    // Simulate calculation
    await new Promise(r => setTimeout(r, 300));
    setIsCalculating(false);
  };

  const getSatoshisForSatz = (satzAmount) => {
    if (!redemptionInfo?.rate || !satzAmount) return 0;
    return Math.floor(satzAmount * redemptionInfo.rate * 100000000);
  };

  const getNetSatoshis = (satzAmount) => {
    const gross = getSatoshisForSatz(satzAmount);
    const fee = Math.floor(gross * (redemptionInfo?.feePercent || 2) / 100);
    return gross - fee;
  };

  const handleAmountChange = (value) => {
    const cleaned = value.replace(/\D/g, '');
    setAmount(cleaned);
  };

  const handleMaxAmount = () => {
    telegram.hapticImpact('light');
    setAmount(balance.toString());
  };

  const handleContinue = () => {
    const amountNum = parseInt(amount);
    
    if (!amountNum || amountNum < minRedemption) {
      showToast(`Minimum redemption is ${formatSatz(minRedemption)} SATZ`, 'error');
      return;
    }

    if (amountNum > balance) {
      showToast('Insufficient balance', 'error');
      return;
    }

    telegram.hapticImpact('medium');
    setStep(2);
  };

  const handleConfirmRedemption = async () => {
    if (!isValidBTCAddress(btcAddress)) {
      showToast('Please enter a valid BTC address', 'error');
      return;
    }

    setIsLoading(true);
    telegram.hapticImpact('medium');

    try {
      await api.requestRedemption({
        amount: parseInt(amount),
        btcAddress,
      });

      deductBalance(parseInt(amount));
      telegram.hapticNotification('success');
      setStep(3);
    } catch (error) {
      showToast(error.message || 'Redemption failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const amountNum = parseInt(amount) || 0;
  const netSatoshis = getNetSatoshis(amountNum);
  const btcAmount = netSatoshis / 100000000;

  return (
    <div className="pb-4">
      {/* Balance card */}
      <div className="px-4 pt-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Available Balance</p>
              <p className="text-2xl font-bold text-gradient-gold">{formatSatz(balance)} SATZ</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              canRedeem ? 'bg-success/20 text-success' : 'bg-dark-700 text-dark-400'
            }`}>
              {canRedeem ? 'Eligible' : 'Need more SATZ'}
            </div>
          </div>
        </motion.div>
      </div>

      {!canRedeem ? (
        <div className="px-4">
          <div className="card p-6 text-center">
            <AlertCircle size={48} className="mx-auto text-warning mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Not Eligible Yet</h3>
            <p className="text-dark-400 mb-4">
              You need at least {formatSatz(minRedemption)} SATZ to redeem.
            </p>
            <p className="text-sm text-dark-500">
              Keep earning through predictions, tasks, and referrals!
            </p>
          </div>
        </div>
      ) : (
        <div className="px-4">
          {/* Step 1: Enter amount */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="card p-4">
                <label className="block text-sm text-dark-400 mb-2">Amount to redeem</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={`Min. ${formatSatz(minRedemption)}`}
                    value={amount ? formatSatz(parseInt(amount)) : ''}
                    onChange={(e) => handleAmountChange(e.target.value.replace(/,/g, ''))}
                    className="input text-2xl font-bold pr-20"
                  />
                  <button
                    onClick={handleMaxAmount}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mint-400 text-sm font-medium"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Conversion preview */}
              {amountNum >= minRedemption && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card bg-btc/10 border-btc/30 p-4"
                >
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-dark-400 mb-1">You send</p>
                      <p className="text-xl font-bold text-white">{formatSatz(amountNum)} SATZ</p>
                    </div>
                    <ArrowRight className="text-dark-400" />
                    <div className="text-center">
                      <p className="text-sm text-dark-400 mb-1">You receive</p>
                      <p className="text-xl font-bold text-btc">₿ {btcAmount.toFixed(8)}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-dark-400">Gross amount</span>
                      <span className="text-white">{getSatoshisForSatz(amountNum).toLocaleString()} sats</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Network fee ({redemptionInfo?.feePercent}%)</span>
                      <span className="text-danger">-{(getSatoshisForSatz(amountNum) - netSatoshis).toLocaleString()} sats</span>
                    </div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex justify-between font-medium">
                      <span className="text-white">Net amount</span>
                      <span className="text-btc">{netSatoshis.toLocaleString()} sats</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <button
                onClick={handleContinue}
                disabled={amountNum < minRedemption}
                className="btn-primary w-full"
              >
                Continue
              </button>

              <div className="flex items-start gap-2 p-3 bg-dark-800 rounded-xl">
                <Info size={16} className="text-dark-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-dark-400">
                  Redemptions are processed within {redemptionInfo?.estimatedTime}. 
                  Redeemed SATZ is permanently burned.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 2: Enter BTC address */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="card p-4">
                <label className="block text-sm text-dark-400 mb-2">BTC Address</label>
                <input
                  type="text"
                  placeholder="bc1q... or 1... or 3..."
                  value={btcAddress}
                  onChange={(e) => setBtcAddress(e.target.value.trim())}
                  className="input font-mono text-sm"
                />
                {btcAddress && !isValidBTCAddress(btcAddress) && (
                  <p className="text-danger text-sm mt-2">Invalid BTC address format</p>
                )}
              </div>

              <div className="card p-4">
                <h4 className="font-medium text-white mb-3">Redemption Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-400">Amount</span>
                    <span className="text-white">{formatSatz(amountNum)} SATZ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">You receive</span>
                    <span className="text-btc font-medium">₿ {btcAmount.toFixed(8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-400">Processing time</span>
                    <span className="text-white">{redemptionInfo?.estimatedTime}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                  Back
                </button>
                <button
                  onClick={handleConfirmRedemption}
                  disabled={isLoading || !isValidBTCAddress(btcAddress)}
                  className="btn-gold flex-1"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Bitcoin size={18} />
                      Confirm Redemption
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-success" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Redemption Submitted!</h3>
              <p className="text-dark-400 mb-4">
                Your {formatSatz(amountNum)} SATZ is being converted to ₿ {btcAmount.toFixed(8)}
              </p>
              <p className="text-sm text-dark-500 mb-6">
                Expected delivery: {redemptionInfo?.estimatedTime}
              </p>
              <button
                onClick={() => {
                  setStep(1);
                  setAmount('');
                  setBtcAddress('');
                }}
                className="btn-secondary"
              >
                Done
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
