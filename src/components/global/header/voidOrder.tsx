import { useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import actionVoidOrder from '@/actions/zortout/actionVoidOrder'

type PropsBtnVoidOrder = {
  orderId: string;
  onVoidSuccess: () => void;
}

const BtnVoidOrder = ({ orderId, onVoidSuccess }: PropsBtnVoidOrder) => {
  const [open, setOpen] = useState<boolean>(false)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleVoidOrder = async () => {
    setIsProcessing(true)

    try {
      const result = await actionVoidOrder({ orderId })

      console.log('Order voided successfully:', result.message)
      onVoidSuccess()
      handleClose()
    } catch (error) {
      console.error('Failed to void order:', error)

      // Here you might want to show an error message to the user
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Button onClick={handleClickOpen} color="error" size='small' variant='contained'>
        ยกเลิกคำสั่งซื้อ
      </Button>

      <Dialog
        open={open}
        disableEscapeKeyDown
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        fullWidth
        maxWidth="xs"
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
      >
        <DialogTitle id='alert-dialog-title'>ยกเลิกคำสั่งซื้อ</DialogTitle>
        <DialogContent>
          <p>คุณต้องการยกเลิกคำสั่งซื้อ หมายเลขคำสั่งซื้อ <strong className='text-red-600'>{orderId}</strong> ใช่หรือไม่ ?</p>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button
            onClick={handleVoidOrder}
            variant='contained'
            color='error'
            disabled={isProcessing}
          >
            {isProcessing ? 'กำลังดำเนินการ...' : 'ยืนยันการยกเลิก'}
          </Button>
          <Button onClick={handleClose} variant='outlined' color='error'>ปิด</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default BtnVoidOrder
