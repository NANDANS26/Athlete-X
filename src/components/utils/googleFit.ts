import { HealthMetrics } from '../types';

const GOOGLE_FIT_API_BASE = 'https://www.googleapis.com/fitness/v1/users/me';

interface DatasetConfig {
  dataTypeName: string;
  endpoint: string;
  params: {
    aggregateBy: Array<{ dataTypeName: string }>;
    bucketByTime: { durationMillis: number };
    startTimeMillis: number;
    endTimeMillis: number;
  };
}

interface GoogleFitResponse {
  bucket?: Array<{
    startTimeMillis: string;
    dataset: Array<{
      point: Array<{
        startTimeNanos: string;
        value: Array<{
          fpVal?: number;
          intVal?: number;
        }>;
      }>;
    }>;
  }>;
}

interface ProcessedResponse {
  type: string;
  data: GoogleFitResponse;
}

export async function fetchGoogleFitData(accessToken: string): Promise<HealthMetrics[]> {
  const now = new Date();
  const startTime = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // Last 24 hours

  const datasets: DatasetConfig[] = [
    {
      dataTypeName: 'com.google.heart_rate.bpm',
      endpoint: 'dataset:aggregate',
      params: {
        aggregateBy: [{ dataTypeName: 'com.google.heart_rate.bpm' }],
        bucketByTime: { durationMillis: 300000 }, // 5 minute buckets for more granular data
        startTimeMillis: startTime.getTime(),
        endTimeMillis: now.getTime(),
      },
    },
    {
      dataTypeName: 'com.google.step_count.delta',
      endpoint: 'dataset:aggregate',
      params: {
        aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
        bucketByTime: { durationMillis: 300000 },
        startTimeMillis: startTime.getTime(),
        endTimeMillis: now.getTime(),
      },
    },
    {
      dataTypeName: 'com.google.calories.expended',
      endpoint: 'dataset:aggregate',
      params: {
        aggregateBy: [{ dataTypeName: 'com.google.calories.expended' }],
        bucketByTime: { durationMillis: 300000 },
        startTimeMillis: startTime.getTime(),
        endTimeMillis: now.getTime(),
      },
    },
  ];

  try {
    const responses = await Promise.all(
      datasets.map(async (dataset) => {
        const response = await fetch(`${GOOGLE_FIT_API_BASE}/${dataset.endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataset.params),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ${dataset.dataTypeName}`);
        }

        const data = await response.json();
        return {
          type: dataset.dataTypeName,
          data,
        };
      })
    );

    // Process the responses into our HealthMetric format
    const healthData = responses.reduce<Record<number, HealthMetrics>>((acc, response: ProcessedResponse) => {
      const buckets = response.data.bucket || [];
      
      buckets.forEach((bucket) => {
        const timestamp = parseInt(bucket.startTimeMillis);
        const dataset = bucket.dataset[0];
        
        if (!dataset || !dataset.point || dataset.point.length === 0) return;

        // Get the most recent point in the bucket
        const point = dataset.point[dataset.point.length - 1];
        if (!point || !point.value || point.value.length === 0) return;

        const value = point.value[0].fpVal || point.value[0].intVal || 0;
        
        if (!acc[timestamp]) {
          acc[timestamp] = {
            timestamp: timestamp.toString(), // Convert to string
            heartRate: 0,
            steps: 0,
            calories: 0,
            sleep: 0,
            hydration: 0,
            stress: 0,
          };
        }

        switch (response.type) {
          case 'com.google.heart_rate.bpm':
            acc[timestamp].heartRate = Math.round(value);
            break;
          case 'com.google.step_count.delta':
            acc[timestamp].steps = Math.round(value);
            break;
          case 'com.google.calories.expended':
            acc[timestamp].calories = Math.round(value);
            break;
        }
      });

      return acc;
    }, {});

    // Convert to array and sort by timestamp
    return Object.values(healthData).sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  } catch (error) {
    console.error('Error fetching Google Fit data:', error);
    throw error;
  }
}