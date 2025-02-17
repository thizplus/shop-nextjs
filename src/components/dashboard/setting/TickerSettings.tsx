import React from 'react';

import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  CircularProgress,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import type { ITickerMessage } from '@/types/storeConfigTypes';
import ColorPickerButton from './ColorPickerButton';
import usePriceAll from '@/actions/backend/price/usePriceAll';

interface TickerSettingsProps {
  tickers: ITickerMessage[];
  onUpdate: (tickers: ITickerMessage[]) => void;
}

const TickerSettings = ({ tickers, onUpdate }: TickerSettingsProps) => {
  const { data: priceData, isLoading } = usePriceAll(1, 100);

  const handleAdd = () => {
    const newTicker: ITickerMessage = {
      id: `ticker-${Date.now()}`,
      message: '',
      color: '#ffffff',
      isActive: true,
      priceId: 'main'
    };

    onUpdate([...tickers, newTicker]);
  };

  const handleDelete = (id: string) => {
    onUpdate(tickers.filter(ticker => ticker.id !== id));
  };

  const handleChange = (id: string, field: keyof ITickerMessage, value: any) => {
    onUpdate(tickers.map(ticker =>
      ticker.id === id ? { ...ticker, [field]: value } : ticker
    ));
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Box className="space-y-4">
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h6">ตั้งค่าอักษรวิ่ง</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={handleAdd}
          size="small"
        >
          เพิ่มข้อความ
        </Button>
      </Box>

      {tickers.map((ticker) => (
        <Paper key={ticker.id} className="p-4">
          {/* ส่วนบนสุด - ข้อความและสี */}
          <Box className="mb-4">
            <TextField
              fullWidth
              size="small"
              label="ข้อความ"
              value={ticker.message}
              onChange={(e) => handleChange(ticker.id, 'message', e.target.value)}
              className="mb-2"
            />
            <Box className="flex items-center gap-2">
              <ColorPickerButton
                color={ticker.color || '#ffffff'}
                onChange={(color) => handleChange(ticker.id, 'color', color)}
              />
              <Typography variant="body2" color="text.secondary">
                เลือกสีข้อความ
              </Typography>
            </Box>
          </Box>

          <Divider className="my-3" />

          {/* ส่วนล่าง - การตั้งค่า */}
          <Box className="flex flex-wrap items-center gap-3">
            <FormControl size="small" className="min-w-[150px] flex-1">
              <InputLabel>แสดงผลที่</InputLabel>
              <Select
                value={ticker.priceId || 'main'}
                label="แสดงผลที่"
                onChange={(e) => handleChange(ticker.id, 'priceId', e.target.value)}
              >
                <MenuItem value="main">ร้านค้าหลัก</MenuItem>
                <MenuItem disabled>
                  <em>-- ราคาสินค้า --</em>
                </MenuItem>
                {priceData?.items.map((price) => (
                  <MenuItem key={price.priceId} value={price.priceId}>
                    {price.priceName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={ticker.isActive}
                  onChange={(e) => handleChange(ticker.id, 'isActive', e.target.checked)}
                  size="small"
                />
              }
              label="เปิดใช้งาน"
            />

            <IconButton
              color="error"
              onClick={() => handleDelete(ticker.id)}
              size="small"
              className="ml-auto"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Paper>
      ))}

      {tickers.length === 0 && (
        <Typography color="text.secondary" align="center" className="py-8">
          {`ยังไม่มีข้อความอักษรวิ่ง กดปุ่ม "เพิ่มข้อความ" เพื่อเริ่มต้น`}
        </Typography>
      )}
    </Box>
  );
};

export default TickerSettings;
