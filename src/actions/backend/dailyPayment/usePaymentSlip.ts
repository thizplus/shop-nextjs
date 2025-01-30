// hooks/usePaymentSlip.ts
import { useState, useCallback } from 'react';

import type { IDailyPayment } from '@/types/dailyPayment';

interface UsePaymentSlipProps {
  payment: IDailyPayment;
  currentPayment: IDailyPayment['payment'];
  onPaymentUpdate: (newPayment: IDailyPayment['payment']) => void;
}



export const usePaymentSlip = ({ payment, currentPayment, onPaymentUpdate }: UsePaymentSlipProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const verifySlip = useCallback(async (file: File) => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // 1. อัพโหลดไฟล์
      const formData = new FormData();

      formData.append('file', file);

      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/daily-payment/upload-slip`, {
        method: 'POST',
        body: formData
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.message || 'อัพโหลดไฟล์ไม่สำเร็จ');
      }

      // 2. ตรวจสอบสลิปและอัพเดทข้อมูล
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/daily-payment/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slipUrl: uploadResult.data.url,
          docId: payment.docId,
          amount: payment.totalAmount,
          slipOK: payment.slipOK
        })
      });

      const result = await verifyResponse.json();

      if (result.status === 'success') {
        const newPayment = {
          ...currentPayment,
          amount: currentPayment.amount + result.data.amount,
          slip: [
            ...currentPayment.slip,
            {
              url: result.data.slipUrl,
              amount: result.data.amount,
              uploadedAt: new Date().toISOString()
            }
          ]
        };

        onPaymentUpdate(newPayment);
        setVerificationResult(`อัพโหลดสลิปสำเร็จ ยอดเงิน ${result.data.amount} บาท`);

        return true;
      }

      setVerificationResult(result.message || 'ไม่สามารถตรวจสอบสลิปได้');

      return false;

    } catch (error) {
      console.error('Error in verifySlip:', error);
      setVerificationResult(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัพโหลดสลิป');

      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [payment, currentPayment, onPaymentUpdate]);

  return {
    isVerifying,
    verificationResult,
    verifySlip
  };
};
