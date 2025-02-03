// types/productTypes.ts
import type { ObjectId } from "mongodb";


export interface IListPrice {
  _id?: string; // optional เพราะอาจจะเป็นข้อมูลใหม่
  priceId: string;
  priceName: string;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface ICategory {
  catId: string;
  name: string;
}

export interface TypesProduct {
  _id: ObjectId;
  id: number;
  __v: number;
  name: string;
  sku: string;
  stock: number;
  availablestock: number;
  imagepath: string | null;
  categories: ICategory[];
  active: boolean;
  listPrice?: IListPrice[];
  createdAt: Date;
  updatedAt: Date;
  warehousePrice?: {
    sku: string;
    price: number;
  };
}

// interfaces สำหรับ API requests
export interface CreateProductData {
  name: string;
  sku: string;
  categories: ICategory[];  // เปลี่ยนเป็น array ของ ICategory
  imagepath: string | null;
}

// Type สำหรับ API Response
export interface ProductResponse {
  items: TypesProduct[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

// ถ้าต้องการเก็บ Type สำหรับการอัพเดทราคา
export interface UpdatePricePayload {
  sku: string;
  priceId: string;
  price: number;
}



export type TypesProductInner = {

  sku: string;
  name: string;
  price: number;
  stock: number;
  availablestock: number;
}



export type TypesProductWholesale = {
  _id: ObjectId;
  __v: number;
  name: string;
  sku: string;
  stock: number;
  availablestock: number;
  imagepath: string | null;
  categoryid: number | null;
  category: string | null;
  price: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface ISearchProduct {
  _id: string;
  sku: string;
  name: string;
  availablestock: number;
  category?: string;
  imagepath?: string | null;
  listPrice?: Array<{
    priceId: string;
    priceName: string;
    price: number;
  }>;
}

export interface ICustomPrice {
  sku: string;
  price: number;
  name?: string;
  _id?: ObjectId;
}

