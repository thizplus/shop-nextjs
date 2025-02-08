// components/dashboard/points/PointSettingManager.tsx
'use client'

import React from 'react';

import {
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  TextField
} from '@mui/material';

import usePointSetting, { useUpdatePointSetting } from '@/actions/backend/point/usePointSetting';



const PointSettingManager = () => {
  const { data: setting, isLoading } = usePointSetting();
  const updateMutation = useUpdatePointSetting();

  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;

  return (
    <Card>
      <CardContent>
        <h2>ตั้งค่าระบบแต้มสะสม</h2>

        <div className="space-y-4 flex">
          <FormControlLabel
            className='my-auto'
            control={
              <Switch
                checked={setting?.isActive || false}
                onChange={(e) =>
                  updateMutation.mutate({ isActive: e.target.checked })
                }

              />
            }
            label="เปิดใช้งานระบบแต้มสะสม"
          />

          <TextField
            label="จำนวนแต้มต่อเงิน 1 บาท"
            type="number"
            size='small'

            value={setting?.pointsPerBaht || 0}
            onChange={(e) =>
              updateMutation.mutate({
                pointsPerBaht: parseFloat(e.target.value)
              })
            }
            InputProps={{
              inputProps: {
                min: 0,
                step: 0.01
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PointSettingManager;
