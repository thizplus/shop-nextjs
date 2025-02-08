// app/wholesale/[id]/page.tsx
export const dynamic = 'force-dynamic'; // ป้องกัน cache

import { notFound } from 'next/navigation';

import MainWholesale from '@/components/wholesale/mainWholesale';
import getPriceConfig from '@/actions/client/getPriceConfig';

async function WholesalePage({
  params
}: {
  params: { id: string }
}) {
  try {
    // เพิ่ม validation สำหรับ params.id
    if (!params.id) {
      notFound();
    }

    const priceConfig = await getPriceConfig(params.id);

    if (!priceConfig || !priceConfig.status) {
      console.error('Price config not found or inactive:', params.id);
      notFound();
    }

    // เพิ่มการ validate LIFF_ID
    if (!priceConfig.LIFF_ID) {
      console.warn('LIFF_ID not configured for price:', params.id);
    }

    return (
      <MainWholesale
        priceId={params.id}
        allowedUsers={priceConfig.allowedUsers || []}
        liffId={priceConfig.LIFF_ID}
      />
    );
  } catch (error) {
    console.error('Error loading price config:', error);
    notFound();
  }
}

export default WholesalePage;
