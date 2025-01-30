// src/actions/backend/products/useSearchProducts.ts
import { useQuery } from '@tanstack/react-query';

interface Product {
  _id: string;
  sku: string;
  name: string;
  availablestock: number;
  category: string;
}

const useSearchProducts = (searchTerm: string) => {
  return useQuery({
    queryKey: ['searchProducts', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/client-search?q=${encodeURIComponent(searchTerm)}`

        // เปลี่ยนจาก /search เป็น /client-search
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json() as Promise<Product[]>;
    },
    enabled: searchTerm.length >= 2, // Only search when input is at least 2 characters
    staleTime: 30000, // Cache results for 30 seconds
  });
};

export default useSearchProducts;
