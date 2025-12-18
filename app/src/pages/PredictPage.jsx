import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, Users, TrendingUp, Flame, Filter } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import api from '../services/api';
import telegram from '../services/telegram';
import { formatSatz, formatTimeRemaining, calculateOdds } from '../utils/helpers';

export default function PredictPage() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  
  const [activeTab, setActiveTab] = useState('active');
  const [quests, setQuests] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (activeTab === 'mybets') {
      fetchPredictions();
    } else {
      fetchQuests();
    }
  }, [activeTab]);

  const fetchQuests = async () => {
    setIsLoading(true);
    try {
      const status = activeTab === 'resolved' ? 'resolved' : 'active';
      const response = await api.get(`/api/miniapp/quests?status=${status}&limit=50`);
      setQuests(response.quests || []);
    } catch (error) {
      console.error('Failed to fetch quests:', error);
      setQuests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPredictions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/miniapp/predictions');
      setPredictions(response.predictions || []);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestClick = (questId) => {
    telegram.hapticSelection();
    navigate(`/predict/${questId}`);
  };

  const tabs = [
    { id: 'active', label: 'Active', icon: Flame },
    { id: 'mybets', label: 'My Bets', icon: TrendingUp },
    { id: 'resolved', label: 'Resolved', icon: Clock },
  ];

  const categories = ['all', 'crypto', 'sports', 'entertainment', 'politics'];

  // Filter quests based on search and category
  const filteredQuests = quests.filter(q => {
    const matchesSearch = !searchQuery || q.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isExpired = (deadline) => new Date(deadline) <= new Date();

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      {/* Header */}
      <div className="bg-dark-900 border-b border-white/5 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white mb-4">Predictions</h1>
        
        {/* Tabs */}
        <div className="flex bg-dark-800 rounded-xl p-1 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                telegram.hapticSelection();
                setActiveTab(tab.id);
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                activeTab === tab.id
                  ? 'bg-mint-500 text-white'
                  : 'text-dark-400'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search - only for active/resolved */}
        {activeTab !== 'mybets' && (
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search predictions..."
              className="w-full bg-dark-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-dark-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-dark-800 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-dark-700 rounded w-1/4 mb-2" />
              <div className="h-5 bg-dark-700 rounded w-3/4 mb-3" />
              <div className="flex gap-2">
                <div className="flex-1 h-16 bg-dark-700 rounded-lg" />
                <div className="flex-1 h-16 bg-dark-700 rounded-lg" />
              </div>
            </div>
          ))
        ) : activeTab === 'mybets' ? (
          // My Bets View
          predictions.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp size={48} className="mx-auto mb-4 text-dark-600" />
              <p className="text-dark-400 font-medium">No bets yet</p>
              <p className="text-sm text-dark-500 mt-1">Place your first prediction!</p>
              <button
                onClick={() => setActiveTab('active')}
                className="mt-4 px-6 py-2 bg-mint-500 text-white rounded-xl font-medium"
              >
                Browse Quests
              </button>
            </div>
          ) : (
            predictions.map((pred) => {
              const questExpired = isExpired(pred.betting_deadline);
              const isWinner = pred.is_winner === true;
              const isLoser = pred.is_winner === false && pred.quest_status === 'resolved';
              
              return (
                <motion.div
                  key={pred.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleQuestClick(pred.quest_id)}
                  className="bg-dark-800 rounded-xl p-4 border border-white/5 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-dark-400 capitalize">{pred.category || 'crypto'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isWinner ? 'bg-green-500/20 text-green-400' :
                      isLoser ? 'bg-red-500/20 text-red-400' :
                      questExpired ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-mint-500/20 text-mint-400'
                    }`}>
                      {isWinner ? '🏆 Won' : isLoser ? 'Lost' : questExpired ? 'Pending' : 'Active'}
                    </span>
                  </div>
                  <h3 className="font-medium text-white mb-2">{pred.title}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-dark-400">Your bet: </span>
                      <span className="text-white font-medium">
                        {pred.chosen_option === 'a' ? pred.option_a : pred.option_b}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-dark-400">Amount: </span>
                      <span className="text-gold-400 font-medium">{formatSatz(pred.amount)}</span>
                    </div>
                  </div>
                  {isWinner && pred.payout > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/5 text-sm">
                      <span className="text-dark-400">Payout: </span>
                      <span className="text-green-400 font-bold">+{formatSatz(pred.payout)} SATZ</span>
                    </div>
                  )}
                </motion.div>
              );
            })
          )
        ) : (
          // Active/Resolved Quests View
          filteredQuests.length === 0 ? (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto mb-4 text-dark-600" />
              <p className="text-dark-400 font-medium">No quests found</p>
              <p className="text-sm text-dark-500 mt-1">
                {searchQuery ? 'Try a different search' : 'Check back soon for new predictions!'}
              </p>
            </div>
          ) : (
            filteredQuests.map((quest) => {
              const odds = calculateOdds(quest.pool_a, quest.pool_b);
              const totalPool = (Number(quest.pool_a) || 0) + (Number(quest.pool_b) || 0);
              const questExpired = isExpired(quest.betting_deadline);
              const isHot = (quest.participant_count || 0) > 5 || totalPool > 500;

              return (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleQuestClick(quest.id)}
                  className="bg-dark-800 rounded-xl p-4 border border-white/5 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-xs capitalize">
                        {quest.category || 'crypto'}
                      </span>
                      {isHot && !questExpired && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs flex items-center gap-1">
                          <Flame size={10} /> HOT
                        </span>
                      )}
                    </div>
                    <span className={`text-xs flex items-center gap-1 ${questExpired ? 'text-red-400' : 'text-dark-400'}`}>
                      <Clock size={12} />
                      {questExpired ? 'Ended' : formatTimeRemaining(quest.betting_deadline)}
                    </span>
                  </div>

                  <h3 className="font-medium text-white mb-3">{quest.title}</h3>

                  {/* Options */}
                  <div className="flex gap-2 mb-3">
                    <div className={`flex-1 p-3 rounded-lg ${questExpired ? 'bg-dark-700' : 'bg-mint-500/10 border border-mint-500/20'}`}>
                      <p className="text-sm text-white font-medium truncate">{quest.option_a || 'Yes'}</p>
                      <p className={`text-lg font-bold ${questExpired ? 'text-dark-400' : 'text-mint-400'}`}>{odds.a}%</p>
                    </div>
                    <div className={`flex-1 p-3 rounded-lg ${questExpired ? 'bg-dark-700' : 'bg-red-500/10 border border-red-500/20'}`}>
                      <p className="text-sm text-white font-medium truncate">{quest.option_b || 'No'}</p>
                      <p className={`text-lg font-bold ${questExpired ? 'text-dark-400' : 'text-red-400'}`}>{odds.b}%</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-dark-400">
                    <span className="flex items-center gap-1">
                      <TrendingUp size={14} /> {formatSatz(totalPool)} SATZ
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} /> {quest.participant_count || 0} players
                    </span>
                  </div>
                </motion.div>
              );
            })
          )
        )}
      </div>
    </div>
  );
}
