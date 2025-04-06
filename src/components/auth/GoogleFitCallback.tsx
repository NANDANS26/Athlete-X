import { useEffect } from 'react';
import { exchangeCodeForToken } from '../services/googleFit'; // Correct import path

const GoogleFitCallback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    const handleAuthorization = async () => {
      try {
        if (code) {
          const accessToken = await exchangeCodeForToken(code);
          localStorage.setItem('googleFitToken', accessToken);
          
          // Enhanced window.opener check
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
              type: 'oauth_callback',
              provider: 'google_fit',
              success: true,
              token: accessToken,
            }, window.location.origin);
          } else {
            // Fallback for production
            window.location.href = `${window.location.origin}?googleFitAuth=success`;
          }
        } else if (error) {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
              type: 'oauth_callback',
              provider: 'google_fit',
              success: false,
              error: error || 'Authorization failed',
            }, window.location.origin);
          } else {
            window.location.href = `${window.location.origin}?googleFitAuth=failed&error=${error}`;
          }
        }
      } catch (err) {
        console.error('Auth error:', err);
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'oauth_callback',
            provider: 'google_fit',
            success: false,
            error: 'Token exchange failed',
          }, window.location.origin);
        } else {
          window.location.href = `${window.location.origin}?googleFitAuth=failed&error=token_exchange`;
        }
      } finally {
        // Close only if we're a popup
        if (window.opener) {
          window.close();
        }
      }
    };

    handleAuthorization();
  }, []);

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-center">
        <p className="text-white mb-4">Completing Google Fit connection...</p>
        <p className="text-gray-400 text-sm">
          If this doesn't close automatically, you may safely close this window.
        </p>
      </div>
    </div>
  );
};

export default GoogleFitCallback;
