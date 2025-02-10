import React, { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { Alert, Snackbar, Box, Paper, Typography } from '@mui/material';

import { addShippingAddress } from '@/actions/client/shipping';
import thaiAddressDB from '@components/global/shippingDB.json';

interface AddressData {
  district: string;
  amphoe: string;
  province: string;
  zipcode: number;
  district_code: number;
  amphoe_code: number;
  province_code: number;
}

interface BtnCreateShippingProps {
  onAddressAdded: () => void;
}

interface NewAddress {
  cusName: string;
  cusTel: string;
  addressNo: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
  location: string;
  district_code: number;
  amphoe_code: number;
  province_code: number;
}

const BtnCreateShipping: React.FC<BtnCreateShippingProps> = ({ onAddressAdded }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<string>('');
  const [zipcodeError, setZipcodeError] = useState<string>('');
  const [searchResults, setSearchResults] = useState<AddressData[]>([]);
  const [showResults, setShowResults] = useState(false);

  const [newAddress, setNewAddress] = useState<NewAddress>({
    cusName: '',
    cusTel: '',
    addressNo: '',
    district: '',
    amphoe: '',
    province: '',
    zipcode: '',
    location: '',
    district_code: 0,
    amphoe_code: 0,
    province_code: 0
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

  // ค้นหาที่อยู่จากรหัสไปรษณีย์
  const handleZipcodeSearch = (value: string) => {
    setNewAddress(prev => ({ ...prev, zipcode: value }));

    if (value.length >= 2) {
      const filteredResults = thaiAddressDB
        .filter(item => item.zipcode.toString().startsWith(value))
        .map(item => ({
          district: item.district,
          amphoe: item.amphoe,
          province: item.province,
          zipcode: Number(item.zipcode),
          district_code: Number(item.district_code),
          amphoe_code: Number(item.amphoe_code),
          province_code: Number(item.province_code)
        }));

      setSearchResults(filteredResults);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // เลือกที่อยู่จากผลการค้นหา
  const handleAddressSelect = (address: AddressData) => {
    setNewAddress(prev => ({
      ...prev,
      district: address.district,
      amphoe: address.amphoe,
      province: address.province,
      zipcode: address.zipcode.toString(),
      district_code: Number(address.district_code),
      amphoe_code: Number(address.amphoe_code),
      province_code: Number(address.province_code)
    }));
    setZipcodeError('');
    setShowResults(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setShowResults(false);
    setNewAddress({
      cusName: '',
      cusTel: '',
      addressNo: '',
      district: '',
      amphoe: '',
      province: '',
      zipcode: '',
      location: '',
      district_code: 0,
      amphoe_code: 0,
      province_code: 0
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (name === 'cusTel') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      const truncated = numbersOnly.slice(0, 10);

      if (truncated.length !== 10 && truncated.length > 0) {
        setPhoneError('กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก');
      } else {
        setPhoneError('');
      }

      setNewAddress(prev => ({ ...prev, [name]: truncated }));
    } else if (name === 'zipcode') {
      const numbersOnly = value.replace(/[^0-9]/g, ''); // อนุญาตให้กรอกได้เฉพาะตัวเลข
      const truncated = numbersOnly.slice(0, 5);        // จำกัดความยาวไม่เกิน 5 หลัก

      if (truncated.length !== 5 && truncated.length > 0) {
        setZipcodeError('กรุณากรอกรหัสไปรษณีย์ให้ครบ 5 หลัก');
      } else {
        setZipcodeError('');
      }

      setNewAddress(prev => ({ ...prev, [name]: truncated }));
      handleZipcodeSearch(truncated);
    } else {
      setNewAddress(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateShipping = async () => {
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
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการบันทึกที่อยู่',
        severity: 'error'
      });
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

          <Box sx={{ position: 'relative', mb: 2 }}>
            <TextField
              margin="dense"
              name="zipcode"
              label="รหัสไปรษณีย์"
              type="tel"  // เปลี่ยนเป็น tel เพื่อให้มือถือแสดงแป้นพิมพ์ตัวเลข
              fullWidth
              variant="outlined"
              size='small'
              value={newAddress.zipcode}
              onChange={handleInputChange}
              placeholder="ระบุรหัสไปรษณีย์"
              error={Boolean(zipcodeError)}
              helperText={zipcodeError}
              inputProps={{
                maxLength: 5,
                pattern: '[0-9]*',  // บังคับให้กรอกได้แค่ตัวเลข
                inputMode: 'numeric' // แสดงแป้นพิมพ์ตัวเลขบนมือถือ
              }}
            />
            {showResults && searchResults.length > 0 && (
              <Paper
                sx={{
                  position: 'absolute',
                  width: '100%',
                  maxHeight: 200,
                  overflow: 'auto',
                  zIndex: 1000,
                  mt: 0.5,
                  boxShadow: 3
                }}
              >
                {searchResults.map((result, index) => (
                  <Box key={`${result.district_code}-${index}`}>
                    <Box
                      sx={{
                        p: 1.5,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                      onClick={() => handleAddressSelect(result)}
                    >
                      <Typography variant="body2">
                        {result.district} » {result.amphoe} » {result.province} » {result.zipcode}
                      </Typography>
                    </Box>
                    {index < searchResults.length - 1 && (
                      <Box sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }} />
                    )}
                  </Box>
                ))}
              </Paper>
            )}
          </Box>

          <TextField
            margin="dense"
            name="district"
            label="ตำบล/แขวง"
            type="text"
            fullWidth
            variant="outlined"
            size='small'
            value={newAddress.district}

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

          />

          <TextField
            margin="dense"
            name="location"
            label="ระบุตำแหน่ง (ถ้ามี)"
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
              newAddress.cusTel.trim().length !== 10 ||
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
