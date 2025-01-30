// components/dashboard/points/DialogCreatePointTicket.tsx
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
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { TicketType } from '@/types/pointTypes';
import { useCreatePointTicket } from '@/actions/backend/point/usePointTickets';

interface PointTicketFormData {
  name: string;
  description: string;
  type: TicketType;
  pointCost: number;
  discountValue: number;
  isPercent: boolean;
  maxDiscount?: number;
  minPurchase?: number;
  expiresInDays: number;
}

const DialogCreatePointTicket = () => {
  // States
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TicketType>(TicketType.CART);
  const [pointCost, setPointCost] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [isPercent, setIsPercent] = useState(false);
  const [maxDiscount, setMaxDiscount] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('30');
  const [error, setError] = useState<string | null>(null);

  const { mutate: createTicket, isPending } = useCreatePointTicket();

  const handleSubmit = () => {
    setError(null);

    // Validation
    if (!name || !pointCost || !discountValue || !expiresInDays) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');

      return;
    }

    const ticketData: PointTicketFormData = {
      name,
      description,
      type,
      pointCost: parseInt(pointCost),
      discountValue: parseFloat(discountValue),
      isPercent,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
      minPurchase: minPurchase ? parseFloat(minPurchase) : undefined,
      expiresInDays: parseInt(expiresInDays)
    };

    createTicket(ticketData, {
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
    setName('');
    setDescription('');
    setType(TicketType.CART);
    setPointCost('');
    setDiscountValue('');
    setIsPercent(false);
    setMaxDiscount('');
    setMinPurchase('');
    setExpiresInDays('30');
    setError(null);
  };

  const handleClose = (event: {}, reason: "backdropClick" | "escapeKeyDown") => {
    if (reason !== 'backdropClick') {
      setOpen(false);
    }
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
        สร้างตั๋วแลกพอยต์
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center">
          สร้างตั๋วแลกพอยต์ใหม่
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
              label="ชื่อตั๋ว"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="small"
            />

            <TextField
              label="รายละเอียด"
              fullWidth
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              size="small"
            />

            <FormControl fullWidth size="small">
              <InputLabel>ประเภท</InputLabel>
              <Select
                value={type}
                label="ประเภท"
                onChange={(e) => setType(e.target.value as TicketType)}
              >
                <MenuItem value={TicketType.CART}>ส่วนลดสินค้า</MenuItem>
                <MenuItem value={TicketType.SHIPPING}>ส่วนลดค่าจัดส่ง</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="ราคาพอยต์"
              type="number"
              fullWidth
              value={pointCost}
              onChange={(e) => setPointCost(e.target.value)}
              size="small"
              onSelect={(e) => (e.target as HTMLInputElement).select()}
              inputProps={{ min: 1 }}
            />

            <TextField
              label="มูลค่าส่วนลด"
              type="number"
              fullWidth
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              size="small"
              onSelect={(e) => (e.target as HTMLInputElement).select()}
              inputProps={{ min: 0 }}
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
                inputProps={{ min: 0 }}
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
              inputProps={{ min: 0 }}
            />

            <TextField
              label="อายุการใช้งาน (วัน)"
              type="number"
              fullWidth
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              size="small"
              onSelect={(e) => (e.target as HTMLInputElement).select()}
              inputProps={{ min: 1 }}
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

export default DialogCreatePointTicket;
