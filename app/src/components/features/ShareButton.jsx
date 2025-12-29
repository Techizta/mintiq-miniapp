/**
 * ShareButton Component
 * Social sharing functionality with tracking
 */

import React, { useState } from 'react';
import { engagementService } from '../../services/engagement';

export const ShareButton = ({ 
  type = 'referral',
  data = {},
  size = 'md',
  variant = 'primary',
  className = '',
  children,
  onShare,
}) => {
  const [sharing, setSharing] = useState(false);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-400 hover:to-purple-400',
    secondary: 'bg-white/10 text-white hover:bg-white/20',
    ghost: 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10',
  };

  const handleShare = async () => {
    setSharing(true);
    
    try {
      engagementService.shareToTelegram(type, data);
      onShare?.({ type, data });
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setTimeout(() => setSharing(false), 1000);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={sharing}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-medium
        transition-all disabled:opacity-50
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {sharing ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Sharing...
        </>
      ) : (
        children || (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            Share
          </>
        )
      )}
    </button>
  );
};

export const ShareWinButton = ({ 
  amount, 
  questTitle, 
  questId,
  referralCode,
  className = '' 
}) => {
  return (
    <ShareButton
      type="win"
      data={{ amount, questTitle, referenceId: questId, referralCode }}
      variant="primary"
      className={className}
    >
      <span className="text-lg">🏆</span>
      Share Win
    </ShareButton>
  );
};

export const ShareStreakButton = ({ 
  days, 
  referralCode,
  className = '' 
}) => {
  return (
    <ShareButton
      type="streak"
      data={{ days, referralCode }}
      variant="secondary"
      className={className}
    >
      <span className="text-lg">🔥</span>
      Share Streak
    </ShareButton>
  );
};

export const InviteFriendButton = ({ 
  referralCode, 
  size = 'md',
  className = '' 
}) => {
  return (
    <ShareButton
      type="referral"
      data={{ referralCode }}
      size={size}
      variant="primary"
      className={className}
    >
      <span className="text-lg">👥</span>
      Invite Friends
    </ShareButton>
  );
};

// Floating Share Action Button
export const FloatingShareButton = ({ 
  type = 'referral',
  data = {},
  position = 'bottom-right'
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-24 right-4',
    'bottom-left': 'bottom-24 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-40`}>
      <ShareButton
        type={type}
        data={data}
        className="w-14 h-14 rounded-full shadow-lg shadow-blue-500/30 !p-0"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
        </svg>
      </ShareButton>
    </div>
  );
};

export default ShareButton;
