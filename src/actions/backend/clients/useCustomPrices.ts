// src/actions/backend/clients/useCustomPrices.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CustomPrice {
  sku: string;
  price: number;
  name?: string;
}

const useCustomPrices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, prices }: {
      userId: string;
      prices: CustomPrice[]
    }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/clients/custom-prices/${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prices }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update custom prices');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries after successful update
      queryClient.invalidateQueries({ queryKey: ['client'] });
    },
  });
};

export default useCustomPrices;
