// actions/backend/setting/getPriceConfig.ts

// เพิ่ม force-dynamic config
export const dynamic = 'force-dynamic'

import type { PriceConfig } from "@/types/priceTypes";

const getPriceConfig = async (priceId: string): Promise<PriceConfig | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/price-list/${priceId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },

        // ไม่จำเป็นต้องใส่ cache control headers เมื่อใช้ force-dynamic
        cache: 'no-store' // optional เมื่อใช้ force-dynamic
      }
    );

    if (!response.ok) {
      throw new Error('Get price config failed');
    }

    return response.json();
  } catch (error) {
    console.error('Error during get price config:', error);

    return null;
  }
};

export default getPriceConfig;
