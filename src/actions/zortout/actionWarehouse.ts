import type { TypeOrder } from '@/types/orderTypes';

// @/actions/zortout/actionWarehouse.ts
export const sendOrderToWarehouse = async (orderData: TypeOrder) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/warehouse/send-order`,
        {
          signal: controller.signal,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderData })
        }
      );

      clearTimeout(timeoutId);

      return await response.json();
    } catch (error) {
      if (attempt === 3) throw error;
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
};
