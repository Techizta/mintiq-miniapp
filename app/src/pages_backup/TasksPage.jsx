import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  ExternalLink,
  Clock,
  Gift,
  Loader2
} from 'lucide-react';
import { useEarnStore } from '../stores/earnStore';
import { useUserStore } from '../stores/userStore';
import { useUIStore } from '../stores/uiStore';
import telegram from '../services/telegram';
import { formatSatz, getTaskTypeIcon } from '../utils/helpers';

export default function TasksPage() {
  const [searchParams] = useSearchParams();
  const highlightTaskId = searchParams.get('task');
  const { tasks, isLoading, fetchTasks, startTask, verifyTask } = useEarnStore();
  const { addBalance } = useUserStore();
  const { showToast, showCelebration } = useUIStore();
  const [processingTask, setProcessingTask] = useState(null);
  const [taskTimers, setTaskTimers] = useState({});
  const taskRefs = useRef({});

  useEffect(() => {
    fetchTasks();
  }, []);

  // Scroll to highlighted task when loaded
  useEffect(() => {
    if (highlightTaskId && tasks.length > 0 && !isLoading) {
      setTimeout(() => {
        const taskElement = taskRefs.current[highlightTaskId];
        if (taskElement) {
          taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          telegram.hapticImpact('medium');
        }
      }, 300);
    }
  }, [highlightTaskId, tasks, isLoading]);

  const handleStartTask = async (task) => {
    telegram.hapticImpact('light');
    setProcessingTask(task.id);

    try {
      await startTask(task.id);

      // Open the target based on task type
      if (task.task_type === 'channel_join') {
        telegram.openTelegramLink(`https://t.me/${task.target_channel.replace('@', '')}`);
      } else if (task.task_type === 'website_visit') {
        telegram.openLink(task.target_url);
        // Start timer for website visit
        setTaskTimers(prev => ({
          ...prev,
          [task.id]: task.required_seconds || 30
        }));

        const interval = setInterval(() => {
          setTaskTimers(prev => {
            const remaining = (prev[task.id] || 0) - 1;
            if (remaining <= 0) {
              clearInterval(interval);
              return { ...prev, [task.id]: 0 };
            }
            return { ...prev, [task.id]: remaining };
          });
        }, 1000);
      } else if (task.task_type === 'twitter_follow') {
        telegram.openLink(task.target_url);
      }

      // Small delay before allowing verification
      setTimeout(() => setProcessingTask(null), 2000);
    } catch (error) {
      showToast(error.message || 'Failed to start task', 'error');
      setProcessingTask(null);
    }
  };

  const handleVerifyTask = async (task) => {
    telegram.hapticImpact('medium');
    setProcessingTask(task.id);

    try {
      const result = await verifyTask(task.id);

      if (result.success) {
        addBalance(task.user_reward_satz);
        telegram.hapticNotification('success');
        showCelebration('win', { amount: task.user_reward_satz });
        showToast(`+${formatSatz(task.user_reward_satz)} SATZ earned!`, 'success');
      } else {
        showToast(result.message || 'Verification failed. Please complete the task first.', 'warning');
      }
    } catch (error) {
      telegram.hapticNotification('error');
      showToast(error.message || 'Verification failed', 'error');
    } finally {
      setProcessingTask(null);
    }
  };

  const availableTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 py-4 bg-dark-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Available Tasks</h2>
            <p className="text-sm text-dark-400">{availableTasks.length} tasks available</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-dark-400">Completed</p>
            <p className="text-lg font-bold text-success">{completedTasks.length}</p>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="px-4 py-2 space-y-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-dark-700 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-dark-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-dark-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : availableTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-white mb-2">All caught up!</h3>
            <p className="text-dark-400">Check back later for new tasks.</p>
          </div>
        ) : (
          <AnimatePresence>
            {availableTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                isProcessing={processingTask === task.id}
                timer={taskTimers[task.id]}
                onStart={() => handleStartTask(task)}
                onVerify={() => handleVerifyTask(task)}
                isHighlighted={String(task.id) === String(highlightTaskId)}
                ref={(el) => { taskRefs.current[task.id] = el; }}
              />
            ))}
          </AnimatePresence>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-dark-400 mb-3">Completed</h3>
            {completedTasks.map((task) => (
              <div key={task.id} className="card p-4 opacity-60 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                    <CheckCircle size={24} className="text-success" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{task.name}</h4>
                    <p className="text-sm text-dark-400">+{formatSatz(task.user_reward_satz)} SATZ earned</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { forwardRef } from 'react';

const TaskCard = forwardRef(function TaskCard({ task, index, isProcessing, timer, onStart, onVerify, isHighlighted }, ref) {
  const canVerify = timer === 0 || timer === undefined;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className={`card p-4 ${isHighlighted ? 'ring-2 ring-mint-500 bg-mint-500/10' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-mint-500/20 flex items-center justify-center text-2xl">
          {getTaskTypeIcon(task.task_type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white mb-1">{task.name}</h4>
          <p className="text-sm text-dark-400 mb-2 line-clamp-2">{task.description}</p>

          {/* Reward */}
          <div className="flex items-center gap-2">
            <Gift size={14} className="text-gold-400" />
            <span className="text-gold-400 font-semibold">
              +{formatSatz(task.user_reward_satz)} SATZ
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-2">
          {timer !== undefined && timer > 0 ? (
            <div className="flex items-center gap-1 text-warning">
              <Clock size={16} />
              <span className="text-sm font-medium">{timer}s</span>
            </div>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onStart}
                disabled={isProcessing}
                className="btn-sm bg-dark-700 text-white"
              >
                {isProcessing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <ExternalLink size={14} />
                    Start
                  </>
                )}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onVerify}
                disabled={isProcessing || !canVerify}
                className="btn-sm bg-success text-white disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Verify'
                )}
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
});
