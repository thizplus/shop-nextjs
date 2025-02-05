
interface VoidOrderParams {
  orderId: string;
}

interface VoidOrderResponse {
  message: string;
  zortoutResponse: {
    resCode: string;
    resDesc: string;
  };
}

const actionVoidOrder = async ({ orderId }: VoidOrderParams): Promise<VoidOrderResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/warehouse/void-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to void order');
    }

    return data;
  } catch (error) {
    console.error('Error voiding order:', error);
    throw error;
  }
};

export default actionVoidOrder;
