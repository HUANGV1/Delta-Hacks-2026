import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store';
import { TrophyIcon, SparklesIcon, CoinsIcon, TargetIcon, BellIcon, InfoIcon } from './Icons';

export function NotificationToast() {
  const notifications = useGameStore((s) => s.notifications);
  const markNotificationRead = useGameStore((s) => s.markNotificationRead);
  const [visibleNotification, setVisibleNotification] = useState<typeof notifications[0] | null>(null);

  useEffect(() => {
    const unreadNotification = notifications.find(n => !n.read);
    if (unreadNotification && !visibleNotification) {
      setVisibleNotification(unreadNotification);
      
      const timer = setTimeout(() => {
        markNotificationRead(unreadNotification.id);
        setVisibleNotification(null);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [notifications, visibleNotification, markNotificationRead]);

  const handleDismiss = () => {
    if (visibleNotification) {
      markNotificationRead(visibleNotification.id);
      setVisibleNotification(null);
    }
  };

  const getTypeIcon = (type: string) => {
    const iconColor = getTypeColor(type);
    switch (type) {
      case 'achievement': return <TrophyIcon size={24} color={iconColor} />;
      case 'evolution': return <SparklesIcon size={24} color={iconColor} />;
      case 'reward': return <CoinsIcon size={24} color={iconColor} />;
      case 'challenge': return <TargetIcon size={24} color={iconColor} />;
      case 'reminder': return <BellIcon size={24} color={iconColor} />;
      default: return <InfoIcon size={24} color={iconColor} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'achievement': return '#fbbf24';
      case 'evolution': return '#a855f7';
      case 'reward': return '#f97316';
      case 'challenge': return '#22c55e';
      case 'reminder': return '#3b82f6';
      default: return '#71717a';
    }
  };

  return (
    <AnimatePresence>
      {visibleNotification && (
        <motion.div
          className="notification-toast"
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          onClick={handleDismiss}
          style={{ 
            '--toast-accent': getTypeColor(visibleNotification.type) 
          } as React.CSSProperties}
        >
          <div className="toast-icon">
            {getTypeIcon(visibleNotification.type)}
          </div>
          <div className="toast-content">
            <div className="toast-title">{visibleNotification.title}</div>
            <div className="toast-message">{visibleNotification.message}</div>
          </div>
          <button className="toast-dismiss">×</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
