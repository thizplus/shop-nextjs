// types/order.ts
export interface IProduct {
  sku: string;
  name: string;
  price: number;      // ราคาขาย
  cost?: number;      // ราคาต้นทุน
  qty: number;
  total: number;      // ยอดขายรวม (price * qty)
  totalCost?: number; // ต้นทุนรวม (cost * qty)
  profit?: number;    // กำไรต่อชิ้น (price - cost)
}

export interface IShippingInfo {
  cusName: string;
  cusTel: string;
  addressNo: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
  trackingNo?: string;
  shippingChannel?: string;
}

export interface IOrderSummary {
  totalCost: number;      // รวมต้นทุนสินค้าทั้งหมด
  grossProfit: number;    // กำไรขั้นต้น
  netProfit: number;      // กำไรสุทธิ
}

export interface IWarehouseFees {
  shippingCost: number;   // ค่าจัดส่งที่คลังเรียกเก็บ
  serviceFee: number;     // ค่าบริการที่คลังเรียกเก็บ
  totalFees: number;      // รวมค่าใช้จ่ายทั้งหมด
}

export interface IOrder {
  orderId: string;
  listProducts: IProduct[];
  shippingInfo: IShippingInfo;
  shippingCost: number;
  subTotal: number;       // ยอดรวมสินค้า
  totalAmount: number;    // ยอดรวมทั้งหมด
  netTotal: number;       // ยอดสุทธิ
  discountAmount: number;
  profitSummary?: IOrderSummary;
  warehouseFees?: IWarehouseFees;
}

// types สำหรับ Report
export interface IDailyOrderSummary {
  totalOrders: number;
  totalNetAmount: number;
  totalCost: number;
  totalNetProfit: number;
  totalWarehouseFees: number;
}

export interface IOrderDetail {
  orderId: string;
  customerName: string;
  netTotal: number;
  createdAt: string;
  profitInfo?: {
    totalCost: number;
    netProfit: number;
  };
  warehouseFees?: {
    totalFees: number;
  };
}

export interface IDailyReport {
  date: string;
  orders: IOrderDetail[];
  summary: IDailyOrderSummary;
}

export interface IOrderReport {
  dailyReports: IDailyReport[];
  summary: IDailyOrderSummary;
  dateRange: {
    start: Date;
    end: Date;
  };
}

// Props types สำหรับ components
export interface OrderDetailDialogProps {
  orderId: string | null;
  onClose: () => void;
}

export interface OrderStatisticsProps {
  totalOrders: number;
  totalNetAmount: number;
  totalCost: number;
  totalNetProfit: number;
  totalWarehouseFees: number;
}
