import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBell,
  FaUserPlus,
  FaRobot,
  FaHeartbeat,
  FaChartLine,
  FaCalendarAlt,
  FaFilter,
  FaCheck,
  FaTrash,
  FaFileContract,
  FaFileAlt,
  FaHandshake,
} from 'react-icons/fa';
import athleteData from '../config/athlete.json'; // Import the JSON data

interface Notification {
  id: string;
  type: 'athlete_response' | 'application' | 'ai_insight' | 'injury' | 'performance' | 'event' | 'offer_acceptance' | 'report' | 'contract_update';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  athleteId?: string;
  athleteName?: string;
  athleteAvatar?: string;
  data?: any;
}

const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [sport, setSport] = useState<string>('Football'); // Default sport

  // Fetch athlete data and generate notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Get athletes for the chosen sport
        const athletesInSport = athleteData[sport as keyof typeof athleteData] || [];

        // Generate mock notifications based on athletes
        const mockNotifications: Notification[] = athletesInSport.map((athlete, index) => ({
          id: `athlete-${index + 1}`,
          type: 'performance', // Default type
          title: 'Performance Update',
          message: `${athlete.Name} has shown significant improvement in their performance metrics.`,
          timestamp: new Date(),
          read: false,
          priority: 'medium',
          athleteName: athlete.Name,
          athleteAvatar: athlete.Image,
          data: {
            metrics: {
              speed: Math.floor(Math.random() * 100),
              stamina: Math.floor(Math.random() * 100),
              accuracy: Math.floor(Math.random() * 100),
            },
          },
        }));

        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter((n) => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    // Simulate real-time notifications
    const interval = setInterval(() => {
      const athletesInSport = athleteData[sport as keyof typeof athleteData] || [];
      if (athletesInSport.length > 0) {
        const randomAthlete = athletesInSport[Math.floor(Math.random() * athletesInSport.length)];
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: 'performance',
          title: 'Performance Milestone',
          message: `${randomAthlete.Name} has improved their speed by ${Math.floor(Math.random() * 10)}%!`,
          timestamp: new Date(),
          read: false,
          priority: 'medium',
          athleteName: randomAthlete.Name,
          athleteAvatar: randomAthlete.Image,
          data: {
            metric: 'speed',
            improvement: Math.floor(Math.random() * 10),
            previousValue: Math.floor(Math.random() * 100),
            newValue: Math.floor(Math.random() * 100),
          },
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    }, 30000); // New notification every 30 seconds

    return () => clearInterval(interval);
  }, [sport]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'athlete_response':
        return <FaUserPlus className="text-green-500" />;
      case 'ai_insight':
        return <FaRobot className="text-primary" />;
      case 'injury':
        return <FaHeartbeat className="text-red-500" />;
      case 'performance':
        return <FaChartLine className="text-blue-500" />;
      case 'event':
        return <FaCalendarAlt className="text-yellow-500" />;
      case 'offer_acceptance':
        return <FaHandshake className="text-purple-500" />;
      case 'report':
        return <FaFileAlt className="text-orange-500" />;
      case 'contract_update':
        return <FaFileContract className="text-teal-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
    if (selectedNotification?.id === notificationId) {
      setSelectedNotification(null);
    }
  };

  const filteredNotifications = notifications.filter((notification) =>
    selectedType === 'all' ? true : notification.type === selectedType
  );

  return (
    <div className="min-h-screen bg-dark p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications Center</h1>
            <p className="text-gray-400">
              Stay updated with athlete responses and insights
            </p>
          </div>
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative"
            >
              <FaBell className="text-2xl text-primary" />
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 
                    rounded-full flex items-center justify-center"
                >
                  {unreadCount}
                </motion.div>
              )}
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMarkAllAsRead}
              className="bg-primary/20 text-primary px-4 py-2 rounded-lg hover:bg-primary/30 
                transition-colors"
            >
              Mark All as Read
            </motion.button>
          </div>
        </div>

        {/* Sport Selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-400 mb-2">Select Sport</label>
          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className=" bg-gray-800/50 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-purple-400 text-white"
          >
            <option value="Football">Football</option>
            <option value="Basketball">Basketball</option>
            <option value="Boxing">Boxing</option>
            <option value="Swimming">Swimming</option>
            <option value="Tennis">Tennis</option>
            <option value="Badminton">Badminton</option>
            <option value="Rugby">Rugby</option>
            <option value="Hockey">Hockey</option>
            <option value="Athletics">Athletics</option>
            <option value="Cricket">Cricket</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <FaFilter className="text-primary text-xl" />
                <h2 className="text-xl font-semibold">Filter Notifications</h2>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'all', label: 'All Notifications', icon: FaBell },
                  { id: 'athlete_response', label: 'Athlete Responses', icon: FaUserPlus },
                  { id: 'ai_insight', label: 'AI Insights', icon: FaRobot },
                  { id: 'injury', label: 'Injury Alerts', icon: FaHeartbeat },
                  { id: 'performance', label: 'Performance Updates', icon: FaChartLine },
                  { id: 'event', label: 'Events', icon: FaCalendarAlt },
                  { id: 'offer_acceptance', label: 'Offer Acceptances', icon: FaHandshake },
                  { id: 'report', label: 'Performance Reports', icon: FaFileAlt },
                  { id: 'contract_update', label: 'Contract Updates', icon: FaFileContract },
                ].map((filter) => (
                  <motion.button
                    key={filter.id}
                    whileHover={{ x: 5 }}
                    onClick={() => setSelectedType(filter.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${selectedType === filter.id
                        ? 'bg-primary text-white'
                        : 'text-gray-400 hover:bg-white/10'
                      }`}
                  >
                    <filter.icon />
                    <span>{filter.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Main Content - Notifications List */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedNotification(notification)}
                  className={`bg-white/10 p-6 rounded-xl cursor-pointer transition-all
                    ${!notification.read ? 'border-l-4 border-primary' : ''}
                    ${selectedNotification?.id === notification.id ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{notification.title}</h3>
                          <p className="text-gray-400">{notification.message}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {notification.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      {notification.athleteName && (
                        <div className="flex items-center gap-2 mt-4">
                          <img
                            src={notification.athleteAvatar}
                            alt={notification.athleteName}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-sm text-gray-400">
                            {notification.athleteName}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-end gap-2 mt-4">
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Right Sidebar - Notification Details */}
          <div className="lg:col-span-1">
            <AnimatePresence>
              {selectedNotification && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white/10 rounded-xl p-6 sticky top-8"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(selectedNotification.type)}
                      <h2 className="text-xl font-semibold">Notification Details</h2>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${
                      selectedNotification.priority === 'high'
                        ? 'bg-red-500/20 text-red-500'
                        : selectedNotification.priority === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : 'bg-green-500/20 text-green-500'
                    }`}>
                      {selectedNotification.priority.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">{selectedNotification.title}</h3>
                      <p className="text-gray-400">{selectedNotification.message}</p>
                    </div>

                    {selectedNotification.data && (
                      <div className="bg-white/5 p-4 rounded-lg">
                        {selectedNotification.type === 'performance' && (
                          <div>
                            <h4 className="font-semibold mb-2">Performance Metrics</h4>
                            <div className="space-y-2">
                              {Object.entries(selectedNotification.data.metrics).map(([metric, value], index) => (
                                <div key={index} className="flex justify-between">
                                  <span>{metric}:</span>
                                  <span className="text-primary">{(value as number)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 bg-primary hover:bg-secondary text-white py-2 rounded-lg transition-colors"
                      >
                        Take Action
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors"
                      >
                        Dismiss
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsCenter;