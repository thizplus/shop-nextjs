// hooks/useCreateCategory.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { TypesCategory } from '@/types/categoryTypes';

interface CreateCategoryData {
  name: string;
  description: string;
}

const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<TypesCategory, Error, CreateCategoryData>({
    mutationFn: async (data: CreateCategoryData) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/category/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.message || 'Failed to create category');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category'] });
    },
  });
};

export default useCreateCategory;
