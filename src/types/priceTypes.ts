import type { ObjectId } from "mongodb";


export type TypePrice = {
  _id: ObjectId;
  priceId: string;
  priceName: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}


