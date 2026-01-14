import type { UserData } from '../types';
import { STORAGE_KEYS } from '../constants';

class AuthManager {
  private static instance: AuthManager;
  private token: string | null = null;
  private user: UserData | null = null;
  private listeners: ((user: UserData | null) => void)[] = [];

  private constructor() {
    this.loadStoredAuth();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private loadStoredAuth(): void {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const userStr = localStorage.getItem(STORAGE_KEYS.USER_DATA);

      if (token && userStr) {
        if (this.isTokenExpired(token)) {
          this.clearStoredAuth();
          return;
        }
        this.token = token;
        this.user = JSON.parse(userStr);
      }
    } catch (error) {
      console.warn('Failed to load stored auth:', error);
      this.clearStoredAuth();
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false;
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch (e) {
      return true;
    }
  }

  private saveStoredAuth(token: string, user: UserData): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    this.token = token;
    this.user = user;
    this.notifyListeners();
  }

  private clearStoredAuth(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    this.token = null;
    this.user = null;
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.user));
  }

  setSession(token: string, user: UserData): void {
    this.saveStoredAuth(token, user);
  }

  logout(): void {
    this.clearStoredAuth();
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): UserData | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!(this.token && this.user);
  }

  addListener(listener: (user: UserData | null) => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: (user: UserData | null) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }
}

export const authManager = AuthManager.getInstance();
