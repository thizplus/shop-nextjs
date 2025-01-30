import type { TypeOrder } from '@/types/orderTypes';

export const sendOrderToWarehouse = async (orderData: TypeOrder) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/warehouse/send-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderData }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log('Zortout Order sent successfully');

    return data;
  } catch (error) {
    console.error('Error sending Zortout Order:', error);
    throw error;
  }
};
