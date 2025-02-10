// hooks/useOrderDetail.ts

import { useQuery } from '@tanstack/react-query';

import type { IOrder } from '@/types/orderDetialTypes';

const useOrderDetail = (orderId: string | null) => {
  return useQuery({
    queryKey: ['orderDetail', orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
      const response = await fetch(`${baseUrl}/api/orders/${orderId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch order detail');
      }

      return response.json() as Promise<IOrder>;
    },
    enabled: !!orderId
  });
};

export default useOrderDetail;
