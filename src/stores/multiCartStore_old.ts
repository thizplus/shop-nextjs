import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useConfigStore } from '@/stores/configStore';
import type { MultiPriceProduct } from '@/types/multiplePrice';

export interface CartItem {
  sku: string;
  qty: number;
  prices: Record<string, number>;
  name: string;
  imagepath: string | null;
  availablestock: number;
}

interface MultiPriceCartState {
  items: CartItem[];
  baseTotalCart: number;
  addItem: (item: CartItem) => void;
  removeItem: (sku: string) => void;
  updateItemQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  getApplicablePrice: () => string;
  getTotalAmount: () => number;
  getItemCount: () => number;
  getItemQuantity: (sku: string) => number;
  updateItemPrice: (sku: string, prices: Record<string, number>) => void;
  updateAvailableStock: (sku: string, newAvailableStock: number) => void;
  recalculateBaseTotalCart: () => number;
  updateAllPrices: (updatedProducts: MultiPriceProduct[]) => void;
}

export const useMultiPriceCartStore = create(
  persist<MultiPriceCartState>(
    (set, get) => ({
      items: [],
      baseTotalCart: 0,
      addItem: (item) => set((state) => {
        const existingItem = state.items.find(i => i.sku === item.sku);

        const newItems = existingItem
          ? state.items.map(i =>
            i.sku === item.sku
              ? { ...i, qty: Math.min(i.qty + item.qty, i.availablestock) }
              : i
          )
          : [...state.items, item];

        const newState = {
          items: newItems,
          baseTotalCart: get().recalculateBaseTotalCart()
        };


        return newState;
      }),
      removeItem: (sku) => set((state) => {
        const newItems = state.items.filter((i) => i.sku !== sku);


        return {
          items: newItems,
          baseTotalCart: get().recalculateBaseTotalCart()
        };
      }),
      updateItemQuantity: (sku, quantity) => set((state) => {
        const newItems = state.items.map((i) =>
          i.sku === sku
            ? { ...i, qty: Math.min(Math.max(quantity, 0), i.availablestock) }
            : i
        );


        return {
          items: newItems,
          baseTotalCart: get().recalculateBaseTotalCart()
        };
      }),
      clearCart: () => set({ items: [], baseTotalCart: 0 }),
      getApplicablePrice: () => {
        const config = useConfigStore.getState().config;

        if (!config?.saleModel?.listPrice?.length) {
          return ''; // ถ้าไม่มีข้อมูล return ค่าว่าง
        }



        const { listPrice } = config.saleModel;
        const sortedPrices = [...listPrice].sort((a, b) => b.minPurchase - a.minPurchase);
        const baseTotalCart = get().baseTotalCart;

        const applicablePrice = sortedPrices.find(price => baseTotalCart >= price.minPurchase);
        const result = applicablePrice ? applicablePrice.id : sortedPrices[sortedPrices.length - 1].id;

        // console.log('getApplicablePrice - Base Total:', baseTotalCart, 'Applicable Price:', result);

        return result;
      },

      getTotalAmount: () => {
        const { items } = get();
        const applicablePriceId = get().getApplicablePrice();

        const totalAmount = items.reduce((sum, item) => {
          const price = item.prices[applicablePriceId] || Object.values(item.prices)[0];


          return sum + (price * item.qty);
        }, 0);

        // console.log('getTotalAmount - Calculated Total:', totalAmount);

        return totalAmount;
      },


      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.qty, 0);
      },
      getItemQuantity: (sku) => {
        const item = get().items.find(i => i.sku === sku);


        return item ? item.qty : 0;
      },
      updateItemPrice: (sku, prices) => set((state) => {
        const newItems = state.items.map((i) =>
          i.sku === sku ? { ...i, prices: { ...i.prices, ...prices } } : i
        );


        return {
          items: newItems,
          baseTotalCart: get().recalculateBaseTotalCart()
        };
      }),
      updateAvailableStock: (sku, newAvailableStock) => set((state) => {
        const newItems = state.items.map((item) => {
          if (item.sku === sku) {
            const newQty = Math.min(item.qty, newAvailableStock);


            return { ...item, availablestock: newAvailableStock, qty: newQty };
          }


          return item;
        });


        return {
          items: newItems,
          baseTotalCart: get().recalculateBaseTotalCart()
        };
      }),
      recalculateBaseTotalCart: () => {
        const config = useConfigStore.getState().config;

        if (!config) return 0;

        const { listPrice } = config.saleModel;
        const sortedPrices = [...listPrice].sort((a, b) => a.minPurchase - b.minPurchase);
        const basePrice = sortedPrices[0].id;

        const newBaseTotalCart = get().items.reduce((sum, item) => {
          const price = item.prices[basePrice];

          if (typeof price !== 'number') {
            console.error(`Invalid base price for SKU ${item.sku}, priceId ${basePrice}`);

            return sum;
          }


          return sum + (price * item.qty);
        }, 0);

        // console.log('recalculateBaseTotalCart - New Base Total:', newBaseTotalCart);
        set({ baseTotalCart: newBaseTotalCart });

        return newBaseTotalCart;
      },

      updateAllPrices: (updatedProducts: MultiPriceProduct[]) => set((state) => {
        const newItems = state.items.map((item) => {
          const updatedProduct = updatedProducts.find(p => p.sku === item.sku);

          if (updatedProduct) {
            return {
              ...item,
              prices: updatedProduct.prices.reduce(
                (acc, price) => ({ ...acc, [price.priceId]: price.price }),
                {}
              ),
              availablestock: updatedProduct.availablestock
            };
          }


          return item;
        });

        return {
          items: newItems,
          baseTotalCart: get().recalculateBaseTotalCart()
        };
      }),


    }),
    {
      name: 'multi-price-cart-storage',
      onRehydrateStorage: () => (state) => {
        // ตรวจสอบและอัพเดทราคาทุกครั้งที่โหลดข้อมูลจาก storage
        if (state) {
          state.recalculateBaseTotalCart();
        }
      },
    }
  )
);
