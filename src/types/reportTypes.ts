// types/reportTypes.ts

import type {
  TypeOrder,
  OrderProduct,

} from './orderTypes';

// เพิ่ม cost และ profit สำหรับแต่ละสินค้า
export interface ReportOrderProduct extends OrderProduct {
  cost: number;
  totalCost: number;
  profit: number;
}

// ข้อมูลสรุปกำไร/ขาดทุน
export interface ProfitSummary {
  totalCost: number;    // ต้นทุนรวม
  grossProfit: number;  // กำไรขั้นต้น
  netProfit: number;    // กำไรสุทธิ
  updatedAt?: Date;
}

// ค่าใช้จ่ายคลัง
export interface WarehouseFees {
  shippingCost: number;  // ค่าขนส่ง
  serviceFee: number;    // ค่าบริการ
  totalFees: number;     // รวมค่าใช้จ่าย
}

// Order ที่มีข้อมูลเพิ่มเติมสำหรับ Report
export interface ReportOrder extends Omit<TypeOrder, 'listProducts'> {
  listProducts: ReportOrderProduct[];
  profitSummary?: ProfitSummary;
  warehouseFees?: WarehouseFees;
}

// สรุปรายวัน
export interface DailySummary {
  totalOrders: number;
  totalShippingCost: number;
  totalAmount: number;
  totalNetAmount: number;
  totalPaymentAmount: number;
  totalCost: number;
  totalGrossProfit: number;
  totalNetProfit: number;
  totalWarehouseFees: number;
}

// รายงานรายวัน
export interface DailyReport {
  date: string;
  orders: ReportOrder[];
  summary: DailySummary;
}

// ข้อมูลรายงานทั้งหมด
export interface OrderReport {
  dailyReports: DailyReport[];
  summary: DailySummary;
  dateRange: {
    start: Date;
    end: Date;
  };
}

// ตัวเลือกในการดึงรายงาน
export interface ReportOptions {
  startDate: Date;
  endDate: Date;
  page?: number;
  limit?: number;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

// Response จาก API
export interface ReportResponse {
  success: boolean;
  data: OrderReport;
  error?: string;
}
