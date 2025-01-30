import { useConfigStore } from '@/stores/configStore';
import actionUpdatePaymentStatus from '../orders/actionUpdatePeyment';

//import actionUpdatePaymentToZort from '@/actions/zortout/actionUpdatePaymentToZort';

interface VerifySlipParams {
  file: File;
  amount: number;
  orderId: string;
}

interface VerifySlipResult {
  status: 'success' | 'error';
  message: string;
  slipUrl?: string;
  verifyResult?: any;
}

const actionVerifySlip = async ({ file, amount, orderId }: VerifySlipParams): Promise<VerifySlipResult> => {
  const config = useConfigStore.getState().config;

  if (!config?.slipOK.ENABLED) {
    return { status: 'error', message: 'การตรวจสอบสลิปไม่ได้เปิดใช้งาน' };
  }

  try {
    // อัปโหลดไฟล์และได้ URL กลับมา
    const uploadFormData = new FormData();

    uploadFormData.append('file', file);

    console.log('Uploading file:', file.name);

    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/slipOK/upload-slip`, {
      method: 'POST',
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();

      console.error('Upload error response:', errorText);
      throw new Error(`การอัปโหลดไฟล์ล้มเหลว: ${uploadResponse.status} ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();

    console.log('Upload result:', uploadResult);
    const slipUrl = uploadResult.url;

    // ตรวจสอบสลิปผ่าน Express backend
    console.log('Verifying slip:', slipUrl);

    const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/slipOK/verify-slip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: slipUrl,
        amount,
        slipokApiKey: config.slipOK.API_KEY,
        slipokApiUrl: config.slipOK.API_URL
      })
    });

    const verifyResult = await verifyResponse.json();

    console.log('Verify API response:', verifyResult);

    if (!verifyResponse.ok) {
      console.error('Verify error response:', verifyResult);

      return {
        status: 'error',
        message: verifyResult.message || `การตรวจสอบสลิปล้มเหลว: ${verifyResponse.status}`,
        verifyResult: verifyResult
      };
    }

    if (verifyResult.status === 'success') {
      // อัปเดตสถานะการชำระเงิน
      await actionUpdatePaymentStatus({
        orderId,
        amount: verifyResult.data.amount,
        slipUrl,
        verifyResult
      });

      /*
            await actionUpdatePaymentToZort({
              orderId,
              paymentamount: verifyResult.data.amount,
              paymentmethod: 'โอนเงิน'
            });
      */

      return {
        status: 'success',
        message: verifyResult.message || 'สลิปถูกต้องและอัปเดตสถานะการชำระเงินเรียบร้อยแล้ว',
        slipUrl,
        verifyResult: verifyResult.data
      };
    } else {
      return {
        status: 'error',
        message: verifyResult.message || 'ไม่สามารถยืนยันสลิปได้ กรุณาตรวจสอบอีกครั้ง',
        verifyResult: verifyResult.data
      };
    }
  } catch (error) {
    console.error('Error in actionVerifySlip:', error);

    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการตรวจสอบสลิป',
      verifyResult: null
    };
  }
};

export default actionVerifySlip;
