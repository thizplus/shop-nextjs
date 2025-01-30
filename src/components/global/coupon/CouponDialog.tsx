// components/cart/CouponDialog.tsx
import { Button, Dialog, DialogTitle, DialogContent } from '@mui/material';


import type { IClientCoupon } from '@/types/couponTypes';
import formatThaiDate from '../functions/formatThaiDate';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (coupon: IClientCoupon) => void;
  coupons: IClientCoupon[];
  loading: boolean;
}

const CouponDialog: React.FC<Props> = ({
  open,
  onClose,
  onSelect,
  coupons,
  loading
}) => {
  const renderCouponValue = (coupon: IClientCoupon) => {
    if (coupon.type === 'shipping') {
      return `ส่วนลดค่าจัดส่ง ${coupon.isPercent ? `${coupon.value}%` : `${coupon.value}฿`}`;
    }


    return `ส่วนลด ${coupon.isPercent ? `${coupon.value}%` : `${coupon.value}฿`}`;
  };

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
      closeAfterTransition={false}
    >
      <DialogTitle>คูปองส่วนลด</DialogTitle>
      <DialogContent>
        {loading ? (
          <></>
        ) : (
          <div className="space-y-2">
            {coupons.map((coupon) => (
              <div
                key={coupon._id}
                className="flex justify-between items-center p-2 border rounded-lg hover:bg-gray-50"
              >
                <div className=' leading-none'>
                  <div className="font-medium">{renderCouponValue(coupon)}</div>
                  <p className="text-xs text-gray-600 leading-none">
                    {coupon.minPurchase && `ขั้นต่ำ ${coupon.minPurchase}฿`}
                  </p>
                  <p className="text-xs text-gray-600 leading-none">

                    {`หมดอายุ ${formatThaiDate(coupon.endDate)}`}
                  </p>
                </div>
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  onClick={() => onSelect(coupon)}
                >
                  ใช้คูปอง
                </Button>
              </div>
            ))}
            {coupons.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                ไม่มีคูปองที่สามารถใช้ได้
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CouponDialog;
