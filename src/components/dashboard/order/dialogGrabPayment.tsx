import React, { useState } from 'react';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';

import type { TypeOrder } from "@/types/orderTypes";
import useGrabPayment from '@/actions/backend/orders/useGrabPayment';

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

  const renderContent = () => {
    if (isGrabProcessing) {
      return (
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography>สถานะ:</Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography>กำลังเรียกเก็บเงิน</Typography>
          </Grid>

          <Grid item xs={4}>
            <Typography>จำนวนเงิน:</Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography>{order.grabPayment?.amount} บาท</Typography>
          </Grid>

          <Grid item xs={4}>
            <Typography>วันที่อัพเดท:</Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography>
              {new Date(order.grabPayment?.updatedAt || '').toLocaleString('th-TH')}
            </Typography>
          </Grid>

          {order.grabPayment?.note && (
            <>
              <Grid item xs={4}>
                <Typography>หมายเหตุ:</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{order.grabPayment.note}</Typography>
              </Grid>
            </>
          )}
        </Grid>
      );
    }

    return (
      <div className="space-y-4">
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

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

        {isProcessing && (
          <div className="flex justify-center">
            <CircularProgress size={24} />
          </div>
        )}

        {updateResult && (
          <Typography
            color={updateResult.includes('เรียบร้อย') ? 'success' : 'error'}
            className='text-center font-bold'
          >
            {updateResult}
          </Typography>
        )}
      </div>
    );
  };

  return (
    <>
      <Button
        variant={isGrabProcessing ? "outlined" : "contained"}
        color={isGrabProcessing ? "info" : "primary"}
        onClick={() => setOpen(true)}
        startIcon={<i className={`tabler-${isGrabProcessing ? 'info-circle' : 'coin'}`} />}
        size="small"
      >
        {isGrabProcessing ? 'Grab' : 'Grab'}
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle className="flex justify-between items-center">
          {isGrabProcessing ? 'รายละเอียดค่าส่ง Grab' : 'จัดการค่าส่ง Grab'}
          <Typography variant="body2" color="textSecondary">
            Order ID: {order.orderId}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <div className="space-y-4 mt-4">
            {renderContent()}
          </div>
        </DialogContent>

        <DialogActions className="p-4">
          <Button
            onClick={handleClose}
            disabled={isProcessing}
            color="error"
            variant='contained'
          >
            {isGrabProcessing ? 'ปิด' : 'ยกเลิก'}
          </Button>
          {!isGrabProcessing && (
            <Button
              onClick={onSubmit}
              variant="contained"
              disabled={isProcessing || !amount}
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
