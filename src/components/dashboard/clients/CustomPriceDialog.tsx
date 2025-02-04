// components/dashboard/clients/CustomPriceDialog.tsx
import React, { useState, useEffect } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Paper,
  Alert,
  List,
  ListItem,
  IconButton,
  Box,
  Typography
} from '@mui/material';

import useCustomPrices from '@/actions/backend/clients/useCustomPrices';
import useSearchProducts from '@/actions/backend/clients/useSearchProducts';

import ProductSearchAutocomplete from './ProductSearchAutocomplete';
import type { ICustomPrice, ISearchProduct } from '@/types/productTypes';

interface CustomPriceDialogProps {
  userId: string;
  currentPrices: ICustomPrice[];
}

const CustomPriceDialog: React.FC<CustomPriceDialogProps> = ({
  userId,
  currentPrices
}) => {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [customPrices, setCustomPrices] = useState<ICustomPrice[]>(currentPrices || []);

  const isAllPricesValid = () => {
    return customPrices.every(price => price.price > 0);
  };

  // Add debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);


    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: searchResults = [], isLoading: isSearching } = useSearchProducts(searchTerm);
  const { mutate: saveCustomPrices, isPending: isProcessing } = useCustomPrices();

  const handleClose = () => {
    if (!isProcessing) {
      setOpen(false);
      setError(null);
      setSearchInput('');
      setCustomPrices(currentPrices || []);
    }
  };

  const handleProductSelect = (selectedProducts: ISearchProduct[]) => {
    const newPrices = selectedProducts.map(product => {
      const costPrice = product.listPrice?.find(p => p.priceName === 'COST')?.price || 0;


      return {
        sku: product.sku,
        price: costPrice,  // ใช้ราคา COST เป็นราคาเริ่มต้น
        name: product.name
      };
    });

    setCustomPrices(prev => {
      const combined = [...prev, ...newPrices];


      return combined.sort((a, b) => a.sku.localeCompare(b.sku));
    });

    setSearchInput('');
  };

  const handlePriceChange = (sku: string, price: number) => {
    setCustomPrices(prev =>
      prev.map(item =>
        item.sku === sku ? { ...item, price } : item
      )
    );
  };

  const handleRemovePrice = (sku: string) => {
    setCustomPrices(prev => prev.filter(p => p.sku !== sku));
  };

  const handleSubmit = async () => {
    try {
      setError(null);

      // Validate prices
      const invalidPrices = customPrices.filter(p => p.price <= 0);

      if (invalidPrices.length > 0) {
        setError('กรุณาระบุราคาให้ครบทุกรายการ');

        return;
      }

      await saveCustomPrices(
        { userId, prices: customPrices },
        {
          onSuccess: () => {
            setOpen(false);
            setCustomPrices([]);
            setSearchInput('');
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
      >
        <DialogTitle>
          <Typography variant="h6">กำหนดราคาสินค้าเฉพาะ SKU</Typography>
          <Typography variant="caption" color="textSecondary">
            User ID: {userId}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="ค้นหาสินค้า"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              size="small"
              fullWidth
              placeholder="ค้นหาจาก SKU หรือ ชื่อสินค้า"
            />

            {searchTerm && searchResults.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <ProductSearchAutocomplete
                  searchData={searchResults}
                  onProductSelect={handleProductSelect}
                  isLoading={isSearching}
                  disabled={isProcessing}
                  selectedPrices={customPrices}
                />
              </Paper>
            )}

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <List>
              {customPrices.map((price) => (
                <ListItem
                  key={price.sku}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1
                  }}
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      {/* ข้อมูลสินค้า */}
                      <Typography variant="subtitle2">{price.sku}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {price.name}
                      </Typography>

                      {/* แสดงราคาปัจจุบัน */}
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {searchResults?.find(p => p.sku === price.sku)?.listPrice?.map(lp => (
                          <Typography
                            key={lp.priceId}
                            variant="caption"
                            sx={{
                              bgcolor: 'grey.100',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            <span style={{ color: 'text.secondary' }}>{lp.priceName}:</span>
                            <span>{lp.price.toLocaleString()}฿</span>
                          </Typography>
                        ))}
                      </Box>
                    </Box>

                    {/* ช่องกรอกราคาใหม่ */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end', minWidth: 120 }}>
                      <TextField
                        fullWidth
                        label="ราคาใหม่"
                        value={price.price || ''}
                        onChange={(e) => handlePriceChange(price.sku, Number(e.target.value))}
                        type="number"
                        size="small"
                        error={price.price <= 0}
                        helperText={price.price <= 0 ? 'กรุณาระบุราคา' : ''}
                        InputProps={{
                          startAdornment: "฿"
                        }}
                        inputProps={{
                          min: 0,
                          step: "0.01"
                        }}
                      />
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isProcessing}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isProcessing || !isAllPricesValid()}
            color="primary"
          >
            {isProcessing ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomPriceDialog;
