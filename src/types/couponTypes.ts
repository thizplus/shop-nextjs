// types/couponTypes.ts
import type { ObjectId } from "mongodb";

export enum DiscountType {
  CART = 'cart',
  SHIPPING = 'shipping'
}

export interface ICoupon {
  _id: ObjectId;
  code: string;
  type: DiscountType;
  value: number;
  isPercent: boolean;
  maxDiscount?: number;
  minPurchase?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageLimit: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClientCoupon {
  _id: string; // เป็น string เพราะมาจาก API
  code: string;
  type: DiscountType;
  value: number;
  isPercent: boolean;
  maxDiscount?: number;
  minPurchase?: number;
  startDate: string; // เป็น string เพราะมาจาก API
  endDate: string;
  isActive: boolean;
  usageLimit: number;
  usageCount: number;
}

export interface CouponResponse {
  items: ICoupon[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
