import { useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import DialogContentText from '@mui/material/DialogContentText'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'


import type { TypePriceList } from '@/types/priceListTypes'
import SelectData from '@/components/global/selectData'
import { useCreatePriceList } from '@/actions/backend/priceList/usePriceList'

type Props = {
  listItems: TypePriceList[]
}

const BtnCreatePrice = ({ listItems }: Props) => {
  const [open, setOpen] = useState(false)
  const [priceName, setPriceName] = useState('')
  const [idPrice, setIdPrice] = useState<string | ''>('')

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const createMutation = useCreatePriceList()

  const handleCreate = async () => {
    if (!priceName.trim()) return

    const payload = {
      priceName: priceName.trim(),
      idPrice: idPrice.trim(),
    }

    console.log('Sending payload:', payload)

    try {
      await createMutation.mutateAsync(payload)

      setSnackbar({
        open: true,
        message: 'สร้างรายการราคาสำเร็จ',
        severity: 'success'
      })
      handleClose()
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด',
        severity: 'error'
      })
    }
  }

  const handleClose = () => {
    setOpen(false)
    setPriceName('')
    setIdPrice('')
  }

  return (
    <>
      <Button
        variant='contained'
        startIcon={<i className='tabler-plus' />}
        onClick={() => setOpen(true)}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'กำลังเพิ่มข้อมูล...' : 'เพิ่มราคาสินค้า'}
      </Button>

      <Dialog
        open={open}
        maxWidth='xs'
        fullWidth
        onClose={handleClose}
      >
        <DialogTitle>สร้างราคาสินค้า</DialogTitle>
        <DialogContent>
          <DialogContentText className='mb-2'>
            กรุณาตั้งชื่อเรทราคา [ห้ามซ้ำกัน]
          </DialogContentText>
          <TextField
            label="ชื่อเรทราคา"
            value={priceName}
            onChange={e => setPriceName(e.target.value)}
            size="small"
            fullWidth
            className='mb-4'
            sx={{
              '& .MuiInputBase-root': {
                height: '40px',
              }
            }}
          />

          <DialogContentText className='mb-2'>
            คัดลอกราคา
          </DialogContentText>
          <SelectData
            items={listItems}
            onChange={setIdPrice}
          />
        </DialogContent>

        <DialogActions className='dialog-actions-dense'>
          <Button
            variant='contained'
            onClick={handleCreate}
            disabled={createMutation.isPending || !priceName.trim()}
          >
            {createMutation.isPending ? 'กำลังเพิ่ม...' : 'ยืนยัน'}
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleClose}
            disabled={createMutation.isPending}
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

export default BtnCreatePrice
