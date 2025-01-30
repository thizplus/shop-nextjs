// hooks/usePointTickets.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { IPointTicket } from '@/types/pointTypes';

interface PointTicketResponse {
  items: IPointTicket[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export const usePointTickets = (page: number, limit: number) => {
  return useQuery<PointTicketResponse>({
    queryKey: ['pointTickets', page, limit],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
      const url = `${baseUrl}/api/points/tickets?page=${page}&limit=${limit}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch point tickets');
      }

      return response.json();
    }
  });
};

export const useCreatePointTicket = () => {
  const queryClient = useQueryClient();

  return useMutation<IPointTicket, Error, Partial<IPointTicket>>({
    mutationFn: async (data) => {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
      const url = `${baseUrl}/api/points/tickets`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to create point ticket');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointTickets'] });
    }
  });
};

export const useToggleTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<IPointTicket, Error, string>({
    mutationFn: async (ticketId: string) => {
      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;

      const response = await fetch(
        `${baseUrl}/api/points/tickets/${ticketId}/toggle`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to toggle ticket status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointTickets'] });
    },
  });
};
