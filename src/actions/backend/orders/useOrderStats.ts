// hooks/useOrderStats.ts
import { useQuery } from "@tanstack/react-query";

interface ProductStats {
  sku: string;
  name: string;
  totalQty: number;
  totalAmount: number;
  totalOrders: number;
  avgOrderValue: number;
  profitInfo?: {
    totalCost: number;    // ต้นทุนรวม
    grossProfit: number;  // กำไรขั้นต้น
    netProfit: number;    // กำไรสุทธิ
  };
}

interface CustomerStats {
  name: string;
  phone: string;
  orderCount: number;
  totalAmount: number;
  avgOrderValue: number;
  lastOrderDate: string;
  profitInfo?: {
    totalCost: number;
    grossProfit: number;
    netProfit: number;
  };
}

interface CategoryStats {
  name: string;
  totalAmount: number;
  totalOrders: number;
  totalItems: number;
  avgOrderValue: number;
  profitInfo?: {
    totalCost: number;
    grossProfit: number;
    netProfit: number;
  };
}

interface StatsSummary {
  totalProducts: number;
  totalCustomers: number;
  totalCategories: number;
  totalAmount: number;
  totalOrders: number;
  avgOrderValue: number;
  profitInfo: {
    totalCost: number;
    totalGrossProfit: number;
    totalNetProfit: number;
  };
}

interface StatsResponse {
  topProducts: ProductStats[];
  topCustomers: CustomerStats[];
  topCategories: CategoryStats[];
  summary: StatsSummary;
  dateRange: {
    start: string;
    end: string;
  };
}

const useOrderStats = (startDate: Date | null, endDate: Date | null) => {
  return useQuery({
    queryKey: ['orderStats', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      if (!startDate || !endDate) {
        throw new Error('Date range is required');
      }

      // ปรับเวลาให้ครอบคลุมทั้งวัน
      const start = new Date(startDate);

      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);

      end.setHours(23, 59, 59, 999);

      const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
      const url = `${baseUrl}/api/orders/stats?startDate=${start.toISOString()}&endDate=${end.toISOString()}`;

      console.log('Fetching stats with date range:', {
        start: start.toISOString(),
        end: end.toISOString()
      });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      return response.json();
    },
    enabled: Boolean(startDate && endDate)
  });
};

export type {
  StatsResponse,
  ProductStats,
  CustomerStats,
  CategoryStats,
  StatsSummary
};

export default useOrderStats;
