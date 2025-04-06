export interface Device {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  lastSync: Date | null;
  color: string;
}

export interface HealthMetrics {
  timestamp: string;
  heartRate: number;
  steps: number;
  calories: number;
  sleep: number;
  hydration: number;
  stress: number;
  distance?: number;
  activities?: string[];
  activeMinutes?: number;
  lastUpdated?: number;
}

export type MetricType = 'heartRate' | 'steps' | 'calories' | 'sleep' | 'hydration' | 'stress';

export interface MetricInfo {
  id: MetricType;
  name: string;
  color: string;
  unit: string;
}

// Type augmentation for Web Bluetooth API
declare global {
  interface Navigator {
    bluetooth: Bluetooth; // Use the built-in Bluetooth type
  }
}

export {};