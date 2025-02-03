// components/dashboard/clients/ProductSearchAutocomplete.tsx
import React, { useState } from 'react';

import {
  Box,
  Checkbox,
  Avatar,
  Typography,
  Chip,
  FormControlLabel,
  CircularProgress,
  Paper
} from '@mui/material';

import type { ICustomPrice, ISearchProduct } from '@/types/productTypes';  // import type ที่มีอยู่แล้ว





interface ProductSearchProps {
  searchData: ISearchProduct[];
  onProductSelect: (products: ISearchProduct[]) => void;
  isLoading: boolean;
  disabled?: boolean;
  selectedPrices: ICustomPrice[];
}

export default function ProductSearchAutocomplete({
  searchData = [],
  onProductSelect,
  isLoading,
  disabled = false,
  selectedPrices
}: ProductSearchProps) {
  const [selectedProducts, setSelectedProducts] = useState<ISearchProduct[]>([]);

  // กรองสินค้าที่เลือกไว้แล้วออก
  const availableProducts = searchData.filter(
    product => !selectedPrices.some(price => price.sku === product.sku)
  );

  const handleSelectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || isLoading) return;

    const productId = event.target.value;
    const product = availableProducts.find(p => p._id.toString() === productId);

    if (!product) return;

    if (event.target.checked) {
      setSelectedProducts(prev => [...prev, product]);
    } else {
      setSelectedProducts(prev => prev.filter(p => p._id.toString() !== productId));
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || isLoading) return;

    if (event.target.checked) {
      setSelectedProducts(availableProducts);
    } else {
      setSelectedProducts([]);
    }
  };

  const handleAddSelected = () => {
    if (disabled || isLoading || selectedProducts.length === 0) return;
    onProductSelect(selectedProducts);
    setSelectedProducts([]);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (availableProducts.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">
          ไม่พบสินค้าที่สามารถเลือกได้
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{
        mb: 2,
        pb: 2,
        pl: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedProducts.length === availableProducts.length && availableProducts.length > 0}
              indeterminate={selectedProducts.length > 0 && selectedProducts.length < availableProducts.length}
              onChange={handleSelectAll}
              disabled={disabled || isLoading}
            />
          }
          label="เลือกทั้งหมด"
        />
        {selectedProducts.length > 0 && (
          <Chip
            label={`เลือก ${selectedProducts.length} รายการ`}
            color="primary"
            onClick={handleAddSelected}
            disabled={disabled || isLoading}
          />
        )}
      </Box>

      <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
        {availableProducts.map((product) => (
          <Box
            key={product._id.toString()}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 1,
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <Checkbox
              checked={selectedProducts.some(p => p._id.toString() === product._id.toString())}
              onChange={handleSelectionChange}
              value={product._id.toString()}
              disabled={disabled || isLoading}
            />
            <Avatar
              src={product.imagepath || ''}
              alt={product.name}
              variant="rounded"
              sx={{
                width: 48,
                height: 48,
                mr: 2,
                bgcolor: 'grey.100',
                '& img': {
                  objectFit: 'contain',
                  padding: 0.5
                }
              }}
            />
            <Box>
              <Typography variant="subtitle2">
                {product.name}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="caption" color="textSecondary">
                  SKU: {product.sku} | คงเหลือ: {product.availablestock}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {product.listPrice?.map(price => (
                    <Typography
                      key={price.priceId}
                      variant="caption"
                      sx={{
                        bgcolor: 'primary.50',
                        color: 'primary.main',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1
                      }}
                    >
                      {price.priceName}: {price.price.toLocaleString()}฿
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
