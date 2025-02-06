import { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdatePriceNameParams {
  priceId: string;
  priceName: string;
}

interface UpdatePriceNameResponse {
  message: string;
  priceList: {
    priceName: string;
    priceId: string;
  }
}

export const useUpdatePriceName = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useMutation<UpdatePriceNameResponse, Error, UpdatePriceNameParams>({
    mutationFn: async ({ priceId, priceName }: UpdatePriceNameParams) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/price-list/update-name`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ priceId, priceName }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.message || 'Failed to update price name');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceLists'] });
      queryClient.invalidateQueries({ queryKey: ['productsByPriceId'] });
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'An error occurred');
    },
  });

  return {
    updatePriceName: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    error,
    clearError: () => setError(null)
  };
};

export default useUpdatePriceName;
