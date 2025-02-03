import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  sku: string;
  qty: number;
  price: number;
  customPrice?: number; // เพิ่ม customPrice
  name: string;
  imagepath: string | null;
  availablestock: number;
}

interface CartState {
  carts: Record<string, CartItem[]>;
  addItem: (priceId: string, item: CartItem) => void;
  removeItem: (priceId: string, sku: string) => void;
  updateItemQuantity: (priceId: string, sku: string, quantity: number) => void;
  clearCart: (priceId: string) => void;
  getTotalAmount: (priceId: string) => number;
  getItemCount: (priceId: string) => number;
  getItemQuantity: (priceId: string, sku: string) => number;
  updateItemPrice: (priceId: string, sku: string, newPrice: number) => void;
  updateAvailableStock: (priceId: string, sku: string, newAvailableStock: number) => void;
  getCustomPrice: (priceId: string, sku: string) => number | null;
  setCustomPrice: (priceId: string, sku: string, price: number) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carts: {},
      addItem: (priceId, item) => set((state) => {
        const cart = state.carts[priceId] || [];
        const existingItem = cart.find((i) => i.sku === item.sku);

        if (existingItem) {
          return {
            carts: {
              ...state.carts,
              [priceId]: cart.map((i) =>
                i.sku === item.sku
                  ? { ...i, qty: Math.min(i.qty + item.qty, i.availablestock) }
                  : i
              ),
            },
          };
        }


        return {
          carts: {
            ...state.carts,
            [priceId]: [...cart, item],
          },
        };
      }),
      removeItem: (priceId, sku) => set((state) => ({
        carts: {
          ...state.carts,
          [priceId]: (state.carts[priceId] || []).filter((i) => i.sku !== sku),
        },
      })),
      updateItemQuantity: (priceId, sku, quantity) => set((state) => ({
        carts: {
          ...state.carts,
          [priceId]: (state.carts[priceId] || []).map((i) =>
            i.sku === sku
              ? { ...i, qty: Math.min(Math.max(quantity, 0), i.availablestock) }
              : i
          ),
        },
      })),
      clearCart: (priceId) => set((state) => ({
        carts: {
          ...state.carts,
          [priceId]: [],
        },
      })),
      getTotalAmount: (priceId) => {
        const cart = get().carts[priceId] || [];


        return cart.reduce((sum, item) =>
          sum + (item.customPrice || item.price) * item.qty, 0);
      },
      getItemCount: (priceId) => {
        const cart = get().carts[priceId] || [];


        return cart.reduce((sum, item) => sum + item.qty, 0);
      },
      getItemQuantity: (priceId, sku) => {
        const cart = get().carts[priceId] || [];
        const item = cart.find(i => i.sku === sku);


        return item ? item.qty : 0;
      },

      getCustomPrice: (priceId, sku) => {
        const cart = get().carts[priceId] || [];
        const item = cart.find(i => i.sku === sku);


        return item?.customPrice || null;
      },

      setCustomPrice: (priceId, sku, price) => set((state) => ({
        carts: {
          ...state.carts,
          [priceId]: (state.carts[priceId] || []).map((i) =>
            i.sku === sku ? { ...i, customPrice: price } : i
          ),
        },
      })),

      updateItemPrice: (priceId, sku, newPrice) => set((state) => ({
        carts: {
          ...state.carts,
          [priceId]: (state.carts[priceId] || []).map((i) =>
            i.sku === sku ? { ...i, price: newPrice } : i
          ),
        },
      })),

      updateAvailableStock: (priceId, sku, newAvailableStock) => set((state) => {
        const cart = state.carts[priceId] || [];

        const updatedCart = cart.map((item) => {
          if (item.sku === sku) {
            const newQty = Math.min(item.qty, newAvailableStock);


            return { ...item, availablestock: newAvailableStock, qty: newQty };
          }


          return item;
        });


        return {
          carts: {
            ...state.carts,
            [priceId]: updatedCart,
          },
        };
      }),
    }),

    {
      name: 'cart-storage',
    }
  )
)
