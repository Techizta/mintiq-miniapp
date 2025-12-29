/**
 * ActivityFeed Component
 * Shows live activity feed for FOMO/social proof
 */

import React, { useState, useEffect, useCallback } from 'react';
import { engagementService } from '../../services/engagement';

const ActivityItem = ({ activity, onClick }) => {
  const getActivityStyle = () => {
    if (activity.highlight) {
      return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
    }
    return 'bg-white/5 border-white/10';
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border ${getActivityStyle()} 
        transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
      onClick={() => onClick?.(activity)}
    >
      <div className="text-2xl flex-shrink-0">{activity.emoji}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">
          <span className="font-semibold text-yellow-400">{activity.username}</span>
          {' '}
          <span className="text-white/80">{activity.description}</span>
        </p>
        {activity.amount && (
          <p className="text-xs text-green-400 font-medium">
            +{engagementService.formatSatz(activity.amount)} SATZ
          </p>
        )}
      </div>
      <div className="text-xs text-white/40 flex-shrink-0">
        {engagementService.formatTimeAgo(activity.timestamp)}
      </div>
    </div>
  );
};

const QuickStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      <div className="bg-white/5 rounded-lg p-2 text-center">
        <div className="text-lg font-bold text-green-400">{stats.wins24h || 0}</div>
        <div className="text-xs text-white/50">Wins Today</div>
      </div>
      <div className="bg-white/5 rounded-lg p-2 text-center">
        <div className="text-lg font-bold text-yellow-400">
          {engagementService.formatSatz(stats.won24h)}
        </div>
        <div className="text-xs text-white/50">SATZ Won</div>
      </div>
      <div className="bg-white/5 rounded-lg p-2 text-center">
        <div className="text-lg font-bold text-blue-400">{stats.activeNow || 0}</div>
        <div className="text-xs text-white/50">Online</div>
      </div>
      <div className="bg-white/5 rounded-lg p-2 text-center">
        <div className="text-lg font-bold text-purple-400">
          {engagementService.formatSatz(stats.totalUsers)}
        </div>
        <div className="text-xs text-white/50">Players</div>
      </div>
    </div>
  );
};

export const ActivityFeed = ({ 
  limit = 5, 
  showStats = true, 
  autoRefresh = true,
  refreshInterval = 30000,
  onActivityClick,
  className = ''
}) => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ wins24h: 0, won24h: 0, activeNow: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      const [activityData, statsData] = await Promise.all([
        engagementService.getActivity(limit, forceRefresh),
        showStats ? engagementService.getQuickStats(forceRefresh) : Promise.resolve(stats),
      ]);

      setActivities(activityData.activities || []);
      if (showStats) {
        setStats(statsData);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch activity:', err);
      setError('Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [limit, showStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {showStats && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-2 h-14 animate-pulse" />
            ))}
          </div>
        )}
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-xl h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error && activities.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-white/50">{error}</p>
        <button
          onClick={() => fetchData(true)}
          className="mt-2 text-yellow-400 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      {showStats && <QuickStats stats={stats} />}
      
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
          🔴 Live Activity
        </h3>
        <button
          onClick={() => fetchData(true)}
          className="text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-2">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <ActivityItem
              key={activity.id || index}
              activity={activity}
              onClick={onActivityClick}
            />
          ))
        ) : (
          <div className="text-center py-6 text-white/50">
            <p>No recent activity</p>
            <p className="text-xs mt-1">Be the first to make a prediction!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
