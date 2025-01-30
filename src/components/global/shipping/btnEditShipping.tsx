import React, { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import EditIcon from '@mui/icons-material/Edit';

import { updateShippingAddress } from '@/actions/client/shipping';
import type { ShippingAddress } from '@/types/shippingTypes';

interface BtnEditShippingProps {
  address: ShippingAddress;
  onAddressUpdated: () => void;
}

const BtnEditShipping: React.FC<BtnEditShippingProps> = ({ address, onAddressUpdated }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [updatedAddress, setUpdatedAddress] = useState<ShippingAddress>(address);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setUpdatedAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async () => {
    try {
      await updateShippingAddress({ addressId: address._id, address: updatedAddress });
      onAddressUpdated();
      handleClose();
    } catch (error) {
      console.error('Error updating shipping address:', error);
    }
  };

  return (
    <>
      <Button variant='text' size='small' className="p-0 flex justify-start" color='warning' startIcon={<EditIcon />} onClick={handleClickOpen}>
        แก้ไข
      </Button>

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
        <DialogTitle id='alert-dialog-title'>กรุณาแก้ไขที่อยู่ของคุณ</DialogTitle>
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
            value={updatedAddress.cusName}
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
            value={updatedAddress.cusTel}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="addressNo"
            label="เลขที่/หมู่บ้าน"
            type="text"
            fullWidth
            variant="outlined"
            size='small'
            value={updatedAddress.addressNo}
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
            value={updatedAddress.district}
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
            value={updatedAddress.amphoe}
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
            value={updatedAddress.province}
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
            value={updatedAddress.zipcode}
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
            value={updatedAddress.location}
            onChange={handleInputChange}
          />

        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleSaveAddress} variant='contained'>บันทึก</Button>
          <Button onClick={handleClose}>ยกเลิก</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BtnEditShipping;
