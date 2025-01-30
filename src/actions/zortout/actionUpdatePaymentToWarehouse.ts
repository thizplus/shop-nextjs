
interface propsUpdatePayment {
  orderId: string;
  paymentamount: number;
  paymentmethod: string;
}

const actionUpdatePaymentToWarehouse = async ({ orderId, paymentamount, paymentmethod }: propsUpdatePayment) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/warehouse/update-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'

        // ถ้ามีการใช้ token สำหรับ authentication ให้เพิ่ม header ตรงนี้
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ orderId, paymentamount, paymentmethod })
    });

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(errorData.message || 'Failed to void order');
    }

    const result = await response.json();

    return result;
  } catch (error) {
    console.error('Error voiding order:', error);
    throw error;
  }
};

export default actionUpdatePaymentToWarehouse;
