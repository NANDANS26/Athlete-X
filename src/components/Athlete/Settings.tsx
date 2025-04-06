import { JSX, useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaBell, FaCog, FaLock, FaWifi, FaApple, FaGoogle, FaSignOutAlt } from 'react-icons/fa';
import { FaMintbit } from "react-icons/fa6"; // Newer versions have Fa6
import type { AthleteData } from './AthleteDashboard';

interface SettingsProps {
  athleteData: AthleteData;
}

interface WearableDevice {
  name: string;
  icon: JSX.Element;
  connected: boolean;
}

const Settings = ({ athleteData }: SettingsProps) => {
  const [personalInfo, setPersonalInfo] = useState({
    name: athleteData.name || '',
    sport: athleteData.sport || '',
    age: athleteData.age || '',
    height: athleteData.height || '',
    weight: athleteData.weight || '',
    gender: athleteData.gender || '',
    experience: athleteData.fitnessLevel || 'Beginner'
  });

  const [aiPreferences, setAiPreferences] = useState({
    enableAiTraining: true,
    injuryWarningLevel: 'Medium',
    trainingFocus: 'Strength',
    enableNutritionGuidance: true
  });

  const [notifications, setNotifications] = useState({
    performanceInsights: true,
    recruitmentOffers: true,
    injuryWarnings: true,
    trainingReminders: true
  });

  const [wearableDevices, setWearableDevices] = useState<WearableDevice[]>([
    { name: 'Apple Health', icon: <FaApple />, connected: true },
    { name: 'Google Fit', icon: <FaGoogle />, connected: false },
    { name: 'Fitbit', icon: <FaMintbit />, connected: true }
  ]);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPersonalInfo(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAiPreferencesChange = (key: string, value: boolean | string) => {
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings & Profile</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>
      </div>

      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
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
              <label className="block text-sm font-medium text-gray-400 mb-1">Sport</label>
              <select
                name="sport"
                value={personalInfo.sport}
                onChange={handlePersonalInfoChange}
                className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Sport</option>
                <option value="Football">Football</option>
                <option value="Basketball">Basketball</option>
                <option value="Tennis">Tennis</option>
                <option value="Athletics">Athletics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Experience Level</label>
              <select
                name="experience"
                value={personalInfo.experience}
                onChange={handlePersonalInfoChange}
                className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Professional">Professional</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={personalInfo.age}
                  onChange={handlePersonalInfoChange}
                  className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Gender</label>
                <select
                  name="gender"
                  value={personalInfo.gender}
                  onChange={handlePersonalInfoChange}
                  className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={personalInfo.height}
                  onChange={handlePersonalInfoChange}
                  className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={personalInfo.weight}
                  onChange={handlePersonalInfoChange}
                  className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaCog className="text-primary text-2xl" />
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
                checked={aiPreferences.enableAiTraining}
                onChange={(e) => handleAiPreferencesChange('enableAiTraining', e.target.checked)}
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
            <h3 className="font-semibold mb-2">Injury Warning Sensitivity</h3>
            <select
              value={aiPreferences.injuryWarningLevel}
              onChange={(e) => handleAiPreferencesChange('injuryWarningLevel', e.target.value)}
              className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Training Focus</h3>
            <select
              value={aiPreferences.trainingFocus}
              onChange={(e) => handleAiPreferencesChange('trainingFocus', e.target.value)}
              className="w-full bg-white/5 rounded-lg p-3 focus:ring-2 focus:ring-primary"
            >
              <option value="Strength">Strength</option>
              <option value="Endurance">Endurance</option>
              <option value="Speed">Speed</option>
              <option value="Recovery">Recovery</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Wearable Devices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
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
        className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
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
        className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
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
            className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-lg text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Connected Devices</h3>
                <p className="text-sm text-gray-400">Manage devices logged into your account</p>
              </div>
              <span className="bg-primary/20 text-primary px-2 py-1 rounded text-sm">
                3 Active
              </span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-red-500/20 hover:bg-red-500/30 p-4 rounded-lg text-left"
          >
            <div className="flex items-center gap-3 text-red-500">
              <FaSignOutAlt />
              <div>
                <h3 className="font-semibold">Logout from All Devices</h3>
                <p className="text-sm">Sign out everywhere except here</p>
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;