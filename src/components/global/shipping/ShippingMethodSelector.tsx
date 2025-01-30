// components/dashboard/shipping/ShippingMethodSelector.tsx
import React from 'react';

import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Box } from '@mui/material';

import { useShippingMethodStore } from '@/stores/shippingMethodStore';

interface ShippingMethodSelectorProps {
  enableGrabDelivery: boolean;
}

const ShippingMethodSelector: React.FC<ShippingMethodSelectorProps> = ({ enableGrabDelivery }) => {
  const { method, setMethod } = useShippingMethodStore();

  if (!enableGrabDelivery) {
    return null;
  }

  return (
    <FormControl component="fieldset" className="mb-4">
      <FormLabel component="legend" className="text-sm whitespace-nowrap">
        เลือกวิธีการจัดส่ง:
      </FormLabel>
      <Box className="flex items-center gap-4">

        <RadioGroup
          row
          value={method}
          onChange={(e) => setMethod(e.target.value as 'standard' | 'grab')}
          className="mt-0"

        >
          <FormControlLabel
            value="standard"
            control={<Radio size="small" color='success' />}
            label="จัดส่งมาตรฐาน"
            className="mr-4"

          />
          <FormControlLabel
            value="grab"
            control={<Radio size="small" color='success' />}
            label="จัดส่งผ่าน Grab"
          />
        </RadioGroup>
      </Box>
    </FormControl>
  );
};

export default ShippingMethodSelector;
