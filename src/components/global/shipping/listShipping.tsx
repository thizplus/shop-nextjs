import React, { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

import { getShippingAddresses, setDefaultAddress } from '@/actions/client/shipping';
import type { ShippingAddress } from '@/types/shippingTypes';
import { useShippingStore } from '@/stores/shippingStore';
import BtnEditShipping from './btnEditShipping';
import BtnDeleteShipping from './btnDeleteShipping';
import BtnCreateShipping from './btnCreateShipping';

const ListsShipping: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const { selectedAddress, setSelectedAddress } = useShippingStore();

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAddresses = async (): Promise<void> => {
    try {
      const fetchedAddresses = await getShippingAddresses();

      setAddresses(fetchedAddresses);

      const defaultAddress = fetchedAddresses.find(addr => addr.isDefault);

      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (fetchedAddresses.length > 0) {
        setSelectedAddress(fetchedAddresses[0]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  console.log('addresses', addresses)

  const handleClickOpen = (): void => setOpen(true);
  const handleClose = (): void => setOpen(false);

  const handleChoose = async (): Promise<void> => {
    try {
      if (selectedAddress) {
        await setDefaultAddress(selectedAddress._id);
        await fetchAddresses(); // Refresh the list after setting default
      }

      handleClose();
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const selected = addresses.find(addr => addr._id === event.target.value);

    if (selected) {
      setSelectedAddress(selected);
    }
  };

  const handleAddressUpdated = (): Promise<void> => {
    return fetchAddresses();
  };

  const handleAddressDeleted = (): Promise<void> => {
    return fetchAddresses();
  };

  return (
    <>
      <p className="underline text-sm cursor-pointer flex" onClick={handleClickOpen}>
        <i className='tabler-truck-delivery text-lg mr-1' /> ตั้งค่าการจัดส่ง
      </p>

      <Dialog
        open={open}
        disableEscapeKeyDown
        fullWidth
        maxWidth="xs"
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}

      >
        <DialogTitle id='alert-dialog-title'>ที่อยู่จัดส่งทั้งหมด</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="shipping-address"
              name="shipping-address"
              value={selectedAddress?._id || ''}
              onChange={handleAddressChange}
            >
              {addresses.map((address) => (
                <FormControlLabel
                  key={address._id}
                  value={address._id}
                  control={<Radio />}
                  className='border p-2 rounded-md mb-2 cursor-pointer'
                  label={


                    <div className='block leading-none'>

                      <div className="py-2 leading-none flex gap-2">


                        <div className='leading-none my-auto'>
                          <p className='text-bold flex gap-2 font-bold text-sm leading-none'> {address.cusName} {address.cusTel}</p>
                          <p className='leading-none text-sm'>{`${address.addressNo} ${address.district} ${address.amphoe} ${address.province} ${address.zipcode}`}</p>
                          {address.location &&
                            <p className='text-bold flex gap-2 font-bold text-sm leading-none'>ตำแหน่ง : {address.location}</p>
                          }
                        </div>
                      </div>
                      <div className='flex gap-2 mt-2'>
                        <BtnEditShipping address={address} onAddressUpdated={handleAddressUpdated} />
                        <BtnDeleteShipping address={address} onAddressDeleted={handleAddressDeleted} />
                      </div>
                    </div>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>
          <BtnCreateShipping onAddressAdded={fetchAddresses} />
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleChoose} variant="contained" size='small' color="primary">ใช้ที่อยู่นี้</Button>
          <Button onClick={handleClose} size='small'>ยกเลิก</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ListsShipping;
