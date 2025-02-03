// hooks/useSearchProducts.ts
import { useQuery } from '@tanstack/react-query';

import type { ISearchProduct } from '@/types/productTypes';





const useSearchProducts = (searchTerm: string) => {
  return useQuery<ISearchProduct[]>({
    queryKey: ['searchProducts', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/client-search?q=${encodeURIComponent(searchTerm)}`
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    },
    enabled: searchTerm.length >= 2,
    staleTime: 30000,
  });
};

export default useSearchProducts;
