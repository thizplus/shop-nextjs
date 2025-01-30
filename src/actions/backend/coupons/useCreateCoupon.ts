// actions/backend/coupons/useCreateCoupon.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ICoupon } from '@/types/couponTypes';

interface CreateCouponData {
  code: string;
  type: 'cart' | 'shipping';
  value: number;
  isPercent: boolean;
  maxDiscount?: number;
  minPurchase?: number;
  startDate: Date;
  endDate: Date;
  usageLimit: number;
}

const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation<ICoupon, Error, CreateCouponData>({
    mutationFn: async (data: CreateCouponData) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/coupons`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            startDate: data.startDate.toISOString(),
            endDate: data.endDate.toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.message || 'Failed to create coupon');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export default useCreateCoupon;
