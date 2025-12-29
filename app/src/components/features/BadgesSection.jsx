/**
 * BadgesSection Component
 * Displays earned and available badges/achievements
 */

import React, { useState, useEffect } from 'react';
import { engagementService } from '../../services/engagement';

const BadgeCard = ({ badge, earned = false, onClick }) => {
  return (
    <div
      onClick={() => onClick?.(badge)}
      className={`relative p-3 rounded-xl border transition-all cursor-pointer
        ${earned 
          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 hover:border-yellow-500/50' 
          : 'bg-white/5 border-white/10 hover:border-white/20 opacity-60'
        }`}
    >
      <div className="text-center">
        <div className={`text-3xl mb-2 ${earned ? '' : 'grayscale'}`}>
          {badge.icon || '🏆'}
        </div>
        <h4 className={`text-sm font-semibold truncate ${earned ? 'text-white' : 'text-white/50'}`}>
          {badge.name}
        </h4>
        {earned && badge.earnedAt && (
          <p className="text-xs text-yellow-400 mt-1">
            {new Date(badge.earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {earned && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full 
          flex items-center justify-center border-2 border-gray-900">
          <span className="text-xs">✓</span>
        </div>
      )}
    </div>
  );
};

const BadgeDetailModal = ({ badge, earned, onClose }) => {
  if (!badge) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-2xl p-6 w-full max-w-xs border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <div className={`text-6xl mb-4 ${earned ? '' : 'grayscale'}`}>
            {badge.icon || '🏆'}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{badge.name}</h3>
          <p className="text-white/70 text-sm mb-4">{badge.description}</p>
          
          {badge.requirement && (
            <div className="bg-white/5 rounded-lg p-3 mb-4">
              <p className="text-xs text-white/50 mb-1">Requirement</p>
              <p className="text-sm text-white">{badge.requirement}</p>
            </div>
          )}

          {earned ? (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-400 text-sm font-medium">
                ✅ Earned {badge.earnedAt ? `on ${new Date(badge.earnedAt).toLocaleDateString()}` : ''}
              </p>
            </div>
          ) : (
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/50 text-sm">
                🔒 Not yet earned
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl bg-white/10 text-white font-medium
            hover:bg-white/20 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export const BadgesSection = ({ 
  showAll = false, 
  maxDisplay = 6,
  className = '' 
}) => {
  const [badges, setBadges] = useState({ earned: [], available: [] });
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showAllBadges, setShowAllBadges] = useState(showAll);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const data = await engagementService.getBadges();
      setBadges(data);
    } catch (err) {
      console.error('Failed to fetch badges:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const earnedBadges = badges.earned || [];
  const availableBadges = badges.available || [];
  const allBadges = [
    ...earnedBadges.map(b => ({ ...b, earned: true })),
    ...availableBadges.map(b => ({ ...b, earned: false })),
  ];

  const displayBadges = showAllBadges ? allBadges : allBadges.slice(0, maxDisplay);
  const hasMore = allBadges.length > maxDisplay;

  if (allBadges.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-white/50">No badges available yet</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏅</span>
          <h3 className="font-semibold text-white">Achievements</h3>
          <span className="px-2 py-0.5 bg-yellow-500/20 rounded-full text-xs text-yellow-400">
            {earnedBadges.length}/{allBadges.length}
          </span>
        </div>
        {hasMore && !showAllBadges && (
          <button
            onClick={() => setShowAllBadges(true)}
            className="text-sm text-yellow-400 hover:text-yellow-300"
          >
            View All
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
            style={{ width: `${(earnedBadges.length / allBadges.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-3 gap-3">
        {displayBadges.map((badge, index) => (
          <BadgeCard
            key={badge.id || index}
            badge={badge}
            earned={badge.earned}
            onClick={() => setSelectedBadge(badge)}
          />
        ))}
      </div>

      {/* Show Less Button */}
      {showAllBadges && hasMore && (
        <button
          onClick={() => setShowAllBadges(false)}
          className="w-full mt-4 py-2 text-sm text-white/50 hover:text-white/70"
        >
          Show Less
        </button>
      )}

      {/* Detail Modal */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          earned={selectedBadge.earned}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};

export default BadgesSection;
