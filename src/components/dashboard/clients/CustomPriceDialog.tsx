import React, { useState, useEffect } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  List,
  ListItem,
  Autocomplete
} from '@mui/material';
import { styled } from '@mui/material/styles';

import useCustomPrices from '@/actions/backend/clients/useCustomPrices';
import useSearchProducts from '@/actions/backend/clients/useSearchProducts';

interface Product {
  _id: string;
  sku: string;
  name: string;
  availablestock: number;
  category: string;
}

interface CustomPrice {
  sku: string;
  price: number;
  name?: string;
}

interface CustomPriceDialogProps {
  userId: string;
  currentPrices: CustomPrice[];
}

const StyledAutoComplete = styled(Autocomplete<Product, false, false, false>)({
  '& .MuiAutocomplete-listbox': {
    maxHeight: '300px',
    '& li': {
      borderBottom: '1px solid #eee',
      padding: '12px 16px',  // เพิ่ม padding
      '&:not(:last-child)': {
        marginBottom: '4px'  // เพิ่ม margin ระหว่างรายการ
      }
    }
  },
  '& .MuiAutocomplete-popper': {
    marginTop: '8px',
  }
});

const CustomPriceDialog: React.FC<CustomPriceDialogProps> = ({ userId, currentPrices }) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skuInput, setSkuInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [customPrices, setCustomPrices] = useState<CustomPrice[]>(currentPrices || []);

  useEffect(() => {
    if (open) {
      setCustomPrices(currentPrices || []);
      setSkuInput('');
      setPriceInput('');
      setSelectedProduct(null);
      setError(null);
    }
  }, [open, currentPrices]);

  const { data: searchResults = [], isLoading: isSearching } = useSearchProducts(skuInput);

  const {
    mutate: saveCustomPrices,
    isPending: isProcessing,
    data: updateResult
  } = useCustomPrices();

  const handleClose = () => {
    if (!isProcessing) {
      setOpen(false);
      setError(null);
      setSkuInput('');
      setPriceInput('');
      setSelectedProduct(null);
      setCustomPrices(currentPrices || []);
    }
  };

  const handleAddPrice = () => {
    if (!selectedProduct || !priceInput) {
      setError('กรุณาเลือกสินค้าและระบุราคา');

      return;
    }

    const price = parseFloat(priceInput);

    if (isNaN(price) || price < 0) {
      setError('ราคาไม่ถูกต้อง');

      return;
    }

    if (customPrices.some(p => p.sku === selectedProduct.sku)) {
      setError('สินค้านี้มีอยู่ในรายการแล้ว');

      return;
    }

    setCustomPrices(prev => [...prev, {
      sku: selectedProduct.sku,
      price,
      name: selectedProduct.name
    }]);
    setSkuInput('');
    setPriceInput('');
    setSelectedProduct(null);
    setError(null);
  };

  const handleRemovePrice = (sku: string) => {
    setCustomPrices(prev => prev.filter(p => p.sku !== sku));
  };

  const onSubmit = async () => {
    try {
      setError(null);

      if (customPrices.length === 0) {  // เพิ่มเงื่อนไขนี้
        // ถ้าไม่มีรายการ ให้ส่ง array เปล่าไป
        await saveCustomPrices(
          { userId, prices: [] },
          {
            onSuccess: () => {
              setTimeout(() => {
                setOpen(false);
                setSkuInput('');
                setPriceInput('');
                setSelectedProduct(null);
                setCustomPrices([]);  // รีเซ็ตเป็น array เปล่า
              }, 1500);
            },
            onError: (error) => {
              setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึก');
            }
          }
        );

        return;  // ออกจากฟังก์ชันเลย
      }

      // ถ้ามีรายการ ทำงานปกติ
      await saveCustomPrices(
        { userId, prices: customPrices },
        {
          onSuccess: () => {
            setTimeout(() => {
              setOpen(false);
              setSkuInput('');
              setPriceInput('');
              setSelectedProduct(null);
              setCustomPrices([]);
            }, 1500);
          },
          onError: (error) => {
            setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึก');
          }
        }
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const renderContent = () => (
    <div className="space-y-4">
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="flex gap-2">
        <StyledAutoComplete
          fullWidth
          options={searchResults}
          value={selectedProduct}
          getOptionLabel={(option: Product) => `${option.sku} - ${option.name}`}
          isOptionEqualToValue={(option: Product, value: Product) => option.sku === value.sku}
          inputValue={skuInput}
          onInputChange={(_, newValue) => {
            setSkuInput(newValue);
            setError(null);
          }}
          onChange={(_, newValue: Product | null) => {
            setSelectedProduct(newValue);
            setError(null);
          }}
          loading={isSearching}
          renderInput={(params) => (
            <TextField
              {...params}
              label="ค้นหาสินค้า"
              placeholder="ค้นหาจาก SKU หรือ ชื่อสินค้า"
              size="small"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isSearching ? <CircularProgress size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option: Product) => (
            <li {...props}>
              <div className="flex flex-col py-1 w-full">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <Typography variant="subtitle2" className="font-semibold mb-1">
                      {option.sku}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 mb-1">
                      {option.name}
                    </Typography>

                  </div>
                  <div className="flex items-center bg-blue-50 px-2 py-1 rounded">
                    <Typography variant="caption" color="primary" className="whitespace-nowrap">
                      คงเหลือ: {option.availablestock}
                    </Typography>
                  </div>
                </div>
              </div>
            </li>
          )}
        />
        <TextField
          label="ราคา"
          value={priceInput}
          onChange={(e) => {
            setPriceInput(e.target.value);
            setError(null);
          }}
          type="number"
          size="small"
          sx={{ width: '150px' }}
          disabled={isProcessing || !selectedProduct}
          InputProps={{
            startAdornment: <InputAdornment position="start">฿</InputAdornment>,
          }}
        />
        <Button
          variant="contained"
          onClick={handleAddPrice}
          disabled={isProcessing || !selectedProduct || !priceInput}
          className="whitespace-nowrap"
        >
          เพิ่ม
        </Button>
      </div>

      <List className="max-h-[400px] overflow-y-auto">
        {customPrices.map((price) => (
          <ListItem
            key={price.sku}
            className="border rounded mb-2 hover:bg-gray-50"
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => handleRemovePrice(price.sku)}
                disabled={isProcessing}
              >
                <i className="tabler-x" />
              </IconButton>
            }
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Typography variant="subtitle2" className="font-semibold">{price.sku}</Typography>
                <Typography variant="body2" color="primary" className="font-semibold">
                  {price.price.toLocaleString()}฿
                </Typography>
              </div>
              {price.name && (
                <Typography variant="body2" color="textSecondary">
                  {price.name}
                </Typography>
              )}
            </div>
          </ListItem>
        ))}
      </List>

      {isProcessing && (
        <div className="flex justify-center">
          <CircularProgress size={24} />
        </div>
      )}

      {updateResult && (
        <Typography
          color="success"
          className="text-center font-bold"
        >
          บันทึกข้อมูลเรียบร้อย
        </Typography>
      )}
    </div>
  );

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={() => setOpen(true)}
        startIcon={<i className="tabler-tags" />}
      >
        ราคาเฉพาะ SKU
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle className=" items-center">
          <p>กำหนดราคาสินค้าเฉพาะ SKU</p>
          <p className='text-sm'> User ID: {userId}</p>
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
            color="inherit"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={onSubmit}
            variant="contained"
            disabled={isProcessing}  // ลบเงื่อนไข customPrices.length === 0 ออก
          >
            {isProcessing ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomPriceDialog;
