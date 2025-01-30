// hooks/useUpdateProduct.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { TypesProduct } from '@/types/productTypes';

// อัพเดท interface ให้รับ categories เป็น array ของ IDs
interface UpdateProductData {
  categories: string[];  // ยังคงส่ง array ของ IDs ไป API
}

export const useUpdateProduct = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation<TypesProduct, Error, UpdateProductData>({
    mutationFn: async (data: UpdateProductData) => {
      console.log('Sending update data:', data); // เพิ่ม log เพื่อตรวจสอบข้อมูลที่ส่ง

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/products/update/${productId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();

        throw new Error(error.message || 'Failed to update product');
      }

      const result = await response.json();

      console.log('Update response:', result); // เพิ่ม log เพื่อตรวจสอบ response

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['searchProducts'] });
    },
  });
};
