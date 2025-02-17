// Type for the Line Login configuration
export interface LineLoginConfig {
  LINE_LIFF_ID: string;
}

export interface TelegramNotificationConfig {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  TELEGRAM_ENABLED: boolean;
}

export interface LineMessageConfig {
  CHANNEL_ACCESS_TOKEN: string;
  CHANNEL_SECRET: string;
  MESSAGE_ENABLED: boolean;
}

export interface SlipOKConfig {
  API_URL: string;
  API_KEY: string;
  ENABLED: boolean;
  qr_image?: string;
}

// Type for each item in the listPrice array
export interface ListPrice {
  id: string;
  name: string;
  minPurchase: number;
  LIFF_ID: string;
}

// Type for the Sale Model configuration
export interface SaleModelConfig {
  minOrderStatus: boolean;
  minOrderValue: number;
  type: 'single' | 'multiple';
  listPrice: ListPrice[];
}

// Type for the Standard Shipping Cost configuration
export interface StandardShippingCost {
  value: number;
  cost: number;
}

// Type for the Special Shipping Cost configuration
export interface SpecialShippingCost {
  value: number;
}

// Type for the Shipping Cost configuration
export interface ShippingCostConfig {
  standard: StandardShippingCost;
  special: SpecialShippingCost;
}

// สำหรับ slider
export interface SliderImage {
  id: string;
  url: string;
}

// เพิ่ม interface สำหรับอักษรวิ่ง
export interface ITickerMessage {
  id: string;
  message: string;
  color?: string;
  isActive: boolean;
  priceId?: string; // null หรือไม่มีคือเป็นของร้านหลัก
}

// สำหรับการแสดงผล
export interface DisplayConfig {
  logo?: string;
  sliders: SliderImage[];
  primaryColor: string;
  isProtected: boolean; // เพิ่มส่วนนี้
  shopName?: string;
  shopSlogan?: string;

}

// Main Config Type
export interface StoreConfig {
  lineLogin: LineLoginConfig;
  telegramNotification: TelegramNotificationConfig;
  lineMessage: LineMessageConfig;
  slipOK: SlipOKConfig;
  saleModel: SaleModelConfig;
  shippingCost: ShippingCostConfig;
  displayConfig: DisplayConfig; // เพิ่มส่วนนี้
  tickers: ITickerMessage[]; // เพิ่มส่วนนี้
}
