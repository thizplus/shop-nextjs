// SearchInput.tsx
import { memo, useState, useRef, useEffect } from 'react';

import { TextField } from '@mui/material';

interface SearchInputProps {
  onSearch: (value: string) => void;
  onReset: () => void;
  defaultValue?: string;
}

const SearchInput = memo(({ onSearch, onReset, defaultValue = '' }: SearchInputProps) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Effect สำหรับ focus input หลังจาก search
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [defaultValue]); // re-focus เมื่อ defaultValue เปลี่ยน (หลังจาก search)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(inputValue);

      // หลัง enter ก็ focus ที่ input ด้วย
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } else if (e.key === 'Escape') {
      setInputValue('');
      onReset();
    }
  };

  return (
    <TextField
      inputRef={inputRef}
      label="ค้นหาจาก SKU หรือ ชื่อสินค้า"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
      size="small"
      sx={{
        '& .MuiInputBase-root': {
          height: '40px',
        },
        '& .MuiInputLabel-root': {
          transform: 'translate(14px, 8px) scale(1)',
          '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -6px) scale(0.75)',
          },
        },
      }}
    />
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
