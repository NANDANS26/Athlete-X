import { useEffect } from 'react';

const StravaCallback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (code) {
      window.opener.postMessage({
        type: 'oauth_callback',
        provider: 'strava',
        success: true,
        code
      }, window.location.origin);
    } else {
      window.opener.postMessage({
        type: 'oauth_callback',
        provider: 'strava',
        success: false,
        error: error || 'Authorization failed'
      }, window.location.origin);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      <p className="text-white">Processing Strava authorization...</p>
    </div>
  );
};

export default StravaCallback;