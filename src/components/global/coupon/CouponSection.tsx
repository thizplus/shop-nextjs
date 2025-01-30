// components/cart/CouponSection.tsx
import { useEffect } from 'react';

import { Button } from '@mui/material';

import CouponDialog from './CouponDialog';
import { useCouponDialog } from '@/actions/backend/coupons/useCouponDialog';
import { useClientStores } from '@/stores/authStore';
import type { IClientCoupon } from '@/types/couponTypes';

interface Props {
  totalAmount: number;
  onApplyCoupon: (discount: number, coupon: IClientCoupon | null) => void;
}

const CouponSection: React.FC<Props> = ({ totalAmount, onApplyCoupon }) => {
  const { user } = useClientStores();

  const {
    open,
    loading,
    availableCoupons,
    selectedCoupon,
    handleOpen,
    handleClose,
    handleSelectCoupon,
    removeCoupon
  } = useCouponDialog({
    totalAmount,
    userId: user?.userId || ''
  });

  useEffect(() => {
    if (selectedCoupon) {
      const discount = selectedCoupon.isPercent
        ? (totalAmount * selectedCoupon.value) / 100
        : selectedCoupon.value;

      const finalDiscount = Math.min(discount, selectedCoupon.maxDiscount || discount);

      onApplyCoupon(finalDiscount, selectedCoupon);
    } else {
      onApplyCoupon(0, null);
    }
  }, [selectedCoupon, totalAmount, onApplyCoupon]);

  return (
    <>
      <div className="text-sm py-2 flex justify-between items-center  border-b-[1px]">
        <span>คูปองส่วนลด</span>
        {selectedCoupon ? (
          <div className="flex items-center gap-2 text-right">
            <Button size="small" className='p-0 justify-end' onClick={removeCoupon}>
              <i className="tabler-x text-error" />
            </Button>
            <span>{selectedCoupon.code}</span>

          </div>
        ) : (

          <p className="underline text-sm cursor-pointer flex" onClick={handleOpen}>
            <i className='tabler-tag text-lg mr-1' /> ใช้คูปองส่วนลด
          </p>

        )}
      </div>

      <CouponDialog
        open={open}
        onClose={handleClose}
        onSelect={handleSelectCoupon}
        coupons={availableCoupons}
        loading={loading}
      />
    </>
  );
};

export default CouponSection;
