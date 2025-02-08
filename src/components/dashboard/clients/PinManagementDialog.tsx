import React, { useState, useEffect } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Box
} from '@mui/material';

import { useClientPin } from '@/actions/backend/clients/useClientPin';



interface PinManagementDialogProps {
  userId: string;
  displayName: string;
}

const PinManagementDialog: React.FC<PinManagementDialogProps> = ({
  userId,
  displayName
}) => {
  const [open, setOpen] = useState(false);
  const [newPin, setNewPin] = useState('');



  const {
    pinData,
    isPinLoading,
    updatePin,
    isUpdating,
    resetUpdateState
  } = useClientPin(userId);



  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setNewPin('');
      resetUpdateState();
    }
  }, [open, resetUpdateState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPin.trim() && newPin.length >= 4 && newPin.length <= 6) {
      updatePin(
        { userId, pin: newPin },
        {
          onSuccess: () => {
            setNewPin('');
            setOpen(false);
          }
        }
      );
    }
  };


  const isValidPin = newPin.length === 6 && /^\d{6}$/.test(newPin);

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        color='error'
        onClick={() => setOpen(true)}
        startIcon={<i className="tabler-key" />}
      >
        จัดการ PIN
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>จัดการ PIN - {displayName}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <p >
              PIN ปัจจุบัน :

              {isPinLoading ? (
                <CircularProgress size={20} />
              ) : (

                <>
                  {pinData?.pin || 'ไม่มี PIN'}
                </>

              )}
            </p>

          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              label="PIN ใหม่"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))} // เพิ่มการกรองให้รับแค่ตัวเลขและจำกัด 6 หลัก
              fullWidth
              type="text"
              inputProps={{
                maxLength: 6,
                pattern: '[0-9]*',
                inputMode: 'numeric' // เพิ่มเพื่อให้แสดงคีย์บอร์ดตัวเลขในมือถือ
              }}
              helperText={`กรุณากรอกรหัส PIN 6 หลัก ${newPin.length}/6`}
              error={newPin.length > 0 && !isValidPin}
              disabled={isUpdating}
            />
          </form>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            disabled={isUpdating}
          >
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isValidPin || isUpdating}
          >
            {isUpdating ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PinManagementDialog;
