import { useState, useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import type { TypeOrder } from '@/types/orderTypes';

type FileProp = File & {
  preview: string;
};

interface UseManualSlipUploadProps {
  order: TypeOrder;
  onSuccess?: () => void;
}

interface UseManualSlipUploadReturn {
  file: FileProp | null;
  amount: string;
  isUploading: boolean;
  uploadResult: string | null;
  setFile: (file: FileProp | null) => void;
  setAmount: (amount: string) => void;
  clearFile: () => void;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => Promise<void>;
}

const useManualSlipUpload = ({ order, onSuccess }: UseManualSlipUploadProps): UseManualSlipUploadReturn => {

  const queryClient = useQueryClient();

  const [file, setFile] = useState<FileProp | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  const clearFile = useCallback(() => {
    if (file) {
      URL.revokeObjectURL(file.preview);
    }

    setFile(null);
  }, [file]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');

    if (value.split('.').length > 2) return;
    setAmount(value);
  }, []);

  const handleSubmit = async () => {
    if (!file || !amount) {
      setUploadResult('กรุณาแนบสลิปและระบุจำนวนเงิน');

      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      // 1. Upload slip to Firebase
      const uploadFormData = new FormData();

      uploadFormData.append('file', file);

      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/slipOK/upload-slip`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error('การอัปโหลดสลิปล้มเหลว');
      }

      const uploadResult = await uploadResponse.json();
      const slipUrl = uploadResult.url;

      // 2. Update payment status in your system
      const paymentResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/${order.orderId}/payment`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slipUrl,
            verifyResult: {
              data: {
                amount: parseFloat(amount),
                manual: true
              }
            }
          }),
        }
      );

      if (!paymentResponse.ok) {
        throw new Error('ไม่สามารถอัปเดตสถานะการชำระเงินได้');
      }

      const paymentResult = await paymentResponse.json();

      setUploadResult(
        paymentResult.fullyPaid
          ? 'ชำระเงินครบถ้วนแล้ว'
          : `อัปเดตการชำระเงินเรียบร้อยแล้ว (ชำระแล้ว ${paymentResult.order.payment.amount} บาท)`
      );

      if (onSuccess) {
        onSuccess();
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }

      return Promise.resolve();

    } catch (error) {
      console.error('Error in manual slip upload:', error);
      setUploadResult(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปโหลดสลิป');

      return Promise.reject(error);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    file,
    amount,
    isUploading,
    uploadResult,
    setFile,
    setAmount,
    clearFile,
    handleAmountChange,
    handleSubmit
  };
};

export default useManualSlipUpload;
