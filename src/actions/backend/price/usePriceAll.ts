import { useQuery } from "@tanstack/react-query";

import type { TypePrice } from "@/types/priceTypes";



interface PaginatedPriceResponse {
  items: TypePrice[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

const usePriceAll = (page: number, limit: number) => {
  return useQuery<PaginatedPriceResponse, Error>({
    queryKey: ['prices', page, limit],
    queryFn: async () => {
      const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/store/prices/all?page=${page}&limit=${limit}`;

      console.log('Fetching price data from:', url);

      const response = await fetch(url);

      if (!response.ok) {
        const text = await response.text();

        console.error('API Response:', text);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      console.log('API price data received:', data);

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

export default usePriceAll;
