// hooks/useOrderReport.ts
import { useQuery } from "@tanstack/react-query";

interface OrderDetail {
  orderId: string;
  customerName: string;
  shippingCost: number;
  totalAmount: number;
  netTotal: number;
  status: string;
  createdAt: string;
  payment: {
    amount: number;
  };

  // เพิ่มส่วนข้อมูลกำไร/ขาดทุน
  profitInfo?: {
    totalCost: number;    // ต้นทุนรวม
    grossProfit: number;  // กำไรขั้นต้น
    netProfit: number;    // กำไรสุทธิ
  };
  warehouseFees?: {
    shippingCost: number;
    serviceFee: number;
    totalFees: number;
  };
}

interface Summary {
  totalOrders: number;
  totalShippingCost: number;
  totalAmount: number;
  totalNetAmount: number;
  totalPaymentAmount: number;

  // เพิ่มส่วนสรุปกำไร/ขาดทุน
  totalCost: number;         // ต้นทุนรวม
  totalGrossProfit: number;  // กำไรขั้นต้นรวม
  totalNetProfit: number;    // กำไรสุทธิรวม
  totalWarehouseFees: number; // ค่าใช้จ่ายคลังรวม
}

interface DailyReport {
  date: string;
  orders: OrderDetail[];
  summary: Summary;
}

interface ReportResponse {
  dailyReports: DailyReport[];
  summary: Summary;
  dateRange: {
    start: string;
    end: string;
  };
}

const useOrderReport = (startDate: Date | null, endDate: Date | null) => {
  return useQuery({
    queryKey: ['orderReport', startDate?.toISOString(), endDate?.toISOString()],
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
      const url = `${baseUrl}/api/orders/report?startDate=${start.toISOString()}&endDate=${end.toISOString()}`;

      console.log('Fetching report with date range:', {
        start: start.toISOString(),
        end: end.toISOString()
      });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch report');
      }

      return response.json();
    },
    enabled: Boolean(startDate && endDate)
  });
};

export type { ReportResponse, DailyReport, OrderDetail, Summary };
export default useOrderReport;
