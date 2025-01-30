// hooks/useDailyPayment.ts
import { useQuery } from "@tanstack/react-query";

import type { IDailyPayment } from "@/types/dailyPayment";

interface PaginatedResponse {
  items: IDailyPayment[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

const useDailyPayment = (page: number, limit: number) => {
  const shopName = process.env.NEXT_PUBLIC_SITE_NAME;

  return useQuery<PaginatedResponse>({
    queryKey: ['dailyPayments', shopName, page, limit],
    queryFn: async () => {
      const url = `${process.env.NEXT_PUBLIC_STORE_URL}/api/daily-payment/shop/${shopName}?page=${page}&limit=${limit}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('API error');

      return response.json();
    }
  });
};

const useDailyPaymentSearch = (query: string, page: number, limit: number) => {
  const shopName = process.env.NEXT_PUBLIC_SITE_NAME;

  return useQuery<PaginatedResponse>({
    queryKey: ['dailyPayments', 'search', query, page, limit],
    queryFn: async () => {
      const url = `${process.env.NEXT_PUBLIC_STORE_URL}/api/daily-payment/search/${shopName}?query=${query}&page=${page}&limit=${limit}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('API error');

      return response.json();
    },
    enabled: !!query
  });
};

export { useDailyPayment, useDailyPaymentSearch };
