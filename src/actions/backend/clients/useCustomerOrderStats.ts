// hooks/useCustomerOrderStats.ts
import { useState, useEffect } from 'react';

interface CustomerProductStats {
  sku: string;
  name: string;
  totalQty: number;
  totalAmount: number;
  imagePath: string | null;
  categories: Array<{
    catId: string;
    name: string;
  }>;
}

interface CustomerStatsSummary {
  totalAmount: number;
  totalOrders: number;
  avgOrderValue: number;
  topProducts: CustomerProductStats[];
  topCategories: Array<{
    catId: string;
    name: string;
    totalAmount: number;
    totalItems: number;
  }>;
}

interface StatsResponse {
  summary: CustomerStatsSummary;
  dateRange: {
    start: string;
    end: string;
  };
}

const useCustomerOrderStats = (
  userId: string,
  typeId: string,
  startDate: Date | null,
  endDate: Date | null
) => {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!startDate || !endDate || !userId || !typeId) return;

      setIsLoading(true);
      setError(null);

      try {
        const start = new Date(startDate);

        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);

        end.setHours(23, 59, 59, 999);

        const params = new URLSearchParams({
          userId,
          typeId,
          startDate: start.toISOString(),
          endDate: end.toISOString()
        });

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/customer-stats?${params}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch customer stats');
        }

        const result = await response.json();

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userId, typeId, startDate, endDate]);

  return { data, isLoading, error };
};

export type { StatsResponse, CustomerProductStats, CustomerStatsSummary };
export default useCustomerOrderStats;
