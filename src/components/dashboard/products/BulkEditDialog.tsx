// components/dashboard/products/BulkEditDialog.tsx
import React, { useState, useEffect } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Box,
  Chip,
  Alert,
  Typography,
  Tooltip
} from '@mui/material';

import type { ICategory, TypesProduct } from '@/types/productTypes';




interface BulkEditDialogProps {
  open: boolean;
  onClose: () => void;
  selectedProducts: TypesProduct[];
  availableCategories: ICategory[];
  onSave: (updates: {
    skus: string[];
    prices?: { [key: string]: number };
    categories?: string[];
  }) => Promise<void>;
}

interface PriceField {
  priceId: string;
  priceName: string;
  value: string;
}

const BulkEditDialog: React.FC<BulkEditDialogProps> = ({
  open,
  onClose,
  selectedProducts,
  availableCategories,
  onSave
}) => {
  const [priceFields, setPriceFields] = useState<PriceField[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProducts.length > 0) {
      // Get standard price structure from first product
      const firstProduct = selectedProducts[0];

      if (firstProduct.listPrice && firstProduct.listPrice.length > 0) {
        // Create price fields from all price types
        const fields = firstProduct.listPrice.map(price => ({
          priceId: price.priceId,
          priceName: price.priceName,
          value: ''
        }));

        // Sort by price name (VIP -> COST)
        const priceOrder = ['VIP', 'VIP3', 'VIP2', 'VIP1', 'COST'];

        fields.sort((a, b) => {
          const aIndex = priceOrder.indexOf(a.priceName);
          const bIndex = priceOrder.indexOf(b.priceName);


          return aIndex - bIndex;
        });

        setPriceFields(fields);
      }
    }
  }, [selectedProducts]);

  // Log current state for debugging
  useEffect(() => {
    console.log('Selected Products:', selectedProducts);
    console.log('Price Fields:', priceFields);
  }, [selectedProducts, priceFields]);

  useEffect(() => {
    if (selectedProducts.length > 0) {
      // ดึงหมวดหมู่จากสินค้าแรก
      setSelectedCategories(selectedProducts[0].categories || []);
    }
  }, [selectedProducts]);

  const handlePriceChange = (priceId: string, value: string) => {
    // ตรวจสอบว่าราคาต้องเป็นตัวเลขและมากกว่า 0
    const numValue = parseFloat(value);

    if (value && (isNaN(numValue) || numValue < 0)) {
      return;
    }

    setPriceFields(fields =>
      fields.map(field =>
        field.priceId === priceId ? { ...field, value } : field
      )
    );
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const updates: {
        skus: string[];
        prices?: { [key: string]: number };
        categories?: string[];
      } = {
        skus: selectedProducts.map(product => product.sku)
      };

      // Process prices
      const validPrices = priceFields.reduce((acc, field) => {
        if (field.value !== '') {
          acc[field.priceId] = parseFloat(field.value);
        }


        return acc;
      }, {} as { [key: string]: number });

      if (Object.keys(validPrices).length > 0) {
        updates.prices = validPrices;
      }

      // Process categories
      if (selectedCategories.length > 0) {
        updates.categories = selectedCategories.map(cat => cat.catId);
      }

      if (Object.keys(updates).length === 1) { // Only has skus
        setError('กรุณาเลือกข้อมูลที่ต้องการแก้ไข');

        return;
      }

      await onSave(updates);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!isLoading ? onClose : undefined}  // ป้องกันการปิด dialog ระหว่าง loading
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        แก้ไขข้อมูลสินค้า ({selectedProducts.length} รายการ)
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Products Selection */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              รายการสินค้าที่เลือก
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedProducts.map((product) => (
                <Chip
                  key={product.sku}
                  label={`${product.sku} - ${product.name}`}
                  size="small"
                  className='text-xs'
                />
              ))}
            </Box>
          </Box>

          {/* Price Fields */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              ราคาสินค้า
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {priceFields.map((field) => {
                const originalPrice = selectedProducts[0]?.listPrice?.find(
                  p => p.priceId === field.priceId
                )?.price;

                return (
                  <Tooltip
                    key={field.priceId}
                    title={`ราคาเดิม: ${originalPrice}`}
                  >
                    <TextField
                      label={field.priceName}
                      value={field.value}
                      onChange={(e) => handlePriceChange(field.priceId, e.target.value)}
                      type="number"
                      size="small"
                      sx={{ width: '100px' }}
                      InputProps={{
                        inputProps: { min: 0, step: "0.01" }
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          </Box>

          {/* Categories Selection */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              หมวดหมู่
            </Typography>
            <Autocomplete
              multiple
              options={availableCategories}
              getOptionLabel={(option) => option.name}
              value={selectedCategories}
              onChange={(_, newValue) => setSelectedCategories(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="เลือกหมวดหมู่"
                  size="small"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    key={option.catId}
                  />
                ))
              }
            />
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          ยกเลิก
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkEditDialog;
