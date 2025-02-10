import { useState } from 'react';

interface UseDownloadQRProps {
  orderId: string;
}

export const useDownloadQR = ({ orderId }: UseDownloadQRProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadQR = async (qrUrl: string) => {
    try {
      setIsDownloading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/qr/download?url=${encodeURIComponent(qrUrl)}`,
        {
          method: 'GET',
          credentials: 'omit', // เปลี่ยนจาก 'include' เป็น 'omit'
          headers: {
            'Accept': 'image/png',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.message || 'Failed to download QR code');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // เพิ่มการตรวจสอบ blob type
      if (blob.type !== 'image/png') {
        throw new Error('Invalid image format');
      }

      const link = document.createElement('a');

      link.href = blobUrl;
      link.download = `qr-payment-${orderId}.png`;

      // ใช้ click() event แทนการ append/remove
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      // ทำ cleanup หลังจาก timeout เล็กน้อย
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

    } catch (error) {
      console.error('Error downloading QR code:', error);
      setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดาวน์โหลด QR Code');
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    downloadQR,
    isDownloading,
    error
  };
};
