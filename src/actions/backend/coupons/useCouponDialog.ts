// hooks/useCouponDialog.ts
import { useState } from 'react';

import type { IClientCoupon } from '@/types/couponTypes';


interface Props {
  totalAmount: number;
  userId: string;
}

export const useCouponDialog = ({ totalAmount, userId }: Props) => {
  const [open, setOpen] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<IClientCoupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<IClientCoupon | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAvailableCoupons = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/coupons/available?amount=${totalAmount}&userId=${userId}`
      );

      const data = await response.json();



      setAvailableCoupons(data.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    fetchAvailableCoupons();
  };

  const handleClose = () => setOpen(false);

  const handleSelectCoupon = (coupon: IClientCoupon) => {
    setSelectedCoupon(coupon);
    handleClose();
  };

  const removeCoupon = () => setSelectedCoupon(null);

  return {
    open,
    loading,
    availableCoupons,
    selectedCoupon,
    handleOpen,
    handleClose,
    handleSelectCoupon,
    removeCoupon
  };
};
