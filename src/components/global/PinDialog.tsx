

import { Dialog, DialogContent, DialogTitle } from "@mui/material";

import PinInput from "./PinInput";
import type { TypeClient } from "@/types/clientTypes";

interface PinDialogProps {
  open: boolean;
  isProtected: boolean;
  user: TypeClient | null;
  onPinSubmit: (pin: string) => Promise<void>;
  error: string | null;
  isVerifying: boolean;
  hasPin: boolean;
}

const PinDialog: React.FC<PinDialogProps> = ({
  open,
  isProtected,
  hasPin,
  onPinSubmit,
  error,
  isVerifying
}) => {
  return (
    <Dialog
      fullScreen
      open={open && isProtected}
      closeAfterTransition={false}
      PaperProps={{
        style: {
          margin: 0,
          maxWidth: '100%',
          width: '100%'
        }
      }}
    >
      <DialogTitle>
        {hasPin ? 'กรุณายืนยัน PIN' : 'กรุณาตั้งค่า PIN'}
      </DialogTitle>
      <DialogContent>
        {hasPin ? 'กรุณาใส่รหัสให้ถูกต้อง' : 'ตั้งรหัสผ่านของคุณ 6 หลัก'}
        <PinInput
          onSubmit={onPinSubmit}
          isVerifying={isVerifying}
          error={error}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PinDialog
