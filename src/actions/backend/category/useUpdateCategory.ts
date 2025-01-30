// hooks/useUpdateCategory.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { TypesCategory } from '@/types/categoryTypes';

interface UpdateCategoryData {
  _id: string;
  name: string;
  description: string;
}

const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<TypesCategory, Error, UpdateCategoryData>({
    mutationFn: async (data: UpdateCategoryData) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/category/update`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.message || 'Failed to update category');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category'] });
    },
  });
};

export default useUpdateCategory;
