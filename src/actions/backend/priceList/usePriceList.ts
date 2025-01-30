// hooks/usePriceList.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PaginatedPriceListResponse } from "@/types/priceListTypes";

interface CreatePriceListParams {
  priceName: string;
  idPrice?: string;
}

const useCreatePriceList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ priceName, idPrice }: CreatePriceListParams) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/price-list/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceName, idPrice })
      });

      if (!response.ok) throw new Error('Failed to create price list');

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceLists'] });
    }
  });
};

// hooks/useUpdatePriceList.ts
const useUpdatePriceList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ priceId, priceName, status, idPrice }: {
      priceId: string;
      priceName: string;
      status: boolean;
      idPrice?: string;
    }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/price-list/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, priceName, status, idPrice })
      });

      if (!response.ok) throw new Error('Failed to update price list');

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceLists'] });
    }
  });
};

const usePriceLists = (page: number, limit: number) => {
  return useQuery<PaginatedPriceListResponse>({
    queryKey: ['priceLists', page, limit],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/price-list/all?page=${page}&limit=${limit}`
      );

      if (!response.ok) throw new Error('API error');

      return response.json();
    }
  });
};

const usePriceListSearch = (query: string, page: number, limit: number) => {
  return useQuery<PaginatedPriceListResponse>({
    queryKey: ['priceListSearch', query, page, limit],
    queryFn: async () => {
      if (!query.trim()) return { items: [], totalItems: 0, totalPages: 0, currentPage: 1 };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/price-list/search?query=${query}&page=${page}&limit=${limit}`
      );

      if (!response.ok) throw new Error('API error');

      return response.json();
    },
    enabled: !!query.trim()
  });
};


const useDeletePriceList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (priceId: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/price-list/delete/${priceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete price list');

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceLists'] });
    }
  });
};

export { useCreatePriceList, useUpdatePriceList, useDeletePriceList, usePriceLists, usePriceListSearch };
