import type { ObjectId } from "mongodb";

export interface MultiPrice {
  priceId: string;
  priceName: string;
  price: number;
  status: boolean;
}

export interface MultiPriceProduct {
  _id: ObjectId;
  name: string;
  sku: string;
  stock: number;
  availablestock: number;
  imagepath: string | null;
  prices: MultiPrice[];
  active: boolean;
}

export type MultiPriceProductInner = {
  id: string;
  sku: string;
  name: string;
  prices: MultiPrice[];
  stock: number;
  availablestock: number;
}
