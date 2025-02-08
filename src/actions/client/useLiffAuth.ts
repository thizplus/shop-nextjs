// hooks/useLiffAuth.ts
import { useState, useEffect, useCallback, useRef } from 'react';

import { liff } from '@line/liff';

import { useClientStores } from '@/stores/authStore';
import type { TypeClientVerify } from '@/types/clientTypes';

export const useLiffAuth = (liffId?: string, priceId?: string) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLiffLoading, setIsLiffLoading] = useState(true);
  const [liffError, setLiffError] = useState<string | null>(null);
  const { user, setUser, setLoggedIn } = useClientStores();

  const initAttempted = useRef(false);
  const loginAttempted = useRef(false);

  // Validate required params
  useEffect(() => {
    if (!priceId) {
      console.error('priceId is required for LIFF authentication');
      setLiffError('ไม่พบข้อมูลร้านค้า');
      setIsLiffLoading(false);

      return;
    }
  }, [priceId]);

  // Function to get correct LIFF ID with validation
  const getLiffId = useCallback(async (): Promise<string | null> => {
    if (!liffId) {
      console.warn('LIFF ID not provided');

      return null;
    }


    return liffId;
  }, [liffId]);

  const initializeLiff = useCallback(async (currentLiffId: string) => {
    if (!currentLiffId || initAttempted.current) {
      setIsLiffLoading(false);

      return;
    }

    if (!priceId) {
      setLiffError('ไม่พบข้อมูลร้านค้า');
      setIsLiffLoading(false);

      return;
    }

    initAttempted.current = true;
    console.log('=== Starting LIFF initialization ===');

    try {
      await liff.init({
        liffId: currentLiffId,
        withLoginOnExternalBrowser: true
      });

      const isInClient = liff.isInClient();
      const isLoggedIn = liff.isLoggedIn();

      console.log('LIFF Status:', { isInClient, isLoggedIn });

      if (!isLoggedIn && !loginAttempted.current) {
        loginAttempted.current = true;

        // สร้าง redirect URL ที่มี priceId
        const currentUrl = new URL(window.location.href);

        currentUrl.pathname = `/wholesale/${priceId}`;

        console.log('Redirecting to LINE login with URL:', currentUrl.toString());
        liff.login({ redirectUri: currentUrl.toString() });

        return;
      }

      if (isLoggedIn) {
        const profile = await liff.getProfile();
        const accessToken = liff.getAccessToken();

        if (!accessToken) {
          throw new Error('No access token available');
        }

        // สร้าง user profile with validation
        const userProfile: TypeClientVerify = {
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl || '',
          userType: priceId === 'store' ? 'store' : 'wholesale',
          idType: priceId // ใช้ priceId โดยตรง ไม่ต้องมีเงื่อนไข
        };

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
  }, [priceId, setUser, setLoggedIn]);

  useEffect(() => {
    const initialize = async () => {
      if (!isInitialized && !initAttempted.current && priceId) {
        const currentLiffId = await getLiffId();

        if (currentLiffId) {
          await initializeLiff(currentLiffId);
        } else {
          setLiffError('LIFF ID not found');
          setIsLiffLoading(false);
        }
      }
    };

    initialize();
  }, [getLiffId, initializeLiff, isInitialized, priceId]);

  const handleLogout = useCallback(() => {
    if (liff) {
      liff.logout();
    }

    setLoggedIn(false);
    setUser(null);
    initAttempted.current = false;
    loginAttempted.current = false;

    // Redirect to the correct URL after logout
    if (priceId) {
      window.location.href = `/wholesale/${priceId}`;
    } else {
      window.location.reload();
    }
  }, [setLoggedIn, setUser, priceId]);

  return {
    isInitialized,
    isLiffLoading,
    user,
    liffError,
    handleLogout
  };
};
