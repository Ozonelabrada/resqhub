import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { FeatureFlagProvider } from './context/FeatureFlagContext';
import { UIProvider } from './context/UIContext';
import { BrowserRouter } from 'react-router-dom';
import './lib/i18n';
import './index.css';

// Initialize PWA
import { initPWAManager } from './pwa/pwaManager';

initPWAManager({
  enableAutoUpdate: true,
  checkUpdateInterval: 60000,
  onServiceWorkerReady: (registration) => {
    console.log('✅ PWA is ready - app works offline');
  },
  onServiceWorkerUpdate: (registration) => {
    // Show update notification to user
    const updateNotification = document.createElement('div');
    updateNotification.innerHTML = `
      <div style="position: fixed; bottom: 20px; right: 20px; background: #14b8a6; color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999; max-width: 300px;">
        <p style="margin: 0 0 10px 0; font-weight: bold;">Update Available</p>
        <p style="margin: 0 0 15px 0; font-size: 14px;">A new version of FindrHub is available.</p>
        <button onclick="location.reload()" style="background: white; color: #14b8a6; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%;">
          Update Now
        </button>
      </div>
    `;
    document.body.appendChild(updateNotification);
  },
});

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <FeatureFlagProvider>
            <UIProvider>
              <App />
            </UIProvider>
          </FeatureFlagProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  throw new Error("Root element with id 'root' not found");
}
