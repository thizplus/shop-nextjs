// actions/backend/clients/useGrabDelivery.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useGrabDelivery = (userId: string) => {
  const queryClient = useQueryClient();

  const updateGrabDelivery = useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/clients/update-grab-delivery`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          enableGrabDelivery: enabled
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update grab delivery status');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['client'] });
      queryClient.invalidateQueries({ queryKey: ['searchClient'] });
    },
    onError: (error) => {
      console.error('Error updating grab delivery status:', error);
    }
  });

  return {
    updateGrabDelivery
  };
};
