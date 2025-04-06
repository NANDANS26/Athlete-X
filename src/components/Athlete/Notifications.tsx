import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaRobot, FaTrophy, FaRunning, FaExclamationTriangle, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import { AthleteData } from './AthleteDashboard'; // Adjust the import path as needed

interface NotificationsProps {
  athleteData: AthleteData;
}

interface Notification {
  id: string;
  type: 'ai' | 'recruitment' | 'training' | 'injury';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actions?: {
    primary?: {
      label: string;
      action: () => void;
    };
    secondary?: {
      label: string;
      action: () => void;
    };
  };
}

const Notifications = ({ athleteData }: NotificationsProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'ai' | 'recruitment' | 'training' | 'injury'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulate fetching notifications from Firebase
  useEffect(() => {
    const mockNotifications: Notification[] = [
      // AI Insights
      {
        id: '1',
        type: 'ai',
        title: 'AI Training Optimization Available',
        description: `Hi ${athleteData.name}, based on your recent performance data, we've generated new training recommendations to improve your speed and agility.`,
        timestamp: new Date(),
        read: false,
        priority: 'high',
        actions: {
          primary: {
            label: 'View Recommendations',
            action: () => console.log('Viewing AI recommendations')
          }
        }
      },
      {
        id: '2',
        type: 'ai',
        title: 'New Performance Analysis',
        description: `Your latest performance metrics have been analyzed, ${athleteData.name}. Check out the detailed report for insights.`,
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        read: false,
        priority: 'medium',
        actions: {
          primary: {
            label: 'View Report',
            action: () => console.log('Viewing performance report')
          }
        }
      },
      // Recruitment
      {
        id: '3',
        type: 'recruitment',
        title: 'New Contract Offer',
        description: `${athleteData.name}, Elite Sports Club has shown interest in your profile and submitted a contract offer.`,
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        read: false,
        priority: 'high',
        actions: {
          primary: {
            label: 'View Offer',
            action: () => console.log('Viewing contract offer')
          },
          secondary: {
            label: 'Decline',
            action: () => console.log('Declining offer')
          }
        }
      },
      {
        id: '4',
        type: 'recruitment',
        title: 'Scout Interest',
        description: `A talent scout from Global Sports Agency has viewed your profile, ${athleteData.name}.`,
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        read: false,
        priority: 'medium',
        actions: {
          primary: {
            label: 'View Details',
            action: () => console.log('Viewing scout details')
          }
        }
      },
      // Training
      {
        id: '5',
        type: 'training',
        title: 'New Workout Plan',
        description: `${athleteData.name}, your coach has uploaded a new workout plan tailored to your goals.`,
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        read: false,
        priority: 'medium',
        actions: {
          primary: {
            label: 'View Plan',
            action: () => console.log('Viewing workout plan')
          }
        }
      },
      {
        id: '6',
        type: 'training',
        title: 'Training Session Reminder',
        description: `You have a scheduled training session tomorrow at 10:00 AM, ${athleteData.name}. Don’t forget!`,
        timestamp: new Date(Date.now() - 43200000), // 12 hours ago
        read: false,
        priority: 'low',
        actions: {
          primary: {
            label: 'View Schedule',
            action: () => console.log('Viewing training schedule')
          }
        }
      },
      // Injury Alerts
      {
        id: '7',
        type: 'injury',
        title: 'High Fatigue Warning',
        description: `Our AI has detected elevated fatigue levels, ${athleteData.name}. Consider reducing training intensity for the next 48 hours.`,
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        read: false,
        priority: 'medium',
        actions: {
          primary: {
            label: 'View Recovery Plan',
            action: () => console.log('Viewing recovery plan')
          }
        }
      },
      {
        id: '8',
        type: 'injury',
        title: 'Injury Risk Detected',
        description: `Your recent training data suggests a higher risk of injury, ${athleteData.name}. Please consult your physiotherapist.`,
        timestamp: new Date(Date.now() - 14400000), // 4 hours ago
        read: false,
        priority: 'high',
        actions: {
          primary: {
            label: 'View Risk Report',
            action: () => console.log('Viewing injury risk report')
          }
        }
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, [athleteData]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ai':
        return <FaRobot className="text-primary" />;
      case 'recruitment':
        return <FaTrophy className="text-yellow-500" />;
      case 'training':
        return <FaRunning className="text-green-500" />;
      case 'injury':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500';
      case 'medium':
        return 'border-yellow-500';
      case 'low':
        return 'border-green-500';
      default:
        return 'border-gray-500';
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
    if (selectedNotification?.id === notificationId) {
      setSelectedNotification(null);
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    activeTab === 'all' ? true : notification.type === activeTab
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-gray-400">
            Stay updated with AI insights and opportunities
          </p>
        </div>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-primary text-white px-4 py-2 rounded-full"
          >
            {unreadCount} new
          </motion.div>
        )}
      </div>

      {/* Notification Tabs */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All', icon: FaBell },
          { id: 'ai', label: 'AI Insights', icon: FaRobot },
          { id: 'recruitment', label: 'Recruitment', icon: FaTrophy },
          { id: 'training', label: 'Training', icon: FaRunning },
          { id: 'injury', label: 'Injury Alerts', icon: FaExclamationTriangle }
        ].map(tab => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
          >
            <tab.icon />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Notifications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notification List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredNotifications.map(notification => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedNotification(notification)}
                className={`bg-white/10 backdrop-blur-lg p-4 rounded-xl cursor-pointer
                  border-l-4 ${getPriorityColor(notification.priority)}
                  ${!notification.read ? 'animate-pulse-subtle' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{notification.title}</h3>
                    <p className="text-sm text-gray-400">{notification.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {notification.timestamp.toLocaleTimeString()}
                      </span>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="text-primary hover:text-secondary"
                          >
                            <FaCheck />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          className="text-red-500 hover:text-red-400"
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Notification Details */}
        <AnimatePresence>
          {selectedNotification && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {getTypeIcon(selectedNotification.type)}
                  </div>
                  <h2 className="text-xl font-semibold">{selectedNotification.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              <p className="text-gray-300 mb-6">{selectedNotification.description}</p>

              {selectedNotification.actions && (
                <div className="flex gap-4">
                  {selectedNotification.actions.primary && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={selectedNotification.actions.primary.action}
                      className="flex-1 bg-primary hover:bg-secondary text-white py-2 rounded-lg 
                        transition-colors"
                    >
                      {selectedNotification.actions.primary.label}
                    </motion.button>
                  )}
                  {selectedNotification.actions.secondary && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={selectedNotification.actions.secondary.action}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg 
                        transition-colors"
                    >
                      {selectedNotification.actions.secondary.label}
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Notifications;