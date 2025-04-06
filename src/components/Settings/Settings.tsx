import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaBell, FaLock, FaWifi, FaApple, FaGoogle, FaSignOutAlt, FaMoon, FaSun, FaRobot, FaHeadset } from 'react-icons/fa';
import { auth } from '../config/firebase';

interface WearableDevice {
  name: string;
  icon: JSX.Element;
  connected: boolean;
  lastSync?: Date;
  batteryLevel?: number;
}

const Settings = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: auth.currentUser?.email ?? '',
    phone: '',
    country: '',
    bio: ''
  });

  const [aiPreferences, setAiPreferences] = useState({
    trainingAdjustments: true,
    nutritionGuidance: true,
    injuryWarnings: true,
    athleteComparison: true,
    notificationFrequency: 'daily',
    publicProfile: false
  });

  const [notifications, setNotifications] = useState({
    recruitmentOffers: true,
    aiInsights: true,
    communityInteractions: true,
    progressComparisons: true
  });

  const [wearableDevices, setWearableDevices] = useState<WearableDevice[]>([
    { name: 'Apple Watch', icon: <FaApple />, connected: true, lastSync: new Date(), batteryLevel: 75 },
    { name: 'Google Fit', icon: <FaGoogle />, connected: false }
  ]);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPersonalInfo(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAiPreferenceChange = (key: string, value: boolean | string) => {
    setAiPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleDeviceConnection = (deviceName: string) => {
    setWearableDevices(prev =>
      prev.map(device =>
        device.name === deviceName
          ? { ...device, connected: !device.connected }
          : device
      )
    );
  };


  return (
    <div className="min-h-screen bg-dark p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings & Profile</h1>
            <p className="text-gray-400">Manage your account preferences and settings</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            {darkMode ? <FaMoon /> : <FaSun />}
          </motion.button>
        </div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaUser className="text-primary text-2xl" />
            <h2 className="text-xl font-semibold">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={personalInfo.name}
                  onChange={handlePersonalInfoChange}
                  className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                  className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={personalInfo.country}
                  onChange={handlePersonalInfoChange}
                  className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={personalInfo.bio}
                  onChange={handlePersonalInfoChange}
                  className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary h-32 resize-none"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaRobot className="text-primary text-2xl" />
            <h2 className="text-xl font-semibold">AI Training Preferences</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">AI-based Training Adjustments</h3>
                <p className="text-sm text-gray-400">Allow AI to modify your training plan</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiPreferences.trainingAdjustments}
                  onChange={(e) => handleAiPreferenceChange('trainingAdjustments', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 
                  peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full 
                  peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                  after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 
                  after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Nutrition Guidance</h3>
                <p className="text-sm text-gray-400">Receive AI-powered diet recommendations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiPreferences.nutritionGuidance}
                  onChange={(e) => handleAiPreferenceChange('nutritionGuidance', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 
                  peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full 
                  peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                  after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 
                  after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Injury Warnings</h3>
                <p className="text-sm text-gray-400">Get alerts about potential injury risks</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiPreferences.injuryWarnings}
                  onChange={(e) => handleAiPreferenceChange('injuryWarnings', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 
                  peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full 
                  peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                  after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 
                  after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div>
              <h3 className="font-semibold mb-2">AI Update Frequency</h3>
              <select
                value={aiPreferences.notificationFrequency}
                onChange={(e) => handleAiPreferenceChange('notificationFrequency', e.target.value)}
                className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
              >
                <option value="daily">Daily Updates</option>
                <option value="weekly">Weekly Updates</option>
                <option value="manual">Manual Updates Only</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Wearable Devices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaWifi className="text-primary text-2xl" />
            <h2 className="text-xl font-semibold">Connected Devices</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wearableDevices.map((device, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 p-4 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{device.icon}</div>
                    <div>
                      <h3 className="font-semibold">{device.name}</h3>
                      <p className={`text-sm ${device.connected ? 'text-green-500' : 'text-red-500'}`}>
                        {device.connected ? 'Connected' : 'Disconnected'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleDeviceConnection(device.name)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      device.connected
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                    }`}
                  >
                    {device.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaBell className="text-primary text-2xl" />
            <h2 className="text-xl font-semibold">Notification Settings</h2>
          </div>

          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Receive notifications for {key.toLowerCase().replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleNotificationChange(key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 
                    peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full 
                    peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                    after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 
                    after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaLock className="text-primary text-2xl" />
            <h2 className="text-xl font-semibold">Security Settings</h2>
          </div>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-lg text-left"
            >
              <h3 className="font-semibold">Change Password</h3>
              <p className="text-sm text-gray-400">Update your account password</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-lg text-left"
            >
              <h3 className="font-semibold">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-400">Add an extra layer of security</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-red-500/20 hover:bg-red-500/30 p-4 rounded-lg text-left"
            >
              <div className="flex items-center gap-3 text-red-500">
                <FaSignOutAlt />
                <div>
                  <h3 className="font-semibold">Sign Out from All Devices</h3>
                  <p className="text-sm">Sign out everywhere except here</p>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Help & Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <FaHeadset className="text-primary text-2xl" />
            <h2 className="text-xl font-semibold">Help & Support</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/5 p-4 rounded-lg text-left"
            >
              <h3 className="font-semibold">Contact Support</h3>
              <p className="text-sm text-gray-400">Get help from our team</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/5 p-4 rounded-lg text-left"
            >
              <h3 className="font-semibold">FAQs</h3>
              <p className="text-sm text-gray-400">Find answers to common questions</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/5 p-4 rounded-lg text-left"
            >
              <h3 className="font-semibold">Report an Issue</h3>
              <p className="text-sm text-gray-400">Let us know about any problems</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/5 p-4 rounded-lg text-left"
            >
              <h3 className="font-semibold">Feature Request</h3>
              <p className="text-sm text-gray-400">Suggest new features</p>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;