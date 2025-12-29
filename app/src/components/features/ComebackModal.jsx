/**
 * ComebackModal Component
 * Shows welcome back bonus for returning users
 */

import React, { useState, useEffect } from 'react';
import { engagementService } from '../../services/engagement';

export const ComebackModal = ({ onClose, onClaim }) => {
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkEligibility();
  }, []);

  const checkEligibility = async () => {
    try {
      const data = await engagementService.checkComebackEligibility();
      setEligibility(data);
      if (!data.eligible) {
        // Not eligible, close modal
        onClose?.();
      }
    } catch (err) {
      console.error('Failed to check comeback eligibility:', err);
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    setClaiming(true);
    setError(null);

    try {
      const result = await engagementService.claimComebackBonus();
      setClaimed(true);
      onClaim?.(result);
      
      // Auto close after celebration
      setTimeout(() => {
        onClose?.();
      }, 3000);
    } catch (err) {
      console.error('Failed to claim comeback:', err);
      setError(err.message || 'Failed to claim bonus');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!eligibility?.eligible) {
    return null;
  }

  const bonusAmount = eligibility.bonusAmount || 100;
  const daysAway = eligibility.daysAway || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-6 w-full max-w-sm 
        border border-yellow-500/30 shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {!claimed ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome Back!
              </h2>
              <p className="text-white/70">
                We missed you! It's been {daysAway} day{daysAway !== 1 ? 's' : ''} since your last visit.
              </p>
            </div>

            {/* Bonus Display */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 mb-6 
              border border-yellow-500/30">
              <div className="text-center">
                <p className="text-sm text-yellow-400 mb-1">Comeback Bonus</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-white">+{bonusAmount}</span>
                  <span className="text-xl text-yellow-400">SATZ</span>
                </div>
              </div>
            </div>

            {/* Message */}
            <p className="text-center text-white/60 text-sm mb-6">
              Claim your comeback bonus and get back in the game! 
              New predictions are waiting for you.
            </p>

            {/* Error */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4 text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium
                  hover:bg-white/20 transition-colors"
              >
                Later
              </button>
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 
                  text-black font-bold hover:from-yellow-400 hover:to-orange-400 
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {claiming ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Claiming...
                  </span>
                ) : (
                  'Claim Bonus!'
                )}
              </button>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-4">
            <div className="text-6xl mb-4">🎊</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Bonus Claimed!
            </h2>
            <div className="text-3xl font-bold text-green-400 mb-4">
              +{bonusAmount} SATZ
            </div>
            <p className="text-white/70">
              Good luck with your predictions!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Hook to manage comeback modal state
export const useComebackModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only check once per session
    if (hasChecked) return;
    
    const checkComeback = async () => {
      try {
        const data = await engagementService.checkComebackEligibility();
        if (data.eligible) {
          setShowModal(true);
        }
      } catch (err) {
        console.error('Comeback check failed:', err);
      }
      setHasChecked(true);
    };

    // Small delay to let app initialize
    const timer = setTimeout(checkComeback, 1500);
    return () => clearTimeout(timer);
  }, [hasChecked]);

  return {
    showModal,
    closeModal: () => setShowModal(false),
  };
};

export default ComebackModal;
