
import axios from 'axios';

/**
 * Server Health Manager
 * Implements a "Circuit Breaker" pattern to prevent multiple requests 
 * when the server is unreachable.
 */

class ServerHealthManager {
  private isDown: boolean = false;
  private checkInterval: number | null = null;
  private readonly POLLING_INTERVAL = 30000; // 30 seconds
  private readonly HEALTH_CHECK_URL = import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com';

  /**
   * Returns true if the server is known to be unreachable
   */
  public isServerDown(): boolean {
    return this.isDown;
  }

  /**
   * Reports a network error to the manager
   */
  public reportNetworkError(): void {
    if (this.isDown) return;

    this.isDown = true;
    console.error('Server is unreachable. Entering circuit breaker mode.');
    
    // Notify the UI via a custom event if needed
    window.dispatchEvent(new CustomEvent('server-status-change', { detail: { isDown: true } }));

    this.startRecoveryPolling();
  }

  /**
   * Resets the server status to UP
   */
  private setServerUp(): void {
    if (!this.isDown) return;

    this.isDown = false;
    this.stopRecoveryPolling();
    console.info('Server is back online. Circuit breaker reset.');
    
    window.dispatchEvent(new CustomEvent('server-status-change', { detail: { isDown: false } }));
    
    if ((window as any).showToast) {
      (window as any).showToast('success', 'Server Reconnected', 'Connection to the server has been restored.');
    }
  }

  /**
   * Periodically checks if the server is back online
   */
  private startRecoveryPolling(): void {
    if (this.checkInterval) return;

    this.checkInterval = window.setInterval(async () => {
      try {
        // Simple head request or small GET to check connectivity
        // We use a clean axios instance to avoid our own interceptors
        await axios.get(`${this.HEALTH_CHECK_URL}/health`, { timeout: 5000 }).catch(async (e) => {
           // If /health doesn't exist (404), it still means the server responded
           if (e.response) return e.response;
           throw e;
        });
        
        this.setServerUp();
      } catch (error) {
        console.debug('Health check failed, server still unreachable.');
      }
    }, this.POLLING_INTERVAL);
  }

  private stopRecoveryPolling(): void {
    if (this.checkInterval) {
      window.clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const serverHealth = new ServerHealthManager();
