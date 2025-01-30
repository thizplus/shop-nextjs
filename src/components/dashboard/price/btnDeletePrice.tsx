import { useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'

import type { TypePriceList } from '@/types/priceListTypes'
import { useDeletePriceList } from '@/actions/backend/priceList/usePriceList'


type Props = {
  items: TypePriceList;
}

const BtnDeletePrice = ({ items }: Props) => {
  const [open, setOpen] = useState(false)

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const deleteMutation = useDeletePriceList()

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(items.priceId)

      setSnackbar({
        open: true,
        message: 'ลบรายการราคาสำเร็จ',
        severity: 'success'
      })
      setOpen(false)
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด',
        severity: 'error'
      })
    }
  }

  return (
    <>
      <IconButton
        color='error'
        onClick={() => setOpen(true)}
      >
        <DeleteForeverIcon />
      </IconButton>

      <Dialog
        open={open}
        maxWidth='xs'
        fullWidth
        onClose={() => setOpen(false)}
      >
        <DialogTitle>ลบราคาสินค้า : {items.priceName}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`คุณต้องการลบราคาสินค้า "${items.priceName}" รหัส "${items.priceId}" ใช่หรือไม่ ?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button
            variant='contained'
            color='error'
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'กำลังลบ...' : 'ยืนยัน'}
          </Button>
          <Button
            variant='outlined'
            onClick={() => setOpen(false)}
            disabled={deleteMutation.isPending}
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
  )
}

export default BtnDeletePrice


