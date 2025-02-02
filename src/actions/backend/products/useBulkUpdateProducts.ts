import { useMutation, useQueryClient } from '@tanstack/react-query';

interface BulkUpdateRequest {
  skus: string[];
  prices?: { [priceId: string]: number };
  categories?: string[];
}

interface BulkUpdateResponse {
  success: boolean;
  message: string;
  updated?: {
    skus: number;
    categories: number;
    prices: number;
  };
}

export const useBulkUpdateProducts = () => {
  const queryClient = useQueryClient();
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  return useMutation<BulkUpdateResponse, Error, BulkUpdateRequest>({
    mutationFn: async (data: BulkUpdateRequest) => {
      const response = await fetch(`${serverUrl}/api/products/bulk-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries ที่เกี่ยวข้อง
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['searchProducts'] });

    },
  });
};
