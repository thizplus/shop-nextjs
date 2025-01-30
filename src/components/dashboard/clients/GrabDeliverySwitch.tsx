// components/dashboard/clients/GrabDeliverySwitch.tsx
import React from 'react';

import { FormControlLabel, Switch } from '@mui/material';

import { useGrabDelivery } from '@/actions/backend/clients/useGrabDelivery';

interface GrabDeliverySwitchProps {
  userId: string;
  enabled: boolean;
}

const GrabDeliverySwitch = ({ userId, enabled }: GrabDeliverySwitchProps) => {
  const { updateGrabDelivery } = useGrabDelivery(userId);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await updateGrabDelivery.mutateAsync(event.target.checked);
    } catch (error) {
      console.error('Failed to update grab delivery status:', error);
    }
  };

  return (
    <FormControlLabel
      control={
        <Switch
          checked={enabled}
          onChange={handleChange}
          disabled={updateGrabDelivery.isPending}
        />
      }
      label="Grab Delivery"
    />
  );
};

export default GrabDeliverySwitch;
