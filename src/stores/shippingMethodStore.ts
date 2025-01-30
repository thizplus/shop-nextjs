// stores/shippingMethodStore.ts
import { create } from 'zustand';

type ShippingMethod = 'standard' | 'grab';

interface ShippingMethodState {
  method: ShippingMethod;
  setMethod: (method: ShippingMethod) => void;
}

export const useShippingMethodStore = create<ShippingMethodState>((set) => ({
  method: 'standard',
  setMethod: (method) => set({ method }),
}));
