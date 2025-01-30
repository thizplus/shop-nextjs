// hooks/usePointSetting.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface PointSetting {
  isActive: boolean;
  pointsPerBaht: number;
}

interface PointSettingResponse {
  isActive: boolean;
  pointsPerBaht: number;
}

const usePointSetting = () => {
  return useQuery<PointSettingResponse>({
    queryKey: ['pointSetting'],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
      const url = `${baseUrl}/api/points/settings`;

      console.log('Fetching point settings from:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch point settings');
      }

      return response.json();
    }
  });
};

export const useUpdatePointSetting = () => {
  const queryClient = useQueryClient();

  return useMutation<PointSettingResponse, Error, Partial<PointSetting>>({
    mutationFn: async (data) => {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
      const url = `${baseUrl}/api/points/settings`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update point settings');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointSetting'] });
    }
  });
};

export type { PointSettingResponse, PointSetting };
export default usePointSetting;
