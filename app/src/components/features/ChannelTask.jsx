/**
 * ChannelTask Component
 * Join community channel task with bonus claim
 */

import React, { useState, useEffect } from 'react';
import { engagementService } from '../../services/engagement';

export const ChannelTask = ({ onClaim, className = '' }) => {
  const [status, setStatus] = useState({ isMember: false, hasClaimed: false });
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const BONUS_AMOUNT = 100;
  const CHANNEL_NAME = '@MintIQCommunity';

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const data = await engagementService.checkChannelStatus();
      setStatus(data);
    } catch (err) {
      console.error('Failed to check channel status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    engagementService.openChannel();
  };

  const handleVerify = async () => {
    setChecking(true);
    setError(null);

    try {
      const data = await engagementService.checkChannelStatus();
      setStatus(data);
      
      if (!data.isMember) {
        setError('Please join the channel first');
      }
    } catch (err) {
      setError('Failed to verify membership');
    } finally {
      setChecking(false);
    }
  };

  const handleClaim = async () => {
    setClaiming(true);
    setError(null);

    try {
      const result = await engagementService.claimChannelBonus();
      setSuccess(true);
      setStatus(prev => ({ ...prev, hasClaimed: true }));
      onClaim?.(result);
    } catch (err) {
      setError(err.message || 'Failed to claim bonus');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white/5 rounded-xl p-4 animate-pulse h-24 ${className}`} />
    );
  }

  // Already claimed
  if (status.hasClaimed) {
    return (
      <div className={`bg-green-500/10 border border-green-500/30 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white">Channel Joined</h4>
            <p className="text-sm text-green-400">+{BONUS_AMOUNT} SATZ claimed!</p>
          </div>
        </div>
      </div>
    );
  }

  // Success animation
  if (success) {
    return (
      <div className={`bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 
        rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce">
            <span className="text-2xl">🎉</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white">Bonus Claimed!</h4>
            <p className="text-sm text-green-400">+{BONUS_AMOUNT} SATZ added to your balance</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 
      rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">📢</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-white">Join Community</h4>
            <span className="px-2 py-0.5 bg-yellow-500/20 rounded-full text-xs text-yellow-400">
              +{BONUS_AMOUNT} SATZ
            </span>
          </div>
          <p className="text-sm text-white/60 mb-3">
            Join {CHANNEL_NAME} for updates, tips & exclusive predictions
          </p>

          {error && (
            <p className="text-sm text-red-400 mb-2">{error}</p>
          )}

          <div className="flex gap-2">
            {!status.isMember ? (
              <>
                <button
                  onClick={handleJoin}
                  className="flex-1 py-2 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium
                    hover:bg-blue-400 transition-colors"
                >
                  Join Channel
                </button>
                <button
                  onClick={handleVerify}
                  disabled={checking}
                  className="py-2 px-4 rounded-lg bg-white/10 text-white text-sm font-medium
                    hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  {checking ? 'Checking...' : 'Verify'}
                </button>
              </>
            ) : (
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 
                  text-black text-sm font-bold hover:from-yellow-400 hover:to-orange-400 
                  transition-all disabled:opacity-50"
              >
                {claiming ? 'Claiming...' : `Claim ${BONUS_AMOUNT} SATZ`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelTask;
