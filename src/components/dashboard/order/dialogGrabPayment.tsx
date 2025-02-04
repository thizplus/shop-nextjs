import React, { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import type { TypeOrder } from "@/types/orderTypes";
import useGrabPayment from '@/actions/backend/orders/useGrabPayment';
import formatThaiDateTime from '@/components/global/functions/formatThaiDateTime';
import { formatNumber } from '@/components/global/functions/numberFormat';

interface DialogGrabPaymentProps {
  order: TypeOrder;
  onSuccess?: () => void;
}

const DialogGrabPayment: React.FC<DialogGrabPaymentProps> = ({ order }) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    amount,
    note,
    isProcessing,
    updateResult,
    setNote,
    handleAmountChange,
    handleSubmit,
    resetForm
  } = useGrabPayment({
    order,
    onSuccess: () => {
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 1500);
    }
  });

  const isGrabProcessing = order.grabPayment?.status === 'processing';

  if (order.shippingMethod !== 'grab' || order.payment.status === 'cancelled') {
    return null;
  }

  const handleClose = () => {
    if (!isProcessing) {
      setOpen(false);
      setError(null);
      resetForm();
    }
  };

  const onSubmit = async () => {
    try {
      setError(null);

      if (!amount || parseFloat(amount) <= 0) {
        setError('กรุณาระบุจำนวนเงินให้ถูกต้อง');

        return;
      }

      await handleSubmit();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัพเดท');
    }
  };

  const renderProcessingContent = () => (
    <div className="border rounded-lg p-4">
      <div className="font-medium mb-2">รายละเอียดการชำระเงิน</div>
      <div className="text-sm leading-none space-y-2">
        <div>
          <div className="">สถานะ : กำลังเรียกเก็บเงิน</div>
        </div>
        <div>
          <div className="">จำนวนเงิน : {formatNumber(order.grabPayment?.amount || 0)} บาท</div>
        </div>
        <div>
          <div className="">วันที่อัพเดท : {order.grabPayment?.updatedAt ? formatThaiDateTime(order.grabPayment.updatedAt.toLocaleString()) : '-'}</div>
        </div>
        {order.grabPayment?.note && (
          <div>
            <div className="">หมายเหตุ : {order.grabPayment.note}</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderInputContent = () => (
    <div className="space-y-4">
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="border rounded-lg p-4">
        <div className="font-medium mb-2">จัดการค่าส่ง Grab</div>
        <div className="space-y-4">
          <TextField
            fullWidth
            label="จำนวนเงิน"
            type="text"
            value={amount}
            onChange={(e) => {
              handleAmountChange(e);
              setError(null);
            }}
            disabled={isProcessing}
            size="small"
            error={!!error && !amount}
            helperText={error && !amount ? 'กรุณาระบุจำนวนเงิน' : ''}
            InputProps={{
              startAdornment: '฿',
            }}
          />

          <TextField
            fullWidth
            label="หมายเหตุ"
            multiline
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isProcessing}
            size="small"
            placeholder="ระบุหมายเหตุ (ถ้ามี)"
          />
        </div>
      </div>

      {isProcessing && (
        <div className="flex justify-center">
          <CircularProgress size={24} />
        </div>
      )}

      {updateResult && (
        <div className={`text-center font-medium ${updateResult.includes('เรียบร้อย') ? 'text-green-600' : 'text-red-600'}`}>
          {updateResult}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Button
        variant="contained"
        color={isGrabProcessing ? "warning" : "error"}
        onClick={() => setOpen(true)}
        startIcon={<i className={`tabler-${isGrabProcessing ? 'info-circle' : 'coin'}`} />}
        size="small"
      >
        Grab
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="grab-payment-dialog-title"
      >
        <DialogTitle id="grab-payment-dialog-title">
          <div className="flex justify-between items-center">
            <div className="text-lg font-medium">
              Order ID: {order.orderId}
            </div>
          </div>
        </DialogTitle>

        <DialogContent>
          <div className="space-y-4">
            {isGrabProcessing ? renderProcessingContent() : renderInputContent()}
          </div>
        </DialogContent>

        <DialogActions className="dialog-actions-dense">
          <Button
            onClick={handleClose}
            disabled={isProcessing}
            color="error"
            variant="outlined"
            size="small"
          >
            {isGrabProcessing ? 'ปิด' : 'ยกเลิก'}
          </Button>
          {!isGrabProcessing && (
            <Button
              onClick={onSubmit}
              variant="contained"
              disabled={isProcessing || !amount}
              size="small"
            >
              {isProcessing ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DialogGrabPayment;
