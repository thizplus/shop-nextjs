// actions/backend/coupons/useToggleCouponStatus.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ICoupon } from '@/types/couponTypes';

const useToggleCouponStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<ICoupon, Error, string>({
    mutationFn: async (couponId: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/coupons/${couponId}/toggle`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to toggle coupon status');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
};

export default useToggleCouponStatus;
