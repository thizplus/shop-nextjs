import { useState } from "react";

import { Alert, Button, TextField, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { useConfigStore } from "@/stores/configStore";

interface PinInputProps {
  onSubmit: (pin: string) => Promise<void>;
  isVerifying: boolean;
  error: string | null;
}

const PinInput: React.FC<PinInputProps> = ({ onSubmit, isVerifying, error }) => {


  const { config } = useConfigStore();
  const [pin, setPin] = useState<string>("");
  const [showPin, setShowPin] = useState(false);

  const handlePinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6);

    setPin(value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (pin.length === 6) {
      await onSubmit(pin);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="relative">
        <TextField
          type={showPin ? "text" : "password"}
          value={pin}
          onChange={handlePinChange}
          placeholder="PIN 6 หลัก"
          inputProps={{
            maxLength: 6,
            pattern: "[0-9]*",
            inputMode: "numeric",
            autoComplete: "new-password"
          }}
          error={!!error}
          disabled={isVerifying}
          fullWidth
          sx={{
            '& input': {
              fontSize: '24px',
              letterSpacing: '0.5em',
              textAlign: 'center'
            },

            // เพิ่ม style สำหรับ focus state
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: config?.displayConfig.primaryColor || '#000000', // สีขอบตอน focus
                borderWidth: '2px'
              },
            },

            // ถ้าต้องการเปลี่ยนสีพื้นหลังตอน focus ด้วย
            '& .MuiInputBase-input:focus': {
              backgroundColor: '#f8f8f8' // หรือสีที่ต้องการ
            }
          }}
        />
        <IconButton
          onClick={() => setShowPin(!showPin)}
          className="absolute right-2 top-1/2 -translate-y-1/2"
          size="large"
        >
          {showPin ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </div>

      {error && <Alert severity="error">{error}</Alert>}

      <Button
        type="submit"
        variant="contained"
        style={{ background: config?.displayConfig.primaryColor || '#000000' }}
        disabled={isVerifying || pin.length !== 6}
        fullWidth
      >
        ยืนยัน PIN
      </Button>
    </form>
  );
};

export default PinInput;
