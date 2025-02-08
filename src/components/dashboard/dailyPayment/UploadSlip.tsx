// components/dashboard/dailyPayment/UploadSlip.tsx
import React, { useState, useCallback, useEffect } from 'react';

import List from '@mui/material/List';
import Avatar from '@mui/material/Avatar';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useDropzone } from 'react-dropzone';


import type { IDailyPayment } from '@/types/dailyPayment';
import { usePaymentSlip } from '@/actions/backend/dailyPayment/usePaymentSlip';

type FileProp = File & {
  preview: string;
};

interface UploadSlipProps {
  payment: IDailyPayment;
  onPaymentUpdate: (newPayment: IDailyPayment['payment']) => void;
  currentPayment: IDailyPayment['payment'];
  onExpire?: () => void;
}

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => void;
}

const UploadSlip: React.FC<UploadSlipProps> = ({ payment, onPaymentUpdate, currentPayment, onExpire }) => {
  const [file, setFile] = useState<FileProp | null>(null);

  const { isVerifying, verificationResult, verifySlip } = usePaymentSlip({
    payment,
    currentPayment,
    onPaymentUpdate
  });



  const clearFile = useCallback(() => {
    if (file) {
      URL.revokeObjectURL(file.preview);
    }

    setFile(null);
  }, [file]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFile = Object.assign(acceptedFiles[0], {
        preview: URL.createObjectURL(acceptedFiles[0])
      });

      setFile(newFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg']
    },
    maxFiles: 1,
    multiple: false
  });


  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedVerifySlip = useCallback(
    debounce(async (fileToVerify: File) => {
      const success = await verifySlip(fileToVerify);

      if (success) {
        clearFile();
      }
    }, 300),
    [verifySlip, clearFile]
  );

  useEffect(() => {
    if (file) {
      debouncedVerifySlip(file);
    }
  }, [file, debouncedVerifySlip]);


  useEffect(() => {
    const expireTime = new Date(payment.expire).getTime();

    if (Date.now() >= expireTime) {
      onExpire?.();
    }
  }, [payment.expire, onExpire]);

  return (
    <>
      <div {...getRootProps({ className: `dropzone ${isDragActive ? 'active' : ''}` })}>
        <input {...getInputProps()} />
        <div className='flex items-center flex-col border-dashed border-[1px] rounded-md px-8 py-4 cursor-pointer my-2'>


          <div className='text-center bg-red-600 p-2 rounded-sm text-white'>
            <p className='text-sm'>❌ ไม่รับ ธ.กรุงเทพฯ แนบสลิปไม่ได้ ❌</p>
          </div>

          <Avatar variant='rounded' className='bs-12 is-12 my-2'>
            <i className='tabler-upload' />
          </Avatar>

          <Typography variant='h6' className='mb-0 leading-none'>
            {isDragActive ? 'วางไฟล์ที่นี่' : 'อัพโหลดสลิปโอนเงิน'}
          </Typography>


          <p className='text-xs text-center mt-2  bg-gray-100 p-2 rounded-sm'>
            สามารถแนบสลิปได้ไม่จำกัดจนกว่าจะครบยอด
          </p>

          <p className='text-xs text-center mt-2'>
            สลิปที่ไม่มี QR CODE ไม่สามารถตรวจสอบยอดชำระได้ กรุณาส่งหลักฐานให้แอดมิน
          </p>

        </div>
      </div>

      {file && (
        <List>
          <ListItem className='p-0'>
            <div className='file-details flex gap-2 justify-between items-center w-full'>
              <div className='flex gap-2 items-center'>
                <div className='file-preview'>
                  <img src={file.preview} alt={file.name} style={{ width: '38px', height: '38px' }}
                    className="rounded-sm" />
                </div>
                <div>
                  <Typography className='file-name'>{file.name}</Typography>
                  <Typography className='file-size' variant='body2'>
                    {file.size > 1024 * 1024
                      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                      : `${(file.size / 1024).toFixed(2)} KB`}
                  </Typography>
                </div>
              </div>
              <IconButton onClick={clearFile} disabled={isVerifying}>
                <i className='tabler-x text-xl' />
              </IconButton>
            </div>
          </ListItem>
        </List>
      )}

      {isVerifying && (
        <div className='flex justify-center my-2'>
          <CircularProgress size={24} />
        </div>
      )}

      {verificationResult && (
        <Typography
          color={verificationResult.includes('สำเร็จ') ? 'success' : 'error'}
          className='text-center mt-2'
        >
          {verificationResult}
        </Typography>
      )}
    </>
  );
};

export default UploadSlip;
