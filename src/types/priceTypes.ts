import type { ObjectId } from "mongodb";


export type TypePrice = {
  _id: ObjectId;
  priceId: string;
  priceName: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface PriceConfig {
  priceId: string;
  priceName: string;
  status: boolean;
  LIFF_ID?: string;
  allowedUsers: string[];
}
