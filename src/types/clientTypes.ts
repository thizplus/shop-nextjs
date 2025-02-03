import type { ObjectId } from "mongodb";

import type { ShippingAddress } from "./shippingTypes";
import type { ICustomPrice } from "./productTypes";

interface AccessiblePrice {
  id: string;
  name: string;
}

export interface TypeClient {
  _id: ObjectId;
  userId: string;
  displayName: string;
  pictureUrl: string;
  userType: string;
  idType: string;
  shippingAddresses?: ShippingAddress[];
  accessiblePrices?: AccessiblePrice[]; // เพิ่ม field นี้
  enableGrabDelivery?: boolean; // เพิ่ม field นี้
  createdAt?: Date;
  updatedAt?: Date;
  pin?: string; // เพิ่มสำหรับเก็บ PIN
  isPinVerified?: boolean; // เพิ่มสำหรับเช็คว่าเคยใส่ PIN แล้วหรือยัง
  customPrices?: ICustomPrice[];
}


export interface TypeClientVerify {
  userId: string;
  displayName: string;
  pictureUrl: string;
  userType: string;
  idType: string;
  shippingAddresses?: ShippingAddress[]
}
