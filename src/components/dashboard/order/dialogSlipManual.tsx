// React Imports
import { useState, useCallback, useEffect } from 'react';

import { useDropzone } from 'react-dropzone';

// MUI Imports
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';

// Custom Hook
import useManualSlipUpload from '@/actions/backend/slipOK/useManualSlipUpload';

// Types
import type { TypeOrder } from '@/types/orderTypes';

interface DialogSlipManualProps {
  order: TypeOrder;
  onSuccess?: () => void;
}

const DialogSlipManual = ({ order, onSuccess }: DialogSlipManualProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);

  // คำนวณยอดคงเหลือเมื่อ component โหลดหรือ order เปลี่ยน
  useEffect(() => {
    const paid = order.payment?.amount || 0;
    const remaining = order.netTotal - paid;

    setRemainingAmount(remaining);
  }, [order]);

  const {
    file,
    amount,
    isUploading,
    uploadResult,
    setFile,
    clearFile,
    handleAmountChange,
    handleSubmit
  } = useManualSlipUpload({
    order,
    onSuccess: () => {
      if (onSuccess) {
        onSuccess();
      }

      setTimeout(handleClose, 1500);
    }
  });

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    clearFile();
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFile = Object.assign(acceptedFiles[0], {
        preview: URL.createObjectURL(acceptedFiles[0])
      });

      setFile(newFile);
    }
  }, [setFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg']
    },
    maxFiles: 1,
    multiple: false
  });

  const onSubmit = async () => {
    try {
      await handleSubmit();
    } catch (error) {
      console.error('Failed to submit:', error);
    }
  };

  // ไม่แสดงปุ่มถ้า:
  // 1. ไม่ใช่สถานะ pending หรือ
  // 2. ชำระเงินครบแล้ว
  if (order.payment?.status !== 'pending' || remainingAmount <= 0) {
    return null;
  }

  return (
    <>
      <Button
        variant='outlined'
        onClick={handleClickOpen}
        startIcon={<i className='tabler-receipt-2' />}
        size='small'
        color='info'
      >
        แนบสลิป
      </Button>

      <Dialog
        open={open}
        disableEscapeKeyDown
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id='alert-dialog-title' className="flex justify-between items-center">
          แนบสลิป
          <Typography variant="body2" color="textSecondary">
            OrderID: {order.orderId}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <div className="space-y-4">
            {/* แสดงข้อมูลการชำระเงิน */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-gray-600">ยอดที่ต้องชำระ</div>
                <div className="font-semibold">฿{order.netTotal.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">ชำระแล้ว</div>
                <div className="font-semibold">฿{(order.payment?.amount || 0).toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">ยอดคงเหลือ</div>
                <div className="font-semibold text-warning">฿{remainingAmount.toLocaleString()}</div>
              </div>
            </div>

            <div {...getRootProps({ className: `dropzone ${isDragActive ? 'active' : ''}` })}>
              <input {...getInputProps()} />
              <div className='flex items-center flex-col border-dashed border-[1px] rounded-md p-8 cursor-pointer my-2'>
                <Avatar variant='rounded' className='bs-12 is-12'>
                  <i className='tabler-upload' />
                </Avatar>
                <Typography variant='h6' className='mbe-2.5'>
                  {isDragActive ? 'วางไฟล์ที่นี่' : 'กรุณาอัพโหลดสลิปโอนเงิน'}
                </Typography>
              </div>
            </div>

            {file && (
              <List>
                <ListItem className='p-0'>
                  <div className='file-details flex gap-2 justify-between'>
                    <div className='file-preview'>
                      <img src={file.preview} alt={file.name} style={{ width: '38px', height: '38px' }} />
                    </div>
                    <div>
                      <Typography className='file-name'>{file.name}</Typography>
                      <Typography className='file-size' variant='body2'>
                        {file.size > 1024 * 1024
                          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                          : `${(file.size / 1024).toFixed(2)} KB`}
                      </Typography>
                    </div>
                  </div>
                  <IconButton onClick={clearFile} disabled={isUploading}>
                    <i className='tabler-x text-xl' />
                  </IconButton>
                </ListItem>
              </List>
            )}

            <TextField
              fullWidth
              label="จำนวนเงิน"
              value={amount}
              onChange={handleAmountChange}
              type="text"
              size='small'
              disabled={isUploading}
              InputProps={{
                startAdornment: '฿',
              }}
              error={parseFloat(amount) > remainingAmount}
              helperText={parseFloat(amount) > remainingAmount ? 'จำนวนเงินเกินยอดคงเหลือ' : ''}
            />

            {isUploading && <CircularProgress size={24} className="block mx-auto" />}
            {uploadResult && (
              <Typography
                color={uploadResult.includes('เรียบร้อย') || uploadResult.includes('ครบถ้วน') ? 'success' : 'error'}
                className='text-center font-bold'
              >
                {uploadResult}
              </Typography>
            )}
          </div>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button
            onClick={onSubmit}
            variant="contained"
            disabled={isUploading || !file || !amount || parseFloat(amount) > remainingAmount}
          >
            ยืนยัน
          </Button>
          <Button onClick={handleClose} disabled={isUploading}>ยกเลิก</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DialogSlipManual;
