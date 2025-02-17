
//store/configStore.ts

import { create } from 'zustand'

import actionGetStoreConfig from '@/actions/backend/setting/getStoreConfig'
import type { DisplayConfig, ITickerMessage, LineLoginConfig, LineMessageConfig, SaleModelConfig, ShippingCostConfig, SlipOKConfig, TelegramNotificationConfig } from '@/types/storeConfigTypes';



interface StoreConfig {
  lineLogin: LineLoginConfig;
  telegramNotification: TelegramNotificationConfig;
  lineMessage: LineMessageConfig;
  slipOK: SlipOKConfig;
  saleModel: SaleModelConfig;
  shippingCost: ShippingCostConfig;
  displayConfig: DisplayConfig; // เพิ่มส่วนนี้
  tickers: ITickerMessage[]; // เพิ่ม tickers
}

interface ConfigState {
  config: StoreConfig | null;
  loading: boolean;
  error: string | null;
  fetchConfig: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: null,
  loading: false,
  error: null,
  fetchConfig: async () => {
    if (get().config && !get().loading) return;

    set({ loading: true });

    try {
      const response = await actionGetStoreConfig();


      // แปลงข้อมูลให้ตรงกับ interface
      const config: StoreConfig = {

        lineLogin: response.lineLogin,
        telegramNotification: response.telegramNotification,
        lineMessage: response.lineMessage,
        slipOK: response.slipOK,
        saleModel: response.saleModel,
        shippingCost: response.shippingCost,
        displayConfig: response.displayConfig,
        tickers: response.tickers || [] // เพิ่ม tickers พร้อม default value เป็น array ว่าง
      };

      set({ config, loading: false, error: null });
    } catch (error) {
      console.error('Failed to fetch store config:', error);
      set({ error: 'Failed to fetch store config', loading: false });
    }
  },
}));
