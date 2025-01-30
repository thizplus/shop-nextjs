// types/categoryTypes.ts
import type { ObjectId } from "mongodb";

export type TypesCategory = {
  _id: ObjectId;
  catId: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
