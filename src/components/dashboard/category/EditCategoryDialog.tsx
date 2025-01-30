import React, { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { Alert, Snackbar } from '@mui/material';

import type { TypesCategory } from '@/types/categoryTypes';
import useUpdateCategory from '@/actions/backend/category/useUpdateCategory';

interface EditCategoryDialogProps {
  category: TypesCategory;
}

const EditCategoryDialog = ({ category }: EditCategoryDialogProps) => {
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const updateMutation = useUpdateCategory();

  useEffect(() => {
    if (category && open) {
      setFormData({
        name: category.name,
        description: category.description
      });
    }
  }, [category, open]);

  const handleClose = () => {
    setOpen(false);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    try {
      await updateMutation.mutateAsync({
        _id: category._id.toString(),
        name: formData.name.trim(),
        description: formData.description.trim()
      });

      setSnackbar({
        open: true,
        message: 'แก้ไขหมวดหมู่สำเร็จ',
        severity: 'success',
      });
      handleClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่',
        severity: 'error',
      });
    }
  };

  const isChanged = formData.name !== category.name || formData.description !== category.description;

  return (
    <>
      <Button
        size="small"
        startIcon={<i className="tabler-edit" />}
        onClick={() => setOpen(true)}
      >
        แก้ไข
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          แก้ไขหมวดหมู่สินค้า
          <Button
            onClick={handleClose}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <i className="tabler-x" />
          </Button>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="ชื่อหมวดหมู่"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            disabled={updateMutation.isPending}
            fullWidth
            size='small'
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="รายละเอียด"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            disabled={updateMutation.isPending}
            fullWidth
            multiline
            rows={3}
            size='small'
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={updateMutation.isPending}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={updateMutation.isPending || !formData.name.trim() || !isChanged}
          >
            {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
};

export default EditCategoryDialog;
