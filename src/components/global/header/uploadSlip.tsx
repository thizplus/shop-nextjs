import React, { useState, useCallback, useEffect, useRef } from 'react';

import List from '@mui/material/List';
import Avatar from '@mui/material/Avatar';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useDropzone } from 'react-dropzone';

import CloseIcon from '@mui/icons-material/Close';

import { Chip } from '@mui/material';

import type { TypeOrder } from '@/types/orderTypes';
import actionVerifySlip from '@/actions/backend/slipOK/verifySlip';
import CountdownTimer from './CountdownTimer';

type FileProp = File & {
  preview: string;
};

type propsOrder = {
  order: TypeOrder;
  onPaymentUpdate: (newPayment: TypeOrder['payment']) => void;
  currentPayment: TypeOrder['payment'];
  onExpire?: () => void; // เพิ่ม prop นี้
};

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

const UploadSlip: React.FC<propsOrder> = ({ order, onPaymentUpdate, currentPayment, onExpire }) => {
  const [file, setFile] = useState<FileProp | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const verifyingRef = useRef(false);

  const clearFile = useCallback(() => {
    if (file) {
      URL.revokeObjectURL(file.preview);
    }

    setFile(null);
    setVerificationResult(null);
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

  const verifySlip = useCallback(async (fileToVerify: File) => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setIsVerifying(true);
    setVerificationResult(null);

    console.log('Starting slip verification for file:', fileToVerify.name);

    try {
      const result = await actionVerifySlip({
        file: fileToVerify,
        amount: order.netTotal,
        orderId: order.orderId
      });

      console.log('API Response:', result);

      if (result.status === 'error') {
        console.log('Error from API:', result.message);
        setVerificationResult(result.message || 'เกิดข้อผิดพลาดในการตรวจสอบสลิป');
      } else if (result.status === 'success' && result.verifyResult) {
        console.log('Success from API:', result.verifyResult);
        const newAmount = currentPayment.amount + result.verifyResult.amount;

        const newPayment = {
          ...currentPayment,
          amount: newAmount,
          slip: [...currentPayment.slip, {
            url: result.slipUrl || '',
            amount: result.verifyResult.amount,
            uploadedAt: new Date()
          }]
        };

        console.log('Updated payment:', newPayment);
        onPaymentUpdate(newPayment);
        clearFile();
        setVerificationResult(`ตรวจสอบสลิปเรียบร้อยแล้ว ยอดเงิน ${result.verifyResult.amount} ฿`);
      } else {
        console.log('Unexpected API response:', result);
        setVerificationResult('ไม่สามารถตรวจสอบสลิปได้ กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error) {
      console.error('Error in verifySlip:', error);

      if (error instanceof Error) {
        setVerificationResult(error.message);
      } else {
        setVerificationResult('เกิดข้อผิดพลาดในการตรวจสอบสลิป');
      }
    } finally {
      setIsVerifying(false);
      verifyingRef.current = false;
    }
  }, [order, currentPayment, onPaymentUpdate, clearFile]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedVerifySlip = useCallback(
    debounce((fileToVerify: File) => verifySlip(fileToVerify), 300),
    [verifySlip]
  );

  useEffect(() => {
    if (file) {
      console.log('File changed, triggering verification');
      debouncedVerifySlip(file);
    }
  }, [file, debouncedVerifySlip]);

  useEffect(() => {
    const expireTime = new Date(order.expire).getTime();

    if (Date.now() >= expireTime) {
      onExpire?.();  // เรียก callback เมื่อเริ่มต้นถ้าหมดเวลาแล้ว
    }
  }, [order.expire, onExpire]);

  return (
    <>
      <div {...getRootProps({ className: `dropzone ${isDragActive ? 'active' : ''}` })}>
        <input {...getInputProps()} />

        <Chip icon={<CloseIcon />} className='w-full mt-2' color='error' label="ไม่รับ ธ.กรุงเทพฯ แนบสลิปไม่ได้" />

        <div className='flex items-center flex-col border-dashed border-[1px]  rounded-md px-4 py-4 cursor-pointer my-2 '>




          <Avatar variant='rounded' className='bs-12 is-12 my-2 bg-[#54d400] text-white animate-bounce'>
            <i className='tabler-upload' />
          </Avatar>
          <Typography variant='h6' className='mb-0 leading-none underline'>
            {isDragActive ? 'วางไฟล์ที่นี่' : 'กดที่นี่เพื่อแนบสลิป'}
          </Typography>
          <CountdownTimer expireDate={order.expire} onExpire={onExpire} />

          <p className='text-xs text-center mt-2 text-gray-500 font-bold  bg-gray-100 p-2 rounded-sm'>
            สามารถแนบสลิปได้ไม่จำกัดจนกว่าจะครบยอด
          </p>

          <p className='text-xs text-center text-gray-400 mt-2'>
            สลิปที่ไม่มี QR CODE ไม่สามารถตรวจสอบยอดชำระได้ กรุณาส่งหลักฐานให้แอดมิน
          </p>

        </div>
      </div>
      {file && (
        <List>
          <ListItem className='p-0'>
            <div className='file-details flex gap-2 justify-between'>
              <div className='file-preview'>
                <img src={file.preview} alt={file.name} style={{ width: '38px', height: '38px' }} />
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
          </ListItem>
        </List>
      )}
      {isVerifying && <CircularProgress size={24} />}
      {verificationResult && (
        <Typography
          color={verificationResult.includes('เรียบร้อย') ? 'success' : 'error'}
          style={{ marginTop: '10px', fontWeight: 'bold' }}
          className='text-center'
        >
          {verificationResult}
        </Typography>
      )}
    </>
  );
};

export default UploadSlip;
