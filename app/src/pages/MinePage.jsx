/**
 * MintIQ MinePage - COMPLETE VERSION
 * 
 * Features:
 * - Tap to mine with energy system
 * - Daily cap
 * - Floating numbers animation
 * - Elite 2x bonus
 */

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Zap, Battery, TrendingUp, Clock, Crown, Flame } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz } from '../utils/helpers';

export default function MinePage() {
  const { user, fetchUser } = useUserStore();
  const { showToast } = useUIStore();
  
  const [tapStats, setTapStats] = useState(null);
  const [isTapping, setIsTapping] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState([]);
  const [localTaps, setLocalTaps] = useState(0);
  const [localMined, setLocalMined] = useState(0);

  const isElite = user?.is_elite || user?.is_premium;

  useEffect(() => { 
    loadTapStatus(); 
  }, []);

  const loadTapStatus = async () => {
    try {
      const status = await api.get('/api/miniapp/tap/status');
      setTapStats(status);
      // Backend returns 'dailyMined', handle both field names
      setLocalMined(status?.dailyMined || status?.minedToday || 0);
    } catch (e) { 
      console.error(e);
      // Set defaults
      setTapStats({
        energy: 100,
        maxEnergy: 100,
        dailyMined: 0,
        dailyCap: 100,
        rewardPerTap: 0.1
      });
    }
  };

  const handleTap = useCallback(async (e) => {
    if (isTapping) return;
    
    const energy = tapStats?.energy || 0;
    const dailyCap = tapStats?.dailyCap || 100;
    
    if (energy <= 0) {
      showToast('Out of energy! Wait to refill', 'error');
      return;
    }
    
    if (localMined >= dailyCap) {
      showToast('Daily cap reached!', 'error');
      return;
    }
    
    telegram.hapticImpact('light');
    
    // Get tap position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate reward
    const baseReward = tapStats?.rewardPerTap || 0.1;
    const reward = isElite ? baseReward * 2 : baseReward;
    
    // Add floating number
    const id = Date.now() + Math.random();
    setFloatingNumbers(prev => [...prev, { id, x, y, value: reward }]);
    setTimeout(() => setFloatingNumbers(prev => prev.filter(n => n.id !== id)), 1000);
    
    // Update local state immediately
    setLocalTaps(prev => prev + 1);
    setLocalMined(prev => prev + reward);
    setTapStats(prev => ({
      ...prev,
      energy: Math.max(0, (prev?.energy || 0) - 1),
      dailyMined: (prev?.dailyMined || 0) + reward
    }));
    
    // Batch API calls every 5 taps
    if ((localTaps + 1) % 5 === 0) {
      setIsTapping(true);
      try {
        const response = await api.post('/api/miniapp/tap', { taps: 5 });
        if (response) {
          setTapStats(prev => ({
            ...prev,
            energy: response.energy ?? prev?.energy,
            dailyMined: response.dailyMined ?? prev?.dailyMined
          }));
          setLocalMined(response.dailyMined ?? localMined);
        }
      } catch (e) { 
        if (e.message?.includes('energy')) {
          showToast('Out of energy!', 'error');
        }
      } finally { 
        setIsTapping(false); 
        fetchUser(); 
      }
    }
  }, [isTapping, localTaps, tapStats, localMined, isElite]);

  const energy = tapStats?.energy || 0;
  const maxEnergy = tapStats?.maxEnergy || 100;
  const dailyCap = tapStats?.dailyCap || 100;
  const rewardPerTap = tapStats?.rewardPerTap || 0.1;
  const displayReward = isElite ? rewardPerTap * 2 : rewardPerTap;
  const miningProgress = Math.min((localMined / dailyCap) * 100, 100);
  const energyPercent = Math.min((energy / maxEnergy) * 100, 100);
  const canTap = energy > 0 && localMined < dailyCap;

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Header */}
      <div className="bg-dark-900 border-b border-white/5 px-4 py-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="text-orange-400" size={22} />
          Tap to Mine
        </h1>
        <p className="text-sm text-dark-400 mt-1">Tap the coin to earn SATZ</p>
      </div>

      <div className="px-4 pt-6">
        {/* Elite Banner */}
        {isElite && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-3 mb-4 flex items-center justify-center gap-2">
            <Crown size={16} className="text-yellow-400" />
            <span className="text-sm text-yellow-400 font-medium">Elite Active: 2x Mining Rewards!</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Today's Mining */}
          <div className="bg-dark-800 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-dark-400 text-xs mb-1">
              <TrendingUp size={14} />
              Today's Mining
            </div>
            <p className="text-xl font-bold text-white">{localMined.toFixed(1)} SATZ</p>
            <div className="h-1.5 bg-dark-700 rounded-full mt-2 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full" 
                style={{ width: `${miningProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-dark-500 mt-1">
              {dailyCap - localMined > 0 ? `${(dailyCap - localMined).toFixed(0)} left` : 'Cap reached!'}
            </p>
          </div>
          
          {/* Energy */}
          <div className="bg-dark-800 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 text-dark-400 text-xs mb-1">
              <Battery size={14} />
              Energy
            </div>
            <p className="text-xl font-bold text-white">{energy.toFixed(0)}/{maxEnergy}</p>
            <div className="h-1.5 bg-dark-700 rounded-full mt-2 overflow-hidden">
              <motion.div 
                className={`h-full rounded-full ${
                  energyPercent > 50 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  energyPercent > 20 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${energyPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-dark-500 mt-1">Refills over time</p>
          </div>
        </div>

        {/* Tap Area */}
        <div className="flex flex-col items-center">
          <motion.button
            whileTap={canTap ? { scale: 0.95 } : {}}
            onClick={handleTap}
            disabled={!canTap}
            className={`relative w-52 h-52 rounded-full flex items-center justify-center transition-all ${
              canTap 
                ? 'bg-gradient-to-br from-orange-500 to-yellow-500 shadow-lg shadow-orange-500/30 active:shadow-orange-500/50' 
                : 'bg-dark-700'
            }`}
          >
            {/* Floating numbers */}
            {floatingNumbers.map(num => (
              <motion.div
                key={num.id}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -60 }}
                transition={{ duration: 0.8 }}
                className="absolute text-white font-bold text-xl pointer-events-none"
                style={{ left: num.x - 20, top: num.y - 30 }}
              >
                +{num.value.toFixed(1)}
              </motion.div>
            ))}
            
            {/* Center Icon */}
            <div className="flex flex-col items-center">
              <Zap size={64} className={canTap ? 'text-white' : 'text-dark-500'} />
              {isElite && (
                <span className="mt-2 px-2 py-0.5 bg-white/20 rounded text-xs font-bold text-white">
                  2X
                </span>
              )}
            </div>
          </motion.button>

          {/* Status Text */}
          <p className="text-dark-400 text-sm mt-4">
            {canTap 
              ? `+${displayReward.toFixed(1)} SATZ per tap` 
              : energy <= 0 
                ? '⚡ Out of energy! Wait to refill' 
                : '🎉 Daily cap reached!'}
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-dark-800 rounded-2xl p-4 border border-white/5 mt-6">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <Clock size={16} className="text-orange-400" />
            How Mining Works
          </h3>
          <ul className="space-y-2 text-sm text-dark-400">
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              Tap the coin to mine SATZ
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              Each tap uses 1 energy point
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              Energy refills automatically over time
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400">•</span>
              Daily mining cap: {dailyCap} SATZ
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">★</span>
              <span className="text-yellow-400">Elite members get 2x rewards!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
