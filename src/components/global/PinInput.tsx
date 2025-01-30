import { useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

import { Alert, Button } from "@mui/material";

interface PinInputProps {
  onSubmit: (pin: string) => Promise<void>;
  isVerifying: boolean;
  error: string | null;
}

const PinInput: React.FC<PinInputProps> = ({ onSubmit, isVerifying, error }) => {
  const [inputValues, setInputValues] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = event.target;
    const newValue = value.replace(/\D/g, '').slice(0, 1);
    const newInputValues = [...inputValues];

    newInputValues[index] = newValue;
    setInputValues(newInputValues);

    if (newValue !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace') {
      if (inputValues[index] === '' && index > 0) {
        const newInputValues = [...inputValues];

        newInputValues[index - 1] = '';
        setInputValues(newInputValues);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newInputValues = [...inputValues];

        newInputValues[index] = '';
        setInputValues(newInputValues);
      }
    }
  };

  const handlePinSubmit = async () => {
    const pin = inputValues.join("");

    if (pin.length === 6) {
      await onSubmit(pin);
    }
  };

  const setInputRef = (el: HTMLInputElement | null, index: number) => {
    if (el) {
      inputRefs.current[index] = el;
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-6 gap-2">
        {inputValues.map((value, index) => (
          <input
            key={index}
            ref={(el) => setInputRef(el, index)}
            type="text"
            maxLength={1}
            value={value}
            onChange={(e) => handleInputChange(e, index)}
            onKeyDown={(e) => handleInputKeyDown(e, index)}
            className="w-full text-center border rounded p-2"
          />
        ))}
      </div>
      {error && <Alert severity="error" className="mt-4">{error}</Alert>}
      <Button
        onClick={handlePinSubmit}
        disabled={isVerifying || inputValues.join("").length !== 6}
        variant="contained"
        fullWidth
        className="mt-4"
      >
        ยืนยัน PIN
      </Button>
    </div>
  );
};

export default PinInput;
