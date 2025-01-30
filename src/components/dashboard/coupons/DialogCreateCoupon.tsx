// components/dashboard/coupons/DialogCreateCoupon.tsx
import { useState } from 'react';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Grid,
  IconButton
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

import { th } from 'date-fns/locale';

import AppReactDatepicker from '@/components/global/AppReactDatepicker';
import CustomTextField from '@core/components/mui/TextField';

import useCreateCoupon from '@/actions/backend/coupons/useCreateCoupon';

const DialogCreateCoupon = () => {
  // States
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'cart' | 'shipping'>('cart');
  const [value, setValue] = useState('');
  const [isPercent, setIsPercent] = useState(false);
  const [maxDiscount, setMaxDiscount] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [usageLimit, setUsageLimit] = useState('1');
  const [error, setError] = useState<string | null>(null);

  const { mutate: createCoupon, isPending } = useCreateCoupon();

  // Handlers
  const handleSubmit = () => {
    setError(null);

    // Validation
    if (!code || !value || !startDate || !endDate || !usageLimit) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');

      return;
    }

    if (startDate >= endDate) {
      setError('วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น');

      return;
    }

    const couponData = {
      code: code.toUpperCase(),
      type,
      value: parseFloat(value),
      isPercent,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
      minPurchase: minPurchase ? parseFloat(minPurchase) : undefined,
      startDate,
      endDate,
      usageLimit: parseInt(usageLimit)
    };

    createCoupon(couponData, {
      onSuccess: () => {
        setOpen(false);
        resetForm();
      },
      onError: (error) => {
        setError(error.message);
      }
    });
  };

  const resetForm = () => {
    setCode('');
    setType('cart');
    setValue('');
    setIsPercent(false);
    setMaxDiscount('');
    setMinPurchase('');
    setStartDate(new Date());
    setEndDate(new Date());
    setUsageLimit('1');
    setError(null);
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        startIcon={<i className="tabler-plus" />}
        size="small"
        className='my-auto'
      >
        สร้างคูปอง
      </Button>

      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            setOpen(false);
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center">
          สร้างคูปองใหม่
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <div className="space-y-4 mt-4">
            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}

            <TextField
              label="รหัสคูปอง"
              fullWidth
              value={code}
              onChange={(e) => setCode(e.target.value)}
              size="small"
            />

            <FormControl fullWidth size="small">
              <InputLabel>ประเภท</InputLabel>
              <Select
                value={type}
                label="ประเภท"
                onChange={(e) => setType(e.target.value as 'cart' | 'shipping')}
              >
                <MenuItem value="cart">ส่วนลดสินค้า</MenuItem>
                <MenuItem value="shipping">ส่วนลดค่าจัดส่ง</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="มูลค่า"
              type="number"
              fullWidth
              value={value}
              onChange={(e) => setValue(e.target.value)}
              size="small"
              onSelect={(e) => (e.target as HTMLInputElement).select()}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isPercent}
                  onChange={(e) => setIsPercent(e.target.checked)}
                />
              }
              label="ส่วนลดเป็นเปอร์เซ็นต์"
            />

            {isPercent && (
              <TextField
                label="ส่วนลดสูงสุด (บาท)"
                type="number"
                fullWidth
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                size="small"
                onSelect={(e) => (e.target as HTMLInputElement).select()}
              />
            )}

            <TextField
              label="ยอดซื้อขั้นต่ำ (บาท)"
              type="number"
              fullWidth
              value={minPurchase}
              onChange={(e) => setMinPurchase(e.target.value)}
              size="small"
              onSelect={(e) => (e.target as HTMLInputElement).select()}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <AppReactDatepicker
                  selected={startDate}
                  dateFormat="dd MMMM yyyy HH:mm น."
                  locale={th}
                  showTimeSelect
                  timeFormat="HH:mm น."
                  timeIntervals={15}
                  timeCaption="เวลา"
                  onChange={(date: Date | null) => setStartDate(date)}
                  customInput={
                    <CustomTextField
                      label="วันที่เริ่มต้น"
                      fullWidth
                      error={!!error && !startDate}
                      size="small"
                    />
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <AppReactDatepicker
                  selected={endDate}
                  dateFormat="dd MMMM yyyy HH:mm น."
                  locale={th}
                  showTimeSelect
                  timeFormat="HH:mm น."
                  timeIntervals={15}
                  timeCaption="เวลา"
                  onChange={(date: Date | null) => setEndDate(date)}
                  customInput={
                    <CustomTextField
                      label="วันที่สิ้นสุด"
                      fullWidth
                      error={!!error && !endDate}
                      size="small"
                    />
                  }
                />
              </Grid>
            </Grid>

            <TextField
              label="จำนวนครั้งที่ใช้ได้"
              type="number"
              fullWidth
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              inputProps={{ min: 1 }}
              size="small"
              onSelect={(e) => (e.target as HTMLInputElement).select()}
            />
          </div>
        </DialogContent>

        <DialogActions className="p-4">
          <Button onClick={() => setOpen(false)} disabled={isPending}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isPending}
          >
            {isPending ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DialogCreateCoupon;
