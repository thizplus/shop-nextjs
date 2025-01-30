
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

        // ถ้ามีการใช้ token สำหรับ authentication ให้เพิ่ม header ตรงนี้
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ orderId })
    });

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(errorData.message || 'Failed to void order');
    }

    const voidOrderData: VoidOrderResponse = await response.json();

    return voidOrderData;
  } catch (error) {
    console.error('Error voiding order:', error);
    throw error;
  }
};

export default actionVoidOrder;
