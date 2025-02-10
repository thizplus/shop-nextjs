import React, { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import EditIcon from '@mui/icons-material/Edit';
import { Alert, Snackbar, Box, Paper, Typography } from '@mui/material';

import { updateShippingAddress } from '@/actions/client/shipping';
import type { ShippingAddress } from '@/types/shippingTypes';
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

interface BtnEditShippingProps {
  address: ShippingAddress;
  onAddressUpdated: () => void;
}

const BtnEditShipping: React.FC<BtnEditShippingProps> = ({ address, onAddressUpdated }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<string>('');
  const [zipcodeError, setZipcodeError] = useState<string>('');
  const [searchResults, setSearchResults] = useState<AddressData[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [updatedAddress, setUpdatedAddress] = useState<ShippingAddress>(address);

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

  // ค้นหาที่อยู่จากรหัสไปรษณีย์
  const handleZipcodeSearch = (value: string) => {
    setUpdatedAddress(prev => ({ ...prev, zipcode: value }));

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
  const handleAddressSelect = (selectedAddress: AddressData) => {
    setUpdatedAddress(prev => ({
      ...prev,
      district: selectedAddress.district,
      amphoe: selectedAddress.amphoe,
      province: selectedAddress.province,
      zipcode: selectedAddress.zipcode.toString(),
      district_code: selectedAddress.district_code,
      amphoe_code: selectedAddress.amphoe_code,
      province_code: selectedAddress.province_code
    }));

    // เพิ่มบรรทัดนี้เพื่อ reset error state
    setZipcodeError('');
    setShowResults(false);
  };

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setShowResults(false);
    setUpdatedAddress(address);
    setPhoneError('');
    setZipcodeError('');
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

      setUpdatedAddress(prev => ({ ...prev, [name]: truncated }));
    } else if (name === 'zipcode') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      const truncated = numbersOnly.slice(0, 5);

      if (truncated.length !== 5 && truncated.length > 0) {
        setZipcodeError('กรุณากรอกรหัสไปรษณีย์ให้ครบ 5 หลัก');
      } else {
        setZipcodeError('');
      }

      setUpdatedAddress(prev => ({ ...prev, [name]: truncated }));
      handleZipcodeSearch(truncated);
    } else {
      setUpdatedAddress(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveAddress = async () => {
    // ตรวจสอบข้อมูลก่อนบันทึก
    if (
      !updatedAddress.cusName ||
      !updatedAddress.cusTel ||
      !updatedAddress.addressNo ||
      !updatedAddress.district ||
      !updatedAddress.amphoe ||
      !updatedAddress.province ||
      !updatedAddress.zipcode ||
      updatedAddress.cusTel.length !== 10 ||
      updatedAddress.zipcode.length !== 5
    ) {
      setSnackbar({
        open: true,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง',
        severity: 'warning'
      });

      return;
    }

    try {
      await updateShippingAddress({ addressId: address._id, address: updatedAddress });
      onAddressUpdated();
      handleClose();
    } catch (error) {
      console.error('Error updating shipping address:', error);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการแก้ไขที่อยู่',
        severity: 'error'
      });
    }
  };

  return (
    <>
      <Button
        variant='text'
        size='small'
        className="p-0 flex justify-start"
        color='warning'
        startIcon={<EditIcon />}
        onClick={handleClickOpen}
      >
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
            error={Boolean(phoneError)}
            helperText={phoneError}
            inputProps={{
              maxLength: 10,
              pattern: '[0-9]*',
              inputMode: 'numeric'
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
            value={updatedAddress.addressNo}
            onChange={handleInputChange}
          />

          <Box sx={{ position: 'relative', mb: 2 }}>
            <TextField
              margin="dense"
              name="zipcode"
              label="รหัสไปรษณีย์"
              type="tel"
              fullWidth
              variant="outlined"
              size='small'
              value={updatedAddress.zipcode}
              onChange={handleInputChange}
              error={Boolean(zipcodeError)}
              helperText={zipcodeError}
              placeholder="ระบุรหัสไปรษณีย์"
              inputProps={{
                maxLength: 5,
                pattern: '[0-9]*',
                inputMode: 'numeric'
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
            value={updatedAddress.district}
            disabled
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
            disabled
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
            disabled
          />

          <TextField
            margin="dense"
            name="location"
            label="ระบุตำแหน่ง (ถ้ามี)"
            type="text"
            fullWidth
            variant="outlined"
            size='small'
            value={updatedAddress.location || ''}
            onChange={handleInputChange}
          />
        </DialogContent>

        <DialogActions className='dialog-actions-dense'>
          <Button
            onClick={handleSaveAddress}
            variant='contained'
            disabled={
              !updatedAddress.cusName ||
              !updatedAddress.cusTel ||
              !updatedAddress.addressNo ||
              !updatedAddress.district ||
              !updatedAddress.amphoe ||
              !updatedAddress.province ||
              !updatedAddress.zipcode ||
              updatedAddress.cusTel.length !== 10 ||
              updatedAddress.zipcode.length !== 5
            }
          >
            บันทึก
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

export default BtnEditShipping;
