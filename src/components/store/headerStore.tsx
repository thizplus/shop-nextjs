// HeaderStore.tsx
import React from 'react';

import { useClientStores } from '@/stores/authStore';
import MultiPriceTotalCart from './MultiPriceTotalCart';
import { useConfigStore } from '@/stores/configStore';



const HeaderStore = () => {

  const { config } = useConfigStore();
  const { isLoggedIn } = useClientStores();



  return (
    <>
      <div className="p-4 fixed w-full bg-white shadow-md z-10 max-w-[430px]">
        <div className='flex gap-2 justify-between'>
          <div className="flex gap-2 leading-none">
            <img src={`${config?.displayConfig.logo}`} className='max-h-[44px]' />
            <div className='my-auto'>
              <p className='font-bold text-xl leading-none'>{`${config?.displayConfig.shopName}`}</p>
              <p className=' text-xs leading-none'>{`${config?.displayConfig.shopSlogan}`}</p>
            </div>
          </div>

          {isLoggedIn &&
            <MultiPriceTotalCart />
          }
        </div>
      </div>
      <div className="h-[80px]"></div>
    </>
  );
};

export default HeaderStore;
