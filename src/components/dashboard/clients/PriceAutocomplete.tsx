// components/PriceAutocomplete.tsx
import React from 'react';

import { Autocomplete, TextField, Chip } from '@mui/material';

import { usePriceLevels } from '@/actions/backend/clients/usePriceLevels';

interface PriceOption {
  id: string;
  name: string;
}

interface Props {
  userId: string;
  currentPrices: string[];
  onPricesChange: (newPrices: string[]) => void;
}

const PriceAutocomplete = ({ userId, currentPrices, onPricesChange }: Props) => {
  const { priceLevels, updatePriceLevels, isLoading } = usePriceLevels(userId);

  const selectedPrices = priceLevels.filter(price =>
    currentPrices.includes(price.id)
  );

  const handleChange = async (_: any, newValue: PriceOption[]) => {
    const newPriceIds = newValue.map(v => v.id);

    try {
      await updatePriceLevels.mutateAsync(newPriceIds);
      onPricesChange(newPriceIds);
    } catch (error) {
      console.error('Failed to update prices:', error);
    }
  };

  if (isLoading) {
    return <TextField
      size="small"
      disabled
      value="กำลังโหลดข้อมูล..."
      sx={{ minWidth: '200px' }}
    />;
  }

  return (
    <Autocomplete
      multiple
      value={selectedPrices}
      options={priceLevels}
      getOptionLabel={(option) => option.name}
      onChange={handleChange}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label="ราคาที่มีสิทธิ์เข้าถึง"
          size="small"
          sx={{ minWidth: '300px' }}
        />
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            label={option.name}
            {...getTagProps({ index })}
            key={option.id}
            size="small"
          />
        ))
      }
    />
  );
};

export default PriceAutocomplete;
