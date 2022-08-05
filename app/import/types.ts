import type { Decimal128, ObjectId } from "mongodb";

export interface Account {
  _id?: ObjectId;
  name: string;
  type: AccountType;
  unit: AccountUnit;
  valueTypeId?: ObjectId;
  valueSubtypeId?: ObjectId;
  categoryId: ObjectId;
  categoryType: AccountCategoryType;
  groupId?: ObjectId;
  openingBalance?: Decimal128 | null;
  openingDate?: Date | null;
  closingDate?: Date | null;
  isActive: boolean;
  currentBalance: {
    valueInAccountUnit: Decimal128;
    valueInReferenceCurrency: Decimal128;
  };
}

export type AccountUnit = CurrencyAccountUnit | StockAccountUnit;

export interface CurrencyAccountUnit {
  kind: AccountUnitKind.CURRENCY;
  currency: string;
}

export interface StockAccountUnit {
  kind: AccountUnitKind.STOCK;
  stockId: ObjectId;
}

export enum AccountType {
  TRACKED = "TRACKED",
  VALUATED = "VALUATED",
}

export enum AccountUnitKind {
  CURRENCY = "CURRENCY",
  STOCK = "STOCK",
}

export enum AccountCategoryType {
  ASSET = "ASSET",
  LIABILITY = "LIABILITY",
}

export interface AccountCategory {
  _id?: ObjectId;
  name: string;
  type: AccountCategoryType;
  order: number;
  currentBalance: Decimal128;
}
