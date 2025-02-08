import React, { useState, useCallback, useEffect } from 'react';


import MenuItem from '@mui/material/MenuItem';

import CustomTextField from '@core/components/mui/TextField';
import type { TypePriceList } from '@/types/priceListTypes';


type propsSelectData = {
  items: TypePriceList[];
  onChange?: (value: string) => void;
  value?: string;
};

const SelectData: React.FC<propsSelectData> = ({ items, onChange, value: propValue }) => {
  const [localValue, setLocalValue] = useState<string>(propValue || '');

  useEffect(() => {
    if (propValue !== undefined) {
      setLocalValue(propValue);
    }
  }, [propValue]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    setLocalValue(newValue);
    console.log('Selected value:', newValue);
    onChange && onChange(newValue);
  }, [onChange]);

  return (
    <CustomTextField
      select
      fullWidth
      value={localValue}
      onChange={handleChange}
      id="price-select"
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
    >
      <MenuItem value="">
        <em>ไม่คัดลอก</em>
      </MenuItem>
      {items.map((item) => (
        <MenuItem key={item._id.toString()} value={item.priceId}>
          {item.priceName}
        </MenuItem>
      ))}
    </CustomTextField>
  );
};

export default SelectData;
