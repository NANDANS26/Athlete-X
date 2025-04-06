interface GoogleFitData {
  heartRate: number;
  steps: number;
  calories: number;
  sleep: number;
  hydration: number;
  stress: number;
  distance?: number;
  activities?: string[];
}

// Get the OAuth token from localStorage
const getStoredOAuthToken = (): string | null => {
  return localStorage.getItem('googleFitToken');
};

// Store the OAuth token in localStorage
const storeOAuthToken = (token: string) => {
  localStorage.setItem('googleFitToken', token);
};


// Exchange authorization code for access token
export const exchangeCodeForToken = async (code: string): Promise<string> => {
  const clientId = import.meta.env.VITE_GOOGLE_FIT_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_GOOGLE_FIT_CLIENT_SECRET;
  const redirectUri = `${window.location.origin}/google-fit-callback`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const data = await tokenResponse.json();
  localStorage.setItem('googleFitToken', data.access_token);
  localStorage.setItem('googleFitRefreshToken', data.refresh_token); // Store refresh token
  return data.access_token;
};

// Refresh the OAuth token using the refresh token
const refreshOAuthToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('googleFitRefreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const clientId = import.meta.env.VITE_GOOGLE_FIT_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_GOOGLE_FIT_CLIENT_SECRET;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  const data = await tokenResponse.json();
  storeOAuthToken(data.access_token);
  return data.access_token;
};

// Fetch Google Fit data
export const fetchGoogleFitData = async (): Promise<GoogleFitData> => {
  try {
    let oauthToken = getStoredOAuthToken();
    if (!oauthToken) {
      throw new Error('No OAuth token available');
    }

    const fetchData = async (token: string) => {
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;

      const endTimeNanos = now * 1000000;
      const startTimeNanos = oneDayAgo * 1000000;

      const [heartRateResponse, stepsResponse, caloriesResponse, activitiesResponse] = await Promise.all([
        fetch(
          `https://www.googleapis.com/fitness/v1/users/me/dataSources/derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm/datasets/${startTimeNanos}-${endTimeNanos}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        fetch(
          `https://www.googleapis.com/fitness/v1/users/me/dataSources/derived:com.google.step_count.delta:com.google.android.gms:estimated_steps/datasets/${startTimeNanos}-${endTimeNanos}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        fetch(
          `https://www.googleapis.com/fitness/v1/users/me/dataSources/derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended/datasets/${startTimeNanos}-${endTimeNanos}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        fetch(
          `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(oneDayAgo).toISOString()}&endTime=${new Date(now).toISOString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      return { heartRateResponse, stepsResponse, caloriesResponse, activitiesResponse };
    };

    let response = await fetchData(oauthToken);

    // If the request fails with 401, refresh the token and retry
    if (response.heartRateResponse.status === 401) {
      oauthToken = await refreshOAuthToken();
      response = await fetchData(oauthToken);
    }

    const [heartRateData, stepsData, caloriesData, activitiesData] = await Promise.all([
      response.heartRateResponse.json(),
      response.stepsResponse.json(),
      response.caloriesResponse.json(),
      response.activitiesResponse.json(),
    ]);

    // Process heart rate data
    let latestHeartRate = 0;
    if (heartRateData.point && heartRateData.point.length > 0) {
      const sortedPoints = heartRateData.point.sort((a: any, b: any) =>
        parseInt(b.endTimeNanos) - parseInt(a.endTimeNanos)
      );
      latestHeartRate = sortedPoints[0].value[0].fpVal;
    }

    // Process steps data
    let totalSteps = 0;
    if (stepsData.point) {
      totalSteps = stepsData.point.reduce((sum: number, point: any) =>
        sum + (point.value[0].intVal || 0), 0
      );
    }

    // Process calories data
    let totalCalories = 0;
    if (caloriesData.point) {
      totalCalories = caloriesData.point.reduce((sum: number, point: any) =>
        sum + (point.value[0].fpVal || 0), 0
      );
    }

    // Process activities data
    let activities: string[] = [];
    if (activitiesData.session) {
      activities = activitiesData.session.map((session: any) => session.name);
    }

    return {
      heartRate: Math.round(latestHeartRate),
      steps: totalSteps,
      calories: Math.round(totalCalories),
      sleep: 7.5, // Placeholder for sleep data
      hydration: 65, // Placeholder for hydration data
      stress: 30, // Placeholder for stress data
      activities,
    };
  } catch (error) {
    console.error('Error fetching Google Fit data:', error);
    throw error;
  }
};