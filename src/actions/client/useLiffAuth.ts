import { useState, useEffect, useCallback, useRef } from 'react';

import { liff } from '@line/liff';

import { useConfigStore } from '@/stores/configStore';
import { useClientStores } from '@/stores/authStore';
import type { TypeClientVerify } from '@/types/clientTypes';

export const useLiffAuth = (priceId?: string) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLiffLoading, setIsLiffLoading] = useState(true);
  const [liffError, setLiffError] = useState<string | null>(null);
  const { config, fetchConfig } = useConfigStore();
  const { user, setUser, setLoggedIn } = useClientStores();
  const initAttempted = useRef(false);
  const loginAttempted = useRef(false);

  const getLiffId = useCallback((config: any, priceId?: string): string | null => {
    if (!config) return null;

    if (priceId && priceId !== 'store') {
      const priceConfig = config.saleModel.listPrice.find((price: any) => price.id === priceId);


      return priceConfig?.LIFF_ID || null;
    }

    return config.lineLogin.LINE_LIFF_ID || null;
  }, []);

  const initializeLiff = useCallback(async (liffId: string) => {
    if (!liffId || initAttempted.current) {
      setIsLiffLoading(false);

      return;
    }

    initAttempted.current = true;
    console.log('=== Starting LIFF initialization ===');

    try {
      await liff.init({
        liffId,
        withLoginOnExternalBrowser: true
      });

      const isInClient = liff.isInClient();
      const isLoggedIn = liff.isLoggedIn();

      console.log('LIFF Status:', { isInClient, isLoggedIn });

      if (!isLoggedIn && !loginAttempted.current) {
        loginAttempted.current = true;
        console.log('Redirecting to LINE login...');
        liff.login({ redirectUri: window.location.href });

        return;
      }

      if (isLoggedIn) {
        const profile = await liff.getProfile();
        const accessToken = liff.getAccessToken();

        if (!accessToken) {
          throw new Error('No access token available');
        }

        // สร้าง user profile ตาม context
        const userProfile: TypeClientVerify = {
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl || '',
          userType: priceId && priceId !== 'store' ? 'wholesale' : 'store',
          idType: priceId || 'store'
        };

        //  console.log('Verifying with profile:', userProfile);
        // console.log('Access Token:', accessToken);

        // ส่ง request ไปยัง backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/line/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(userProfile)
        });

        if (!response.ok) {
          const error = await response.json();

          throw new Error(error.message || 'Failed to verify token');
        }

        const updatedProfile = await response.json();

        // console.log('Backend verification successful:', updatedProfile);

        setUser(updatedProfile);
        setLoggedIn(true);
        setIsInitialized(true);
      }

    } catch (error) {
      console.error('LIFF Error:', error);
      setLiffError(error instanceof Error ? error.message : 'LIFF initialization failed');
      setLoggedIn(false);
      setUser(null);
      initAttempted.current = false;
      loginAttempted.current = false;
    } finally {
      setIsLiffLoading(false);
    }
  }, [priceId, setUser, setLoggedIn]); // เพิ่ม priceId เข้าไปใน dependencies

  // Single effect for initialization
  useEffect(() => {
    const initialize = async () => {
      try {
        if (!config) {
          await fetchConfig();

          return;
        }

        const liffId = getLiffId(config, priceId);

        if (!liffId) {
          throw new Error('LIFF ID not found');
        }

        await initializeLiff(liffId);
      } catch (error) {
        console.error('Initialization error:', error);
        setLiffError(error instanceof Error ? error.message : 'Initialization failed');
        setIsLiffLoading(false);
      }
    };

    if (!isInitialized && !initAttempted.current) {
      initialize();
    }
  }, [config, fetchConfig, initializeLiff, priceId, getLiffId, isInitialized]);

  const handleLogout = useCallback(() => {
    if (liff) {
      liff.logout();
    }

    setLoggedIn(false);
    setUser(null);
    initAttempted.current = false;
    loginAttempted.current = false;
    window.location.reload(); // Refresh page after logout
  }, [setLoggedIn, setUser]);

  return {
    isInitialized,
    isLiffLoading,
    user,
    liffError,
    handleLogout
  };
};
