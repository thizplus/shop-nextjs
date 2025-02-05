import React, { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

import { Alert, Snackbar } from '@mui/material';

import { addShippingAddress } from '@/actions/client/shipping';

interface BtnCreateShippingProps {
  onAddressAdded: () => void;
}

const BtnCreateShipping: React.FC<BtnCreateShippingProps> = ({ onAddressAdded }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<string>('');

  const [newAddress, setNewAddress] = useState({
    cusName: '',
    cusTel: '',
    addressNo: '',
    district: '',
    amphoe: '',
    province: '',
    zipcode: '',
    location: ''
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === 'cusTel') {
      // อนุญาตให้กรอกได้เฉพาะตัวเลข
      const numbersOnly = value.replace(/[^0-9]/g, '');

      // จำกัดความยาวไม่เกิน 10 หลัก
      const truncated = numbersOnly.slice(0, 10);

      // เช็คความยาวเพื่อแสดง error
      if (truncated.length !== 10 && truncated.length > 0) {
        setPhoneError('กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก');
      } else {
        setPhoneError('');
      }

      setNewAddress(prev => ({ ...prev, [name]: truncated }));
    } else {
      setNewAddress(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateShipping = async () => {
    // ตรวจสอบว่ากรอกครบเมื่อกดปุ่ม "เพิ่มที่อยู่"
    if (
      newAddress.cusName.trim() === '' ||
      newAddress.cusTel.trim() === '' ||
      newAddress.addressNo.trim() === '' ||
      newAddress.district.trim() === '' ||
      newAddress.amphoe.trim() === '' ||
      newAddress.province.trim() === '' ||
      newAddress.zipcode.trim() === ''
    ) {

      setSnackbar({
        open: true,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        severity: 'warning'
      });

      return;
    }

    try {
      await addShippingAddress(newAddress);
      onAddressAdded();
      handleClose();
    } catch (error) {
      console.error('Error adding shipping address:', error);
    }
  };

  return (
    <>
      <p className="underline cursor-pointer flex" onClick={handleClickOpen}>
        <i className='tabler-plus' /> เพิ่มที่อยู่ใหม่
      </p>

      <Dialog
        open={open}
        maxWidth='xs'
        fullWidth
        disableEscapeKeyDown
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}
      >
        <DialogTitle id='alert-dialog-title'>เพิ่มที่อยู่จัดส่งใหม่</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="cusName"
            label="ชื่อผู้รับ"
            type="text"
            fullWidth
            variant="outlined"
            size='small'
            value={newAddress.cusName}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="cusTel"
            label="เบอร์โทรศัพท์"
            type="tel"
            fullWidth
            variant="outlined"
            size='small'
            value={newAddress.cusTel}
            onChange={handleInputChange}
            error={Boolean(phoneError)}
            helperText={phoneError}
            inputProps={{
              maxLength: 10,
              pattern: '[0-9]*'
            }}
          />
          <TextField
            margin="dense"
            name="addressNo"
            label="เลขที่/หมู่บ้าน"
            type="text"
            fullWidth
            variant="outlined"
            size='small'
            value={newAddress.addressNo}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="district"
            label="ตำบล/แขวง"
            type="text"
            fullWidth
            variant="outlined"
            size='small'
            value={newAddress.district}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="amphoe"
            label="อำเภอ/เขต"
            type="text"
            fullWidth
            variant="outlined"
            size='small'
            value={newAddress.amphoe}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="province"
            label="จังหวัด"
            type="text"
            fullWidth
            variant="outlined"
            size='small'
            value={newAddress.province}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="zipcode"
            label="รหัสไปรษณีย์"
            type="text"
            fullWidth
            variant="outlined"
            size='small'
            value={newAddress.zipcode}
            onChange={handleInputChange}
          />

          <TextField
            margin="dense"
            name="location"
            label="ระบุตำแหน่ง"
            type="text"
            fullWidth
            variant="outlined"
            size='small'
            value={newAddress.location}
            onChange={handleInputChange}
          />

        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button
            onClick={handleCreateShipping}
            variant='contained'
            disabled={
              newAddress.cusName.trim() === '' ||
              newAddress.cusTel.trim().length !== 10 ||  // เพิ่มเงื่อนไขนี้
              newAddress.addressNo.trim() === '' ||
              newAddress.district.trim() === '' ||
              newAddress.amphoe.trim() === '' ||
              newAddress.province.trim() === '' ||
              newAddress.zipcode.trim() === ''
            }
          >
            เพิ่มที่อยู่
          </Button>
          <Button onClick={handleClose}>ยกเลิก</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            boxShadow: 3,
            borderRadius: 2
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BtnCreateShipping;
