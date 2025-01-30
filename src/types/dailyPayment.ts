// types/dailyPayment.ts
export interface IProduct {
  sku: string;
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface IOrderSummary {
  orderId: string;
  amount: number;
  products: IProduct[];
  shippingCost: number;
  serviceFee: number;
}

export interface IPaymentSlip {
  url: string;
  amount: number;
  uploadedAt: string;
}

export interface IDailyPayment {
  _id: string;
  docId: string;
  shopName: string;
  date: string;
  expire: string;  // เพิ่ม expire เพราะมีในข้อมูลจริง
  totalAmount: number;
  orders: IOrderSummary[];
  payment: {
    status: 'pending' | 'success' | 'cancelled';  // ปรับตาม model จริง
    amount: number;
    slip: IPaymentSlip[];
  };
  slipOK: {
    API_URL: string;
    API_KEY: string;
    qr_image?: string;
  };
  createdAt: string;
  updatedAt: string;
}
