// components/dashboard/products/EditProductDialog.tsx
import React, { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Alert, Snackbar, Box, Chip } from '@mui/material';

import { useUpdateProduct } from '@/actions/backend/products/useUpdateProduct';
import useCategoryAll from '@/actions/backend/category/useCategoryAll';
import type { TypesProduct, ICategory } from '@/types/productTypes';

interface EditProductDialogProps {
  product: TypesProduct;
  onClose: () => void;
}

const EditProductDialog: React.FC<EditProductDialogProps> = ({ product, onClose }) => {
  // Initialize formData with product's existing data
  const [formData, setFormData] = useState({
    categories: product.categories || [],
  });

  const [availableCategories, setAvailableCategories] = useState<ICategory[]>([]);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: categoryData } = useCategoryAll(1, 100);

  const updateMutation = useUpdateProduct(product._id.toString());

  useEffect(() => {
    if (categoryData?.items) {
      const existingCategoryIds = new Set(formData.categories.map(cat => cat.catId));

      const filteredCategories = categoryData.items.filter(cat =>
        !existingCategoryIds.has(cat.catId)
      ).map(cat => ({
        catId: cat.catId,
        name: cat.name
      }));

      setAvailableCategories(filteredCategories);
    }
  }, [categoryData, formData.categories]);


  const handleSubmit = async () => {
    try {
      await updateMutation.mutateAsync({

        categories: formData.categories.map(cat => cat.catId),
      });

      setSnackbar({
        open: true,
        message: 'อัพเดทสินค้าสำเร็จ',
        severity: 'success',
      });
      onClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัพเดทสินค้า',
        severity: 'error',
      });
    }
  };

  const handleCategoryChange = (_: any, newValue: ICategory[]) => {
    const uniqueValues: ICategory[] = [];
    const seenIds = new Set<string>();

    for (const item of newValue) {
      if (!seenIds.has(item.catId)) {
        uniqueValues.push(item);
        seenIds.add(item.catId);
      }
    }

    setFormData(prev => ({
      ...prev,
      categories: uniqueValues
    }));
  };

  const isLoading = updateMutation.isPending;

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { overflow: 'visible' }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        แก้ไขสินค้า: {product.sku}
        <Button
          onClick={onClose}
          sx={{ minWidth: 'auto', p: 1 }}
        >
          <i className="tabler-x" />
        </Button>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

          <Autocomplete
            multiple
            freeSolo={false}
            options={availableCategories}
            getOptionLabel={(option) => option.name}
            value={formData.categories}
            onChange={handleCategoryChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="หมวดหมู่"
                placeholder="เลือกหมวดหมู่"
                size="small"
              />
            )}
            disabled={isLoading}
            isOptionEqualToValue={(option, value) => option.catId === value.catId}
            renderOption={(props, option) => (
              <li {...props}>
                <span>{option.name}</span>
              </li>
            )}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  label={option.name}
                  {...getTagProps({ index })}
                  key={option.catId}
                />
              ))
            }
          />


        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          ยกเลิก
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
        </Button>
      </DialogActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default EditProductDialog;
