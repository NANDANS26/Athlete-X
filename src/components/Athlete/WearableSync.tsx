import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGoogle, FaHeart, FaBed, FaTint, FaRunning, FaBrain, FaPlus,
  FaSync, FaBolt, FaTimes, FaHeartbeat, FaWalking, FaFire,
  FaExclamationTriangle, FaSpinner
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWearableStore, syncHealthMetricsToFirebase, subscribeToHealthMetrics, generateRandomMetrics } from '../services/wearableStore';
import { fetchGoogleFitData } from '../services/googleFit';
import { auth, db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { HealthMetrics } from '../types';

interface Device {
  id: string;
  name: string;
  icon: JSX.Element;
  connected: boolean;
  lastSync?: Date;
  batteryLevel?: number;
  type: 'google_fit' | 'strava' | 'bluetooth';
}

const WearableSync = () => {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: 'google_fit',
      name: 'Google Fit',
      icon: <FaGoogle />,
      connected: false,
      type: 'google_fit'
    },
    {
      id: 'strava',
      name: 'Strava',
      icon: <FaBolt />,
      connected: false,
      type: 'strava'
    },
    {
      id: 'bluetooth',
      name: 'Bluetooth Device',
      icon: <FaHeart />,
      connected: false,
      type: 'bluetooth'
    }
  ]);

  const [healthData, setHealthData] = useState<HealthMetrics[]>([]);
  const [selectedMetric, setSelectedMetric] = useState('heartRate');
  const [syncing, setSyncing] = useState(false);
  const [isBluetoothConnecting, setIsBluetoothConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [authWindow, setAuthWindow] = useState<Window | null>(null);
  const [dataFetchInterval, setDataFetchInterval] = useState<NodeJS.Timeout | null>(null);

  const {
    connectedDevice,
    setConnectedDevice,
    updateHealthMetrics,
    clearHealthMetrics
  } = useWearableStore();

  // Store health metrics in Firebase
  const storeHealthMetricsInFirebase = async (metrics: HealthMetrics) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
  
    try {
      await setDoc(doc(db, 'users', userId, 'healthMetrics', 'latest'), {
        ...metrics,
        timestamp: new Date().toISOString(),
        userId
      });
      console.log('Health metrics stored successfully');
    } catch (error: unknown) {
      // Type-safe error handling
      if (error instanceof Error) {
        console.error('Firebase error:', {
          message: error.message,
          code: (error as { code?: string }).code,
          details: (error as { details?: string }).details
        });
      } else {
        console.error('Unknown error occurred:', error);
      }
    }
  };

  // Initialize devices based on stored connection state
  useEffect(() => {
    if (connectedDevice) {
      setDevices(prev =>
        prev.map(device =>
          device.type === connectedDevice
            ? { ...device, connected: true, lastSync: new Date() }
            : device
        )
      );
    }
  }, [connectedDevice]);

  // Subscribe to Firebase real-time updates
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
  
    const unsubscribe = subscribeToHealthMetrics(userId, (metrics) => {
      updateHealthMetrics(metrics);
      setHealthData(prev => [...prev, metrics].slice(-30));
      
      // Add this call:
      storeHealthMetricsInFirebase(metrics);
    });
  
    return () => unsubscribe();
  }, [updateHealthMetrics]);

  // Fetch and update Google Fit data
  const fetchAndUpdateGoogleFitData = useCallback(async () => {
    try {
      const data = await fetchGoogleFitData();
      const userId = auth.currentUser?.uid;
      if (!userId) return;
  
      const newMetrics: HealthMetrics = {
        ...data,
        timestamp: new Date().toISOString(),
        lastUpdated: Date.now()
      };
  
      updateHealthMetrics(newMetrics);
      setHealthData(prev => [...prev, newMetrics].slice(-30));
      
      // Add this call:
      await storeHealthMetricsInFirebase(newMetrics);
  
    } catch (error) {
      console.error('Error fetching Google Fit data:', error);
    }
  }, [updateHealthMetrics]);

  // Set up data fetching intervals based on device type
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (connectedDevice) {
      const fetchData = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        if (connectedDevice === 'google_fit') {
          await fetchAndUpdateGoogleFitData();
        } else {
          // For Strava and Bluetooth, generate random data
          const metrics = generateRandomMetrics();
          updateHealthMetrics(metrics);
          await syncHealthMetricsToFirebase(userId, metrics);

          setHealthData(prev => [
            ...prev,
            metrics
          ].slice(-30));
        }
      };

      // Initial fetch
      fetchData();
      
      // Set up interval
      interval = setInterval(fetchData, 5000); // Update every 5 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [connectedDevice, fetchAndUpdateGoogleFitData, updateHealthMetrics]);

  // Listen for OAuth callback messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'oauth_callback') {
        if (event.data.success) {
          // Handle successful authorization
          const deviceType = event.data.provider;
          setDevices(prev =>
            prev.map(device =>
              device.type === deviceType
                ? { ...device, connected: true, lastSync: new Date() }
                : device
            )
          );
          setConnectedDevice(deviceType);
          
          // Close the auth window if it exists
          if (authWindow) {
            authWindow.close();
            setAuthWindow(null);
          }
        } else {
          // Handle authorization failure
          setConnectionError(`Authorization failed: ${event.data.error}`);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [authWindow, setConnectedDevice]);

  const handleDeviceConnect = async (deviceType: string) => {
    // Disconnect any previously connected device
    if (connectedDevice) {
      await handleDeviceDisconnect(connectedDevice);
    }

    switch (deviceType) {
      case 'google_fit':
        handleGoogleFitConnect();
        break;
      case 'strava':
        handleStravaConnect();
        break;
      case 'bluetooth':
        handleBluetoothConnect();
        break;
    }
  };

  const handleDeviceDisconnect = async (deviceType: string) => {
    setConnectedDevice(null);
    clearHealthMetrics();

    if (deviceType === 'google_fit' && dataFetchInterval) {
      clearInterval(dataFetchInterval);
      setDataFetchInterval(null);
    }

    setDevices(prev =>
      prev.map(device =>
        device.type === deviceType
          ? { ...device, connected: false }
          : device
      )
    );
  };

  const handleGoogleFitConnect = () => {
    const clientId = import.meta.env.VITE_GOOGLE_FIT_CLIENT_ID;
    const redirectUri = `${window.location.origin}/google-fit-callback`;
    const scope = [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.body.read',
      'https://www.googleapis.com/auth/fitness.location.read'
    ].join(' ');
  
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `access_type=offline&` +
      `prompt=consent`;
      
    const authPopup = window.open(authUrl, 'google_fit_auth', 'width=600,height=600');
    setAuthWindow(authPopup);
  };

  const handleStravaConnect = () => {
    const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
    const redirectUri = `${window.location.origin}/strava-callback`;
    const scope = 'read,activity:read';
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    
    const authPopup = window.open(authUrl, 'strava_auth', 'width=600,height=600');
    setAuthWindow(authPopup);
  };

  const handleBluetoothConnect = async () => {
    try {
      setIsBluetoothConnecting(true);
      setConnectionError("");

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }]
      });

      console.log('Connected to device:', device.name);

      setDevices(prev =>
        prev.map(d =>
          d.type === 'bluetooth'
            ? { ...d, connected: true, lastSync: new Date(), name: device.name || 'Bluetooth Device' }
            : d
        )
      );
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      setConnectionError("Failed to connect. Ensure your device is in pairing mode.");
    } finally {
      setIsBluetoothConnecting(false);
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'heartRate':
        return <FaHeart className="text-red-500" />;
      case 'sleep':
        return <FaBed className="text-purple-500" />;
      case 'hydration':
        return <FaTint className="text-blue-500" />;
      case 'steps':
        return <FaRunning className="text-green-500" />;
      case 'stress':
        return <FaBrain className="text-yellow-500" />;
      default:
        return <FaBolt className="text-primary" />;
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'heartRate':
        return '#ef4444';
      case 'sleep':
        return '#a855f7';
      case 'hydration':
        return '#3b82f6';
      case 'steps':
        return '#22c55e';
      case 'stress':
        return '#eab308';
      default:
        return '#646cff';
    }
  };

  const getMetricValue = (data: HealthMetrics) => {
    switch (selectedMetric) {
      case 'heartRate':
        return data.heartRate;
      case 'sleep':
        return data.sleep;
      case 'hydration':
        return data.hydration;
      case 'steps':
        return data.steps;
      case 'stress':
        return data.stress;
      default:
        return 0;
    }
  };

  const renderDeviceConnectionModal = () => (
    <AnimatePresence>
      {isBluetoothConnecting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1a1a1a] p-8 rounded-xl max-w-md w-full mx-4 relative"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-4xl text-primary mb-4"
              >
                <FaSync />
              </motion.div>
              <h2 className="text-2xl font-bold mb-4">Connecting to Device</h2>
              <p className="text-gray-400 mb-4">
                Please make sure your device is nearby and Bluetooth is enabled...
              </p>
              {connectionError && (
                <p className="text-[#ff4757] mb-4">{connectionError}</p>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsBluetoothConnecting(false);
                  setSyncing(false);
                }}
                className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const isAnyDeviceConnected = devices.some(device => device.connected);

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Wearable Device Sync</h1>
          <p className="text-gray-400">
            Connect your devices to track real-time performance metrics
          </p>
        </div>
      </div>

      {/* Device Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        {devices.map((device) => (
          <motion.div
            key={device.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{device.icon}</div>
                <div>
                  <h3 className="font-semibold">{device.name}</h3>
                  <p className={`text-sm ${device.connected ? 'text-[#2ed573]' : 'text-gray-400'}`}>
                    {device.connected ? 'Connected' : 'Not Connected'}
                  </p>
                </div>
              </div>
              {device.batteryLevel && (
                <div className="text-sm text-gray-400">
                  {device.batteryLevel}%
                </div>
              )}
            </div>

            {device.connected && device.lastSync && (
              <p className="text-sm text-gray-400 mb-4">
                Last synced: {device.lastSync.toLocaleTimeString()}
              </p>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => device.connected 
                ? handleDeviceDisconnect(device.type)
                : handleDeviceConnect(device.type)
              }
              disabled={syncing}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                transition-colors ${
                  device.connected
                    ? 'bg-[#ff4757]/20 text-[#ff4757] hover:bg-[#ff4757]/30'
                    : 'bg-[#2ed573]/20 text-[#2ed573] hover:bg-[#2ed573]/30'
                }`}
            >
              {syncing ? (
                <FaSpinner className="animate-spin" />
              ) : device.connected ? (
                <>
                  <FaTimes />
                  Disconnect
                </>
              ) : (
                <>
                  <FaPlus />
                  Connect
                </>
              )}
            </motion.button>
          </motion.div>
        ))}
      </motion.div>

      {isAnyDeviceConnected ? (
        <>
          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Real-time Data</h2>
                <div className="flex gap-2">
                  {['heartRate', 'sleep', 'hydration', 'steps', 'stress'].map(metric => (
                    <motion.button
                      key={metric}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedMetric(metric)}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedMetric === metric
                          ? 'bg-white/20 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {getMetricIcon(metric)}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={healthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="timestamp" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid #666'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={d => getMetricValue(d)}
                      stroke={getMetricColor(selectedMetric)}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <FaHeartbeat className="text-primary text-2xl" />
                <h2 className="text-xl font-semibold">Quick Stats</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaHeartbeat className="text-red-500" />
                    <span>Heart Rate</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {healthData.length > 0 ? healthData[healthData.length - 1].heartRate : 0} BPM
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaWalking className="text-green-500" />
                    <span>Steps</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {healthData.length > 0 ? healthData[healthData.length - 1].steps : 0}
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaFire className="text-orange-500" />
                    <span>Calories</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {healthData.length > 0 ? healthData[healthData.length - 1].calories : 0} kcal
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaBed className="text-purple-500" />
                    <span>Sleep</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {healthData.length > 0 ? healthData[healthData.length - 1].sleep : 0} hrs
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg p-8 rounded-xl text-center"
        >
          <FaExclamationTriangle className="text-[#ff4757] text-4xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Device Connected</h2>
          <p className="text-gray-400 mb-4">
            Please connect a device to start tracking your health and fitness metrics.
          </p>
        </motion.div>
      )}

      {/* Device Connection Modal */}
      {renderDeviceConnectionModal()}
    </div>
  );
};

export default WearableSync;
