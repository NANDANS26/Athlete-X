import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ref, set, onValue } from 'firebase/database';
import { rtdb } from '../config/firebase';
import type { HealthMetrics } from '../types';

interface WearableState {
  connectedDevice: string | null;
  healthMetrics: HealthMetrics;
  setConnectedDevice: (device: string | null) => void;
  updateHealthMetrics: (metrics: Partial<HealthMetrics>) => void;
  clearHealthMetrics: () => void;
}

const initialHealthMetrics: HealthMetrics = {
  timestamp: new Date().toISOString(),
  heartRate: 0,
  steps: 0,
  calories: 0,
  sleep: 0,
  hydration: 0,
  stress: 0,
  distance: 0,
  activities: [],
  activeMinutes: 0,
  lastUpdated: Date.now()
};

export const useWearableStore = create<WearableState>()(
  persist(
    (set) => ({
      connectedDevice: null,
      healthMetrics: initialHealthMetrics,
      setConnectedDevice: (device) => set({ connectedDevice: device }),
      updateHealthMetrics: (metrics) =>
        set((state) => ({
          healthMetrics: { 
            ...state.healthMetrics, 
            ...metrics,
            timestamp: new Date().toISOString(),
            lastUpdated: Date.now()
          },
        })),
      clearHealthMetrics: () => set({ healthMetrics: initialHealthMetrics }),
    }),
    {
      name: 'wearable-storage',
    }
  )
);

// Firebase real-time data sync
export const syncHealthMetricsToFirebase = async (userId: string, metrics: HealthMetrics) => {
  try {
    const metricsRef = ref(rtdb, `healthMetrics/${userId}`);
    await set(metricsRef, {
      ...metrics,
      lastUpdated: Date.now(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error syncing metrics to Firebase:', error);
  }
};

export const subscribeToHealthMetrics = (userId: string, callback: (metrics: HealthMetrics) => void) => {
  const metricsRef = ref(rtdb, `healthMetrics/${userId}`);
  return onValue(metricsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  });
};

// Generate random metrics for non-Google Fit devices
export const generateRandomMetrics = (): HealthMetrics => ({
  timestamp: new Date().toISOString(),
  heartRate: Math.floor(60 + Math.random() * 40), // 60-100 BPM
  steps: Math.floor(2000 + Math.random() * 8000), // 2000-10000 steps
  calories: Math.floor(1500 + Math.random() * 1000), // 1500-2500 calories
  sleep: Math.floor(6 + Math.random() * 3), // 6-9 hours
  hydration: Math.floor(50 + Math.random() * 50), // 50-100%
  stress: Math.floor(20 + Math.random() * 60), // 20-80%
  distance: Math.floor(1 + Math.random() * 10), // 1-10 km
  activities: ['Running', 'Walking', 'Cycling'].sort(() => Math.random() - 0.5),
  activeMinutes: Math.floor(30 + Math.random() * 60), // 30-90 minutes
  lastUpdated: Date.now()
});