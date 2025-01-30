import React from 'react';

import ListShipping from "./listShipping";
import { useShippingStore } from '@/stores/shippingStore';

const ShippingInfo: React.FC = () => {
  const { selectedAddress } = useShippingStore();

  return (
    <>
      <div className="flex text-sm justify-between border-t-[1px] py-2">
        <p>ข้อมูลการจัดส่ง:</p>
        <ListShipping />
      </div>

      {selectedAddress ? (
        <div className="border-y-[1px] py-2 leading-none flex gap-2">
          <i className='tabler-map-pin text-[32px] m-auto' />

          <div className='leading-none my-auto'>
            <p className='text-bold flex gap-2 font-bold text-sm leading-none'> {selectedAddress.cusName} {selectedAddress.cusTel}</p>
            <p className='leading-none text-sm'>{`${selectedAddress.addressNo} ${selectedAddress.district} ${selectedAddress.amphoe} ${selectedAddress.province} ${selectedAddress.zipcode}`}</p>
            {selectedAddress.location &&
              <p className='text-bold flex gap-2 font-bold text-sm leading-none'>ตำแหน่ง : {selectedAddress.location}</p>
            }
          </div>
        </div>
      ) : (
        <p>กรุณาเลือกที่อยู่จัดส่ง</p>
      )}
    </>
  );
};

export default ShippingInfo;
