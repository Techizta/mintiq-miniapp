import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Globe, 
  Shield, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  LogOut,
  Trash2,
  MessageCircle
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import telegram from '../services/telegram';
import api from '../services/api';

export default function SettingsPage() {
  const { user, updateUser } = useUserStore();
  const { logout } = useAuthStore();
  const { showToast, openModal } = useUIStore();
  
  const [notifications, setNotifications] = useState(user?.notifications_enabled ?? true);
  const [winBroadcasts, setWinBroadcasts] = useState(user?.win_broadcasts_enabled ?? true);

  const handleNotificationToggle = async () => {
    const newValue = !notifications;
    setNotifications(newValue);
    telegram.hapticImpact('light');

    try {
      await api.updateSettings({ notifications_enabled: newValue });
      updateUser({ notifications_enabled: newValue });
      showToast(newValue ? 'Notifications enabled' : 'Notifications disabled', 'success');
    } catch (error) {
      setNotifications(!newValue);
      showToast('Failed to update settings', 'error');
    }
  };

  const handleWinBroadcastToggle = async () => {
    const newValue = !winBroadcasts;
    setWinBroadcasts(newValue);
    telegram.hapticImpact('light');

    try {
      await api.updateSettings({ win_broadcasts_enabled: newValue });
      updateUser({ win_broadcasts_enabled: newValue });
    } catch (error) {
      setWinBroadcasts(!newValue);
      showToast('Failed to update settings', 'error');
    }
  };

  const handleLogout = () => {
    openModal('confirm', {
      title: 'Log Out?',
      message: 'You will need to restart the app to log back in.',
      confirmText: 'Log Out',
      confirmVariant: 'danger',
      onConfirm: () => {
        logout();
        telegram.close();
      },
    });
  };

  const handleDeleteAccount = () => {
    openModal('confirm', {
      title: 'Delete Account?',
      message: 'This action cannot be undone. All your data, SATZ balance, and history will be permanently deleted.',
      confirmText: 'Delete Forever',
      confirmVariant: 'danger',
      onConfirm: async () => {
        showToast('Please contact support to delete your account', 'info');
      },
    });
  };

  const settingSections = [
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          label: 'Push Notifications',
          description: 'Get notified about wins, streaks, and more',
          toggle: true,
          value: notifications,
          onChange: handleNotificationToggle,
        },
        {
          icon: MessageCircle,
          label: 'Win Broadcasts',
          description: 'Announce your big wins in chat',
          toggle: true,
          value: winBroadcasts,
          onChange: handleWinBroadcastToggle,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          description: 'FAQs and guides',
          onClick: () => telegram.openLink('https://mintiq.world/help'),
        },
        {
          icon: MessageCircle,
          label: 'Contact Support',
          description: 'Get help from our team',
          onClick: () => telegram.openTelegramLink('https://t.me/MintIQSupport'),
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          icon: Shield,
          label: 'Privacy Policy',
          onClick: () => telegram.openLink('https://mintiq.world/privacy'),
        },
        {
          icon: Globe,
          label: 'Terms of Service',
          onClick: () => telegram.openLink('https://mintiq.world/terms'),
        },
      ],
    },
  ];

  return (
    <div className="pb-4">
      {/* Profile summary */}
      <div className="px-4 pt-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-full bg-dark-700 flex items-center justify-center text-2xl">
            {user?.first_name?.[0] || '👤'}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-white">{user?.first_name} {user?.last_name}</h2>
            <p className="text-sm text-dark-400">@{user?.username || 'user'}</p>
          </div>
        </motion.div>
      </div>

      {/* Settings sections */}
      {settingSections.map((section, sectionIndex) => (
        <div key={section.title} className="px-4 mb-4">
          <h3 className="text-sm text-dark-400 mb-2 px-1">{section.title}</h3>
          <div className="card divide-y divide-white/5">
            {section.items.map((item, itemIndex) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                  onClick={item.toggle ? undefined : item.onClick}
                  className={`flex items-center gap-3 p-4 ${item.onClick ? 'cursor-pointer hover:bg-white/5 active:bg-white/10' : ''}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center">
                    <Icon size={20} className="text-dark-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{item.label}</p>
                    {item.description && (
                      <p className="text-sm text-dark-400">{item.description}</p>
                    )}
                  </div>
                  {item.toggle ? (
                    <button
                      onClick={item.onChange}
                      className={`w-12 h-7 rounded-full transition-colors ${
                        item.value ? 'bg-mint-500' : 'bg-dark-600'
                      }`}
                    >
                      <motion.div
                        animate={{ x: item.value ? 22 : 4 }}
                        className="w-5 h-5 rounded-full bg-white"
                      />
                    </button>
                  ) : (
                    <ChevronRight size={20} className="text-dark-400" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Danger zone */}
      <div className="px-4 mb-4">
        <h3 className="text-sm text-dark-400 mb-2 px-1">Account</h3>
        <div className="card divide-y divide-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 hover:bg-white/5"
          >
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <LogOut size={20} className="text-warning" />
            </div>
            <span className="font-medium text-warning">Log Out</span>
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center gap-3 p-4 hover:bg-white/5"
          >
            <div className="w-10 h-10 rounded-xl bg-danger/20 flex items-center justify-center">
              <Trash2 size={20} className="text-danger" />
            </div>
            <span className="font-medium text-danger">Delete Account</span>
          </button>
        </div>
      </div>

      {/* Version */}
      <div className="text-center py-4">
        <p className="text-sm text-dark-500">MintIQ v1.0.0</p>
        <p className="text-xs text-dark-600">Made with ❤️ for predictors</p>
      </div>
    </div>
  );
}
