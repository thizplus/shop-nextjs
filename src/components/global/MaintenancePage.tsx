'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';

import LockIcon from '@mui/icons-material/Lock';
import BuildIcon from '@mui/icons-material/Build';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface MaintenancePageProps {
  message?: string;
  storeName?: string;
  isRestrictedUser?: boolean;
  restrictDate?: string;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({
  isRestrictedUser = false,

}) => {
  // แปลงวันที่จำกัดเป็นรูปแบบที่อ่านง่ายถ้ามี


  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          padding: 4,
          textAlign: 'center',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              backgroundColor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isRestrictedUser ? (
              <LockIcon sx={{ fontSize: 50, color: 'warning.main' }} />
            ) : (
              <BuildIcon sx={{ fontSize: 50, color: 'primary.main' }} />
            )}
          </Box>
        </Box>

        <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
          {isRestrictedUser ? 'ไม่สามารถเข้าถึงได้' : 'ปิดปรับปรุงระบบชั่วคราว'}
        </Typography>





        {isRestrictedUser ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
            <AccessTimeIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              กรุณาติดต่อเจ้าหน้าที่เพื่อขอสิทธิ์การเข้าใช้งาน
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            ขออภัยในความไม่สะดวก เรากำลังพัฒนาระบบให้ดียิ่งขึ้น
            <br />
            โปรดกลับมาใหม่ในภายหลัง
          </Typography>
        )}


      </Paper>
    </Container>
  );
};

export default MaintenancePage;
