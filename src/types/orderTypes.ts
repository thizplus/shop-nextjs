// types/orderTypes.ts
import type { ObjectId } from "mongodb";

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
  cusName: string;
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

export interface PaymentSlip {
  _id?: ObjectId;
  url: string;
  amount: number;
  uploadedAt: Date;
}

export interface Payment {
  status: 'pending' | 'success' | 'cancelled';
  amount: number;
  slip: PaymentSlip[];
}

export interface GrabPayment {
  status: 'pending' | 'processing' | 'success';
  amount: number;
  note?: string;
  updatedAt?: string | Date;
  paymentAt?: string | Date;
}

export interface Coupon {
  code: string;
  type: 'cart' | 'shipping';
  value: number;
  isPercent: boolean;
  discountAmount: number;
}

export type TypeOrder = {
  _id: ObjectId;
  orderId: string;
  shopName?: string;
  typeOrder: string;
  typeId: string;
  userId: string;
  listProducts: OrderProduct[];
  shippingInfo: ShippingInfo;
  shippingMethod: 'standard' | 'grab';
  grabPayment?: GrabPayment;
  shippingCost: number;
  subTotal: number;
  totalAmount: number;
  netTotal: number;
  expire: string | Date;
  coupon?: Coupon;
  discountAmount: number;
  payment: Payment;
  createdAt: string | Date;
  updatedAt: string | Date;
  __v: number;
}

export interface OrderResponse {
  items: TypeOrder[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}


