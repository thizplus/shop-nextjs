// types/pointTypes.ts
import type { ObjectId } from "mongodb";

export enum TicketType {
  CART = 'cart',
  SHIPPING = 'shipping'
}

export interface IPointTicket {
  _id: ObjectId;
  name: string;              // ชื่อตั๋ว
  description: string;       // รายละเอียด
  type: TicketType;         // ประเภทส่วนลด
  pointCost: number;        // จำนวนพอยต์ที่ใช้แลก
  discountValue: number;    // มูลค่าส่วนลด
  isPercent: boolean;       // true = ลดเป็นเปอร์เซ็นต์, false = ลดเป็นจำนวนเงิน
  maxDiscount?: number;     // จำนวนเงินส่วนลดสูงสุด (กรณีลดเป็นเปอร์เซ็นต์)
  minPurchase?: number;     // ยอดซื้อขั้นต่ำที่สามารถใช้ได้
  isActive: boolean;        // สถานะการใช้งาน
  expiresInDays: number;    // จำนวนวันที่ตั๋วใช้ได้หลังจากแลก
  createdAt: Date;
  updatedAt: Date;
}

export interface PointTicketResponse {
  items: IPointTicket[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface PointSetting {
  isActive: boolean;
  pointsPerBaht: number;
}

export interface ICustomerPoint {
  _id: ObjectId;
  customerId: ObjectId;
  points: number;           // แต้มคงเหลือ
  totalEarnedPoints: number; // แต้มที่เคยได้รับทั้งหมด
  totalUsedPoints: number;   // แต้มที่ใช้ไปแล้วทั้งหมด
  createdAt: Date;
  updatedAt: Date;
}

export enum PointTransactionType {
  EARNED = 'earned',     // ได้รับแต้ม
  USED = 'used'         // ใช้แต้ม
}

export interface IPointTransaction {
  _id: ObjectId;
  customerId: ObjectId;
  type: PointTransactionType;
  points: number;
  orderId?: ObjectId;        // อ้างอิงออเดอร์ (ถ้ามี)
  ticketId?: ObjectId;       // อ้างอิงตั๋วที่แลก (ถ้ามี)
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
