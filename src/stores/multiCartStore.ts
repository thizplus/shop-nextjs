import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useConfigStore } from '@/stores/configStore';
import { useClientStores } from '@/stores/authStore';
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
  getCustomPrice: (sku: string) => number | null;
}

export const useMultiPriceCartStore = create(
  persist<MultiPriceCartState>(
    (set, get) => ({
      items: [],
      baseTotalCart: 0,

      // Helper function to get custom price for a specific SKU
      getCustomPrice: (sku: string): number | null => {
        const { user } = useClientStores.getState();

        if (!user?.customPrices) return null;

        const customPrice = user.customPrices.find(cp => cp.sku === sku);


        return customPrice ? customPrice.price : null;
      },

      // Add item to cart
      addItem: (item) => set((state) => {
        const customPrice = get().getCustomPrice(item.sku);
        const existingItem = state.items.find(i => i.sku === item.sku);

        // Apply custom price if available
        const prices = customPrice ?
          Object.keys(item.prices).reduce((acc, key) => ({
            ...acc,
            [key]: customPrice
          }), {}) :
          item.prices;

        const newItems = existingItem
          ? state.items.map(i =>
            i.sku === item.sku
              ? {
                ...i,
                qty: Math.min(i.qty + item.qty, i.availablestock),
                prices // Update prices
              }
              : i
          )
          : [...state.items, { ...item, prices }];

        return {
          items: newItems,
          baseTotalCart: get().recalculateBaseTotalCart()
        };
      }),

      // Remove item from cart
      removeItem: (sku) => set((state) => ({
        items: state.items.filter((i) => i.sku !== sku),
        baseTotalCart: get().recalculateBaseTotalCart()
      })),

      // Update item quantity
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

      // Clear cart
      clearCart: () => set({ items: [], baseTotalCart: 0 }),

      // Get applicable price level based on total amount
      getApplicablePrice: () => {
        const config = useConfigStore.getState().config;

        if (!config?.saleModel?.listPrice?.length) return '';

        const { listPrice } = config.saleModel;
        const sortedPrices = [...listPrice].sort((a, b) => b.minPurchase - a.minPurchase);
        const baseTotalCart = get().baseTotalCart;

        const applicablePrice = sortedPrices.find(price => baseTotalCart >= price.minPurchase);


        return applicablePrice ? applicablePrice.id : sortedPrices[sortedPrices.length - 1].id;
      },

      // Calculate total amount
      getTotalAmount: () => {
        const { items } = get();
        const applicablePriceId = get().getApplicablePrice();

        return items.reduce((sum, item) => {
          const customPrice = get().getCustomPrice(item.sku);
          const price = customPrice || item.prices[applicablePriceId] || Object.values(item.prices)[0];


          return sum + (price * item.qty);
        }, 0);
      },

      // Get total item count
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.qty, 0);
      },

      // Get quantity of specific item
      getItemQuantity: (sku) => {
        const item = get().items.find(i => i.sku === sku);


        return item ? item.qty : 0;
      },

      // Update item price
      updateItemPrice: (sku, prices) => set((state) => {
        const customPrice = get().getCustomPrice(sku);

        const finalPrices = customPrice ?
          Object.keys(prices).reduce((acc, key) => ({
            ...acc,
            [key]: customPrice
          }), {}) :
          prices;

        const newItems = state.items.map((i) =>
          i.sku === sku ? { ...i, prices: finalPrices } : i
        );

        return {
          items: newItems,
          baseTotalCart: get().recalculateBaseTotalCart()
        };
      }),

      // Update available stock
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

      // Recalculate base total cart
      recalculateBaseTotalCart: () => {
        const config = useConfigStore.getState().config;

        if (!config) return 0;

        const { listPrice } = config.saleModel;
        const sortedPrices = [...listPrice].sort((a, b) => a.minPurchase - b.minPurchase);
        const basePrice = sortedPrices[0].id;

        const newBaseTotalCart = get().items.reduce((sum, item) => {
          const customPrice = get().getCustomPrice(item.sku);
          const price = customPrice || item.prices[basePrice];

          if (typeof price !== 'number') {
            console.error(`Invalid base price for SKU ${item.sku}, priceId ${basePrice}`);

            return sum;
          }

          return sum + (price * item.qty);
        }, 0);

        set({ baseTotalCart: newBaseTotalCart });

        return newBaseTotalCart;
      },

      // Update all prices
      updateAllPrices: (updatedProducts: MultiPriceProduct[]) => set((state) => {
        const newItems = state.items.map((item) => {
          const updatedProduct = updatedProducts.find(p => p.sku === item.sku);
          const customPrice = get().getCustomPrice(item.sku);

          if (updatedProduct) {
            const prices = customPrice ?
              updatedProduct.prices.reduce(
                (acc, _) => ({ ...acc, [_.priceId]: customPrice }),
                {}
              ) :
              updatedProduct.prices.reduce(
                (acc, price) => ({ ...acc, [price.priceId]: price.price }),
                {}
              );

            return {
              ...item,
              prices,
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
        if (state) {
          state.recalculateBaseTotalCart();
        }
      },
    }
  )
);
