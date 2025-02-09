// types/reportTypes.ts
import type { ObjectId } from "mongodb";

// Base types
export interface OrderProduct {
  _id?: ObjectId;
  sku: string;
  name: string;
  price: number;
  qty: number;
  total: number;
}

export interface ShippingInfo {
  _id: string;
  customerName: string;
  cusTel: string;
  addressNo: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
  location?: string;
  isDefault: boolean;
  trackingNo?: string;
  shippingChannel?: string;
  trackingUpdateAt?: string | Date;
}

// Report specific types
export interface ReportOrderProduct extends OrderProduct {
  cost: number;
  totalCost: number;
  profit: number;
}

export interface ProfitSummary {
  totalCost: number;
  grossProfit: number;
  netProfit: number;
  updatedAt?: Date;
}

export interface WarehouseFees {
  shippingCost: number;
  serviceFee: number;
  totalFees: number;
}

export interface ReportOrder {
  orderId: string;
  customerName: string;
  totalAmount: number;
  netTotal: number;
  shippingCost: number;
  status: string;
  createdAt: string;
  payment: {
    amount: number;
    status?: string;
  };
  shippingInfo: ShippingInfo;
  listProducts: ReportOrderProduct[];
  profitSummary?: ProfitSummary;
  warehouseFees?: WarehouseFees;
  discountAmount?: number;
}

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

export interface DailyReport {
  date: string;
  orders: ReportOrder[];
  summary: DailySummary;
}

export interface OrderReport {
  dailyReports: DailyReport[];
  summary: DailySummary;
  dateRange: {
    start: Date;
    end: Date;
  };
}

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

export interface ReportResponse {
  success: boolean;
  data: OrderReport;
  error?: string;
}
