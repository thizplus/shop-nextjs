// @/actions/orders/createOrder.ts

import type { TypeOrder } from "@/types/orderTypes";


// @/actions/orders/actionOrder.ts
const actionCreateOrder = async (orderData: TypeOrder & { warehouseOrderId: string }) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/create`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(errorData.message || 'Failed to create order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export default actionCreateOrder;
