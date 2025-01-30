// actions/backend/coupons/useCouponsAll.ts// hooks/useOrdersAll.ts
import { useQuery } from "@tanstack/react-query";

import type { ICoupon } from "@/types/couponTypes";



interface PaginatedResponse {
  items: ICoupon[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

const useOrdersAll = (page: number, limit: number) => {
  return useQuery<PaginatedResponse, Error>({
    queryKey: ['coupons', page, limit],
    queryFn: async () => {
      const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/coupons?page=${page}&limit=${limit}`;

      console.log('Fetching orders data from:', url);

      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text();

        console.error('API Response:', text);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      console.log('Orders API data received:', data);

      return {
        items: data.items || [],
        totalItems: data.totalItems,
        totalPages: data.totalPages,
        currentPage: data.currentPage
      };
    },
    placeholderData: (previousData) => previousData,
  });
};

export default useOrdersAll;

