import { useState, useEffect, useCallback, useRef } from 'react';

import { useConfigStore } from '@/stores/configStore';
import { useClientStores } from '@/stores/authStore';
import type { TypeClient } from '@/types/clientTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8000';

export const useAuth = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchConfig } = useConfigStore();
  const { user, setUser, setLoggedIn, checkAuthStatus } = useClientStores();
  const tokenVerified = useRef(false);

  // Define handleLogout first
  const handleLogout = useCallback(() => {
    console.log('handleLogout called');
    localStorage.removeItem('lineLoginToken');
    setLoggedIn(false);
    setUser(null);
    tokenVerified.current = false;
  }, [setLoggedIn, setUser]);

  // Auto login function
  const attemptAutoLogin = useCallback(async () => {
    try {
      console.log('Attempting auto login...');
      const loginUrl = `${API_BASE_URL}/api/line/login?redirectUrl=${encodeURIComponent(window.location.href)}&autoLogin=true`;
      const response = await fetch(loginUrl);
      const data = await response.json();

      if (data.loginUrl) {
        window.location.href = data.loginUrl;
      }
    } catch (error) {
      console.error('Auto login error:', error);
    }
  }, []);

  // Auth status handler
  const handleAuthStatus = useCallback(async (token: string, profile: TypeClient) => {
    try {
      console.log('Checking auth status...');

      const statusResponse = await fetch(`${API_BASE_URL}/api/line/check-token`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statusResponse.status === 401) {
        console.log('Token expired, initiating auto login');
        handleLogout();
        await attemptAutoLogin();

        return;
      }

      const updatedProfile = await checkAuthStatus(token, profile);

      setUser(updatedProfile);
      setLoggedIn(true);
      tokenVerified.current = true;
      console.log('Auth status updated successfully');
    } catch (error) {
      console.error('Auth status error:', error);
      handleLogout();
      await attemptAutoLogin();
    }
  }, [checkAuthStatus, setUser, setLoggedIn, handleLogout, attemptAutoLogin]);

  // Token verification
  const verifyToken = useCallback(async (token: string) => {
    if (!token) {
      await attemptAutoLogin();

      return;
    }

    try {
      console.log('Verifying token...');

      const response = await fetch(`${API_BASE_URL}/api/line/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token })
      });

      if (response.status === 401) {
        console.log('Token invalid, initiating auto login');
        handleLogout();
        await attemptAutoLogin();

        return;
      }

      const data = await response.json();

      if (data.valid) {
        await handleAuthStatus(token, data.profile as TypeClient);
      } else {
        handleLogout();
        await attemptAutoLogin();
      }
    } catch (error) {
      console.error('Token verification error:', error);
      handleLogout();
      await attemptAutoLogin();
    }
  }, [handleAuthStatus, handleLogout, attemptAutoLogin]);

  // Token check interval
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('lineLoginToken');

      if (!token) {
        await attemptAutoLogin();

        return;
      }

      await verifyToken(token);
    };

    const interval = setInterval(checkToken, 5 * 60 * 1000);


    return () => clearInterval(interval);
  }, [verifyToken, attemptAutoLogin]);

  // Initialization
  useEffect(() => {
    const initialize = async () => {
      if (isInitialized) return;

      try {
        await fetchConfig();
        const token = localStorage.getItem('lineLoginToken');
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');

        if (tokenFromUrl) {
          localStorage.setItem('lineLoginToken', tokenFromUrl);
          await verifyToken(tokenFromUrl);
          window.history.replaceState({}, document.title, window.location.pathname);
        } else if (token) {
          await verifyToken(token);
        } else {
          await attemptAutoLogin();
        }
      } catch (error) {
        console.error('Initialization error:', error);
        await attemptAutoLogin();
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchConfig, verifyToken, attemptAutoLogin]);

  return {
    isInitialized,
    isLoading,
    user
  };
};
