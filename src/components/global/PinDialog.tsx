// PinDialog.tsx
import { Dialog, DialogContent } from "@mui/material";

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
          maxWidth: 430,
          width: '100%'
        }
      }}
    >

      <DialogContent>
        <div className="h-full flex">
          <div className="p-4 leading-none text-center m-auto">
            <p className="text-xl font-bold">     {hasPin ? 'กรุณายืนยัน PIN' : 'กรุณาตั้งค่า PIN'}</p>
            <p className="mb-4 text-center">
              {hasPin ? 'กรุณาใส่รหัสให้ถูกต้อง' : 'ตั้งรหัสผ่านของคุณ 6 หลัก'}
            </p>
            <PinInput
              onSubmit={onPinSubmit}
              isVerifying={isVerifying}
              error={error}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PinDialog;
