// hooks/useClientPin.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface ClientPinData {
  pin: string | null;
  isPinVerified: boolean;
  pinCreatedAt: string | null;
}

interface UpdatePinParams {
  userId: string;
  pin: string;
}

export const useClientPin = (userId: string) => {
  const queryClient = useQueryClient();

  // Query สำหรับดึงข้อมูล PIN
  const {
    data: pinData,
    isLoading: isPinLoading,
    error: pinError
  } = useQuery<ClientPinData>({
    queryKey: ['clientPin', userId],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/clients/pin/${userId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch PIN');
      }


      return response.json();
    }
  });

  // Mutation สำหรับอัพเดท PIN
  const {
    mutate: updatePin,
    isPending: isUpdating,
    error: updateError,
    reset: resetUpdateState
  } = useMutation({
    mutationFn: async ({ userId, pin }: UpdatePinParams) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/clients/pin/update`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, pin }),
        }
      );

      if (!response.ok) {
        const error = await response.json();

        throw new Error(error.message || 'Failed to update PIN');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['clientPin', userId] });
      queryClient.invalidateQueries({ queryKey: ['client'] });
    },
  });

  return {
    pinData,
    isPinLoading,
    pinError,
    updatePin,
    isUpdating,
    updateError,
    resetUpdateState
  };
};
