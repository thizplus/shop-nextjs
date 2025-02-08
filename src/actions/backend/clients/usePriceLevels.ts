// hooks/usePriceLevels.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PriceLevel {
  id: string;
  name: string;
  minPurchase: number;
  allowedUsers: string[];
}

export const usePriceLevels = (userId: string) => {
  const queryClient = useQueryClient();

  // Fetch all price levels
  const {
    data: priceLevels = [],
    isLoading,
    error: fetchError,
    refetch
  } = useQuery<PriceLevel[]>({
    queryKey: ['price-levels', userId], // เพิ่ม userId ใน queryKey
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/price-list/with-access`
      );

      if (!response.ok) {
        const error = await response.json();

        throw new Error(error.message || 'Failed to fetch price levels');
      }

      return response.json();
    },
    staleTime: 30000, // Cache for 30 seconds
    retry: 2 // Retry failed requests twice
  });

  // Mutation for updating user's price levels
  const updatePriceLevels = useMutation({
    mutationFn: async (priceIds: string[]) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/price-list/update-access`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, priceIds }),
        }
      );

      if (!response.ok) {
        const error = await response.json();

        throw new Error(error.message || 'Failed to update prices');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Log success
      console.log('Price levels updated:', data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['price-levels'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });

      // Refetch immediately
      refetch();
    },
    onError: (error) => {
      console.error('Failed to update price levels:', error);
    }
  });

  return {
    priceLevels,
    isLoading,
    fetchError,
    updatePriceLevels,
    refetch
  };
};
