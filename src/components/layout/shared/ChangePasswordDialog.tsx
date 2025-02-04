// components/dialogs/ChangePasswordDialog.tsx
import { useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';

import { useChangePassword } from '@/actions/user/useChangePassword';



interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordDialog = ({ open, onClose }: ChangePasswordDialogProps) => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');

  const { changePassword, loading } = useChangePassword();

  const username = localStorage.getItem('username');

  const handleSubmit = async () => {
    try {
      setError('');

      if (!username) {
        setError('ไม่พบข้อมูลผู้ใช้');

        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('รหัสผ่านใหม่ไม่ตรงกัน');

        return;
      }

      if (formData.newPassword.length < 6) {
        setError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');

        return;
      }

      await changePassword({
        ...formData,
        username
      });
      onClose();

    } catch (error) {
      setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>เปลี่ยนรหัสผ่าน</DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-4 mt-2">
          <TextField
            fullWidth
            required
            size='small'
            label="รหัสผ่านปัจจุบัน"
            type={showOldPassword ? 'text' : 'password'}
            value={formData.oldPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, oldPassword: e.target.value }))}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowOldPassword(!showOldPassword)} edge="end">
                  <i className={`tabler-eye${showOldPassword ? '-off' : ''}`} />
                </IconButton>
              ),
            }}
          />

          <TextField
            fullWidth
            required
            size='small'
            label="รหัสผ่านใหม่"
            type={showNewPassword ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                  <i className={`tabler-eye${showNewPassword ? '-off' : ''}`} />
                </IconButton>
              ),
            }}
          />

          <TextField
            fullWidth
            required
            size='small'
            label="ยืนยันรหัสผ่านใหม่"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  <i className={`tabler-eye${showConfirmPassword ? '-off' : ''}`} />
                </IconButton>
              ),
            }}
          />

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
        </div>
      </DialogContent>
      <DialogActions className="dialog-actions-dense">
        <Button onClick={onClose} disabled={loading}>ยกเลิก</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.oldPassword || !formData.newPassword || !formData.confirmPassword || loading}
        >
          {loading ? 'กำลังบันทึก...' : 'บันทึก'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog;
