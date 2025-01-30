import React, { useState, useEffect, useCallback } from 'react';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';

import type { TypeOrder } from '@/types/orderTypes';
import { formatNumber } from '@/components/global/functions/numberFormat';
import UploadSlip from './uploadSlip';
import BtnVoidOrder from './voidOrder';
import { useCouponApply } from '@/actions/backend/coupons/useCouponApply';

interface PaymentProps {
  paymentData: TypeOrder;
  qr: string | undefined;
  onClose: () => void;
  onOpen: boolean;
  onUpdatePayment: (updatedPayment: TypeOrder['payment']) => void;
}

const Payment: React.FC<PaymentProps> = ({ paymentData, onClose, onOpen, onUpdatePayment, qr }) => {
  const [isFullyPaid, setIsFullyPaid] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(paymentData.payment);
  const [isExpired, setIsExpired] = useState(false);
  const { applyCoupon } = useCouponApply();

  useEffect(() => {
    const handleFullyPaid = async () => {
      if (currentPayment.amount >= paymentData.netTotal && paymentData.coupon) {
        try {
          await applyCoupon({
            couponId: paymentData.coupon.code,
            orderId: paymentData.orderId,
            userId: paymentData.userId,
            amount: paymentData.coupon.discountAmount
          });
        } catch (error) {
          console.error('Error applying coupon:', error);
        }
      }

      setIsFullyPaid(true);
    };

    if (currentPayment.amount >= paymentData.netTotal) {
      handleFullyPaid();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPayment, paymentData]);

  useEffect(() => {
    const expireTime = new Date(paymentData.expire).getTime();

    if (Date.now() >= expireTime) {
      setIsExpired(true);
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentData.expire]);

  const handlePaymentUpdate = useCallback((newPayment: TypeOrder['payment']) => {
    setCurrentPayment(newPayment);
    onUpdatePayment(newPayment);
  }, [onUpdatePayment]);

  const remainingAmount = Math.max(0, paymentData.netTotal - currentPayment.amount);

  const handleVoidSuccess = () => {
    onClose();
  };

  return (
    <Dialog
      open={onOpen}
      disableEscapeKeyDown
      maxWidth="xs"
      fullWidth
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          onClose();
        }
      }}
    >
      <DialogTitle>ชำระเงิน</DialogTitle>
      <DialogContent>
        <div className='block'>
          <div className='grid grid-cols-2 text-sm'>
            <p>คำสั่งซื้อ:</p>
            <p className='text-right font-bold'>{paymentData.orderId}</p>
            <p>สถานะ:</p>
            <p className='text-right font-bold'>
              {isFullyPaid ? 'ชำระเงินครบแล้ว' : 'รอการชำระเงิน'}
            </p>
          </div>

          <div className='grid grid-cols-3 gap-1 pt-2 pb-1 border-dashed border rounded-sm mt-1'>
            <div className='block text-center leading-none'>
              <p className='font-bold text-md'>{formatNumber(paymentData.netTotal)}฿</p>
              <p className='text-xs'>ยอดรวม</p>
            </div>
            <div className='block text-center leading-none text-green-600'>
              <p className='font-bold text-md'>{formatNumber(currentPayment.amount)}฿</p>
              <p className='text-xs'>ชำระแล้ว</p>
            </div>
            <div className='block text-center leading-none text-red-600'>
              <p className='font-bold text-md'>{formatNumber(remainingAmount)}฿</p>
              <p className='text-xs'>ค้างชำระ</p>
            </div>
          </div>
        </div>

        {!isFullyPaid && !isExpired && (
          <UploadSlip
            order={paymentData}
            onPaymentUpdate={handlePaymentUpdate}
            currentPayment={currentPayment}
            onExpire={() => {
              setIsExpired(true);
              onClose();
            }}
          />
        )}

        {qr && !isExpired && (
          <div className='mb-2'>
            <img src={qr} alt='QR Payment' className='w-full' />
          </div>
        )}

        {isFullyPaid && (
          <Alert severity='success' variant='filled' className='mt-4'>
            การชำระเงินเสร็จสมบูรณ์
          </Alert>
        )}

        {isExpired && !isFullyPaid && (
          <Alert severity='error' variant='filled' className='mt-4'>
            หมดเวลาชำระเงิน กรุณาสร้างคำสั่งซื้อใหม่
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        {!isFullyPaid ? (
          <BtnVoidOrder orderId={paymentData.orderId} onVoidSuccess={handleVoidSuccess} />
        ) : (
          <Button onClick={onClose} color="error" size='small' variant='outlined'>
            ปิดหน้าจอ
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default Payment;
