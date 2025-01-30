import { useEffect, useState } from "react";

// hooks/usePin.ts
interface UsePinResult {
  handlePinSubmit: (pin: string) => Promise<void>;
  error: string | null;
  isVerifying: boolean;
  hasPin: boolean;
}

export const usePin = (userId: string | undefined): UsePinResult => {
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasPin, setHasPin] = useState(false);

  const checkUserPin = async () => {
    if (!userId) return;

    try {
      const userRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/clients/user/${userId}`);

      if (!userRes.ok) throw new Error('Failed to fetch user data');

      const userData = await userRes.json();

      setHasPin(!!userData.data?.pin);
    } catch (err) {
      console.error('Error checking PIN:', err);
    }
  };

  useEffect(() => {
    checkUserPin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handlePinSubmit = async (pin: string) => {
    if (!userId) return;

    try {
      setIsVerifying(true);
      setError(null);

      if (!hasPin) {
        const setPinRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/clients/set-pin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin, userId })
        });

        if (!setPinRes.ok) {
          throw new Error('PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        }

        setHasPin(true);
      } else {
        const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/clients/verify-pin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin, userId })
        });

        if (!verifyRes.ok) {
          throw new Error('PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      throw err;
    } finally {
      setIsVerifying(false);
    }
  };

  return { handlePinSubmit, error, isVerifying, hasPin };
};
