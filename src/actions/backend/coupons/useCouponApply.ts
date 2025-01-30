// hooks/useCouponApply.ts
import { useState } from 'react';

interface CouponApplyProps {
  couponId: string;
  orderId: string;
  userId: string;
  amount: number;
}

export const useCouponApply = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyCoupon = async ({ couponId, orderId, userId, amount }: CouponApplyProps) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/coupons/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          couponId,
          orderId,
          userId,
          amount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to apply coupon');
      }

      return await response.json();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    applyCoupon,
    loading,
    error
  };
};
