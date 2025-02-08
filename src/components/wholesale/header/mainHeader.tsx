import { useMemo } from 'react';

import { useClientStores } from '@/stores/authStore';
import TotalCart from './totalCart';
import { useConfigStore } from '@/stores/configStore';

type PropsPriceInfo = {
  priceId: string;
  priceName: string;
};

const MainHeader = ({ priceId, priceName }: PropsPriceInfo) => {
  const { isLoggedIn } = useClientStores();
  const { config } = useConfigStore();

  // ใช้ useMemo เพื่อป้องกันการ re-render ที่ไม่จำเป็น
  const headerContent = useMemo(() => {
    // ถ้ายังไม่มี config หรือ displayConfig ให้แสดง loading state หรือค่าเริ่มต้น
    if (!config?.displayConfig) {
      return {
        logo: '',
        shopName: 'กำลังโหลดข้อมูล...',
        shopSlogan: ''
      };
    }

    return {
      logo: config.displayConfig.logo || '',
      shopName: config.displayConfig.shopName || '',
      shopSlogan: config.displayConfig.shopSlogan || ''
    };
  }, [config?.displayConfig]);

  // เพิ่มการตรวจสอบ priceId
  if (!priceId || priceId === 'undefined') {
    return null;
  }

  return (
    <>
      <div className="p-4 fixed w-full bg-white shadow-md z-10 max-w-[430px]">
        <div className="flex gap-2 justify-between">
          <div className="flex gap-2 leading-none">
            <div className="flex gap-2 leading-none">
              {headerContent.logo && (
                <img
                  src={headerContent.logo}
                  className="max-h-[44px]"
                  alt="Shop logo"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;

                    img.style.display = 'none';
                  }}
                />
              )}
              <div className="my-auto">
                <p className="font-bold text-xl leading-none">
                  {headerContent.shopName}
                </p>
                <p className="text-xs leading-none">
                  {headerContent.shopSlogan}
                </p>
                {priceName && (
                  <p className="text-xs leading-none">
                    {priceName} : {priceId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {isLoggedIn && <TotalCart priceId={priceId} />}
        </div>
      </div>
      <div className="h-[80px]"></div>
    </>
  );
};

export default MainHeader;
