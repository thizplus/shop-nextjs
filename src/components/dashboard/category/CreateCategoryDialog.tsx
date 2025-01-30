import React, { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { Alert, Snackbar } from '@mui/material';

import useCreateCategory from '@/actions/backend/category/useCreateCategory';



const CreateCategoryDialog = () => {
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

  const createMutation = useCreateCategory();

  const handleOpen = () => setOpen(true);

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    try {
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim()
      });

      setSnackbar({
        open: true,
        message: 'เพิ่มหมวดหมู่สำเร็จ',
        severity: 'success'
      });
      handleClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด',
        severity: 'error'
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ name: '', description: '' });
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        startIcon={<i className="tabler-plus" />}
      >
        เพิ่มหมวดหมู่สินค้า
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { overflow: 'visible' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          เพิ่มหมวดหมู่สินค้า
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
            disabled={createMutation.isPending}
            fullWidth
            size='small'
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="รายละเอียด"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            disabled={createMutation.isPending}
            fullWidth
            multiline
            rows={3}
            size='small'
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={createMutation.isPending}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={createMutation.isPending || !formData.name.trim()}
          >
            {createMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
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

export default CreateCategoryDialog;
