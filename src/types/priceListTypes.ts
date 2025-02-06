// types/priceListTypes.ts
import type { ObjectId } from "mongodb";

export type TypePriceList = {
  _id: ObjectId;
  priceId: string;
  priceName: string;
  status: boolean;
  LIFF_ID?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedPriceListResponse {
  items: TypePriceList[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
