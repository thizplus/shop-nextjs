import type { ChangeEvent } from 'react';
import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import type { TypeOrder } from "@/types/orderTypes";

interface UseGrabPaymentProps {
  order: TypeOrder;
  onSuccess?: () => void;
}

const useGrabPayment = ({ order, onSuccess }: UseGrabPaymentProps) => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [updateResult, setUpdateResult] = useState<string | null>(null);

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');

    if (value.split('.').length > 2) return;
    setAmount(value);
  };

  const handleSubmit = async () => {
    if (!amount) return;

    setIsProcessing(true);
    setUpdateResult(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/${order._id}/grab-payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          status: 'processing',
          note
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update grab payment');
      }

      setUpdateResult('อัพเดทข้อมูลเรียบร้อยแล้ว');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onSuccess?.();

    } catch (error) {
      console.error('Error updating grab payment:', error);
      setUpdateResult('เกิดข้อผิดพลาดในการอัพเดท');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setNote('');
    setUpdateResult(null);
  };

  return {
    amount,
    note,
    isProcessing,
    updateResult,
    setNote,
    handleAmountChange,
    handleSubmit,
    resetForm
  };
};

export default useGrabPayment;
