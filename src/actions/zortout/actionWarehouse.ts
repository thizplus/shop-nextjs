import type { TypeOrder } from '@/types/orderTypes';

// @/actions/zortout/actionWarehouse.ts
export const sendOrderToWarehouse = async (orderData: TypeOrder) => {

  console.log('send order to warehouse', orderData)

  try {
    // เพิ่ม timeout
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/warehouse/send-order`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderData })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(errorData.message || 'Failed to send order to warehouse');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending order to warehouse:', error);
    throw error;
  }
};
