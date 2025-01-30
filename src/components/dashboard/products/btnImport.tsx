'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

import { useImportProducts } from '@/actions/backend/products/useImportProducts'



const BtnImport = () => {
  const [open, setOpen] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const importMutation = useImportProducts();

  const handleImport = async () => {
    try {
      await importMutation.mutateAsync();
      setSnackbar({
        open: true,
        message: 'นำเข้าข้อมูลสำเร็จ',
        severity: 'success'
      });
      setOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'นำเข้าข้อมูลล้มเหลว',
        severity: 'error'
      });
    }
  };

  return (
    <>
      <Button
        variant='contained'
        startIcon={<i className='tabler-upload' />}
        onClick={() => setOpen(true)}
        disabled={importMutation.isPending}
      >
        {importMutation.isPending ? 'กำลังนำเข้าข้อมูล...' : 'IMPORT ข้อมูลสินค้า'}
      </Button>

      <Dialog
        open={open}
        maxWidth='xs'
        fullWidth
        onClose={() => setOpen(false)}
      >
        <DialogTitle>IMPORT PRODUCT</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณต้องการ IMPORT ข้อมูลสินค้าทั้งหมด ใช่หรือไม่ ?
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button
            variant='contained'
            onClick={handleImport}
            disabled={importMutation.isPending}
          >
            {importMutation.isPending ? 'กำลังนำเข้าข้อมูล...' : 'ยืนยัน'}
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={() => setOpen(false)}
            disabled={importMutation.isPending}
          >
            ยกเลิก
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ width: '100%', boxShadow: 3, borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BtnImport
