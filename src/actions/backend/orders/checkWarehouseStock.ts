// @/actions/zortout/checkWarehouseStock.ts

interface StockProduct {
  sku: string;
  availablestock: string;
  name: string;
}

interface StockResponse {
  res: {
    resCode: string;
    resDesc: string;
  };
  list: StockProduct[];
}

interface StockCheckResult {
  success: boolean;
  insufficientItems?: Array<{
    sku: string;
    requested: number;
    available: number;
    name: string;
  }>;
  error?: string;
}

export const checkWarehouseStock = async (
  cartItems: Array<{ sku: string; qty: number }>
): Promise<StockCheckResult> => {
  try {
    const skuList = cartItems.map(item => item.sku).join(',');

    // const myHeaders = new Headers();

    // ใช้ STORE URL และ credentials แทน
    const response = await fetch(`${process.env.NEXT_PUBLIC_STORE_URL}/api/products/check-stock`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "skulist": skuList
      },
      redirect: "follow"
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stock information from store');
    }

    const data = await response.json() as StockResponse;

    if (data.res.resCode !== "200") {
      throw new Error(data.res.resDesc || 'Error checking stock availability');
    }

    // ส่วนที่เหลือคงเดิม เพราะ format ข้อมูลเหมือนกัน
    const storeProducts = new Map(
      data.list.map(product => [product.sku, product])
    );

    const insufficientItems: StockCheckResult['insufficientItems'] = [];

    cartItems.forEach(cartItem => {
      const storeProduct = storeProducts.get(cartItem.sku);

      if (!storeProduct) {
        insufficientItems.push({
          sku: cartItem.sku,
          requested: cartItem.qty,
          available: 0,
          name: 'Product not found'
        });

        return;
      }

      const availableStock = parseInt(storeProduct.availablestock);

      if (cartItem.qty > availableStock) {
        insufficientItems.push({
          sku: cartItem.sku,
          requested: cartItem.qty,
          available: availableStock,
          name: storeProduct.name
        });
      }
    });

    return {
      success: insufficientItems.length === 0,
      insufficientItems: insufficientItems.length > 0 ? insufficientItems : undefined
    };

  } catch (error) {
    console.error('Error checking store stock:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check stock availability'
    };
  }
};
