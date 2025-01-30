// components/dashboard/dailyPayment/DialogPayment.tsx
import React, { useState, useCallback, useEffect } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';

import type { IDailyPayment } from '@/types/dailyPayment';
import { formatNumber } from '@/components/global/functions/numberFormat';
import CountdownTimer from '@/components/global/header/CountdownTimer';
import UploadSlip from './UploadSlip';



interface DialogPaymentProps {
  payment: IDailyPayment;
}

const DialogPayment: React.FC<DialogPaymentProps> = ({ payment }) => {
  const [open, setOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(payment.payment);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const expireTime = new Date(payment.expire).getTime();

    if (Date.now() >= expireTime) {
      setIsExpired(true);
      setOpen(false);
    }
  }, [payment.expire]);

  const handlePaymentUpdate = useCallback((newPayment: typeof currentPayment) => {
    setCurrentPayment(newPayment);
  }, []);

  const isFullyPaid = currentPayment.amount >= payment.totalAmount;
  const remainingAmount = Math.max(0, payment.totalAmount - currentPayment.amount);

  return (
    <>
      <Button
        size="small"
        variant="contained"
        color="success"
        onClick={() => setOpen(true)}
        startIcon={<i className="tabler-cash" />}

      // disabled={isFullyPaid || isExpired}
      >
        ชำระเงิน
      </Button>

      <Dialog
        open={open}
        disableEscapeKeyDown
        maxWidth="xs"
        fullWidth
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            setOpen(false);
          }
        }}
      >
        <DialogTitle>ชำระเงิน</DialogTitle>
        <DialogContent>
          <div className='block'>
            <div className='grid grid-cols-2 text-sm'>
              <p>เลขที่เอกสาร:</p>
              <p className='text-right font-bold'>{payment.docId}</p>
              <p>สถานะ:</p>
              <p className='text-right font-bold'>
                {isFullyPaid ? 'ชำระเงินครบแล้ว' : 'รอการชำระเงิน'}
              </p>
            </div>

            <div className='grid grid-cols-3 gap-1 pt-2 pb-1 border-dashed border rounded-sm mt-1'>
              <div className='block text-center leading-none'>
                <p className='font-bold text-md'>{formatNumber(payment.totalAmount)}฿</p>
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

            {!isFullyPaid && !isExpired && (
              <>
                <CountdownTimer
                  expireDate={payment.expire}
                  onExpire={() => {
                    setIsExpired(true);
                    setOpen(false);
                  }}
                />
                <UploadSlip
                  payment={payment}
                  onPaymentUpdate={handlePaymentUpdate}
                  currentPayment={currentPayment}
                  onExpire={() => {
                    setIsExpired(true);
                    setOpen(false);
                  }}
                />
              </>
            )}

            {payment.slipOK.qr_image && !isExpired && (
              <div className='mb-2'>
                <img src={payment.slipOK.qr_image} alt='QR Payment' className='w-full' />
              </div>
            )}

            {isFullyPaid && (
              <Alert severity='success' variant='filled' className='mt-4'>
                การชำระเงินเสร็จสมบูรณ์
              </Alert>
            )}

            {isExpired && !isFullyPaid && (
              <Alert severity='error' variant='filled' className='mt-4'>
                หมดเวลาชำระเงิน รายการสั่งซื้อทั้งหมดของคุณถูกยกเลิก !!!
              </Alert>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            color="error"
            size='small'
            variant='outlined'
          >
            ปิดหน้าจอ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DialogPayment;
