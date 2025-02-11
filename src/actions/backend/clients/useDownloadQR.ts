// useDownloadQR.ts
import { useState, useEffect } from 'react';

import { liff } from '@line/liff';

interface UseDownloadQRProps {
  orderId: string;
}

export const useDownloadQR = ({ orderId }: UseDownloadQRProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLineApp, setIsLineApp] = useState(false);

  useEffect(() => {
    // Check if running in LINE environment
    const checkLineEnvironment = async () => {
      try {
        const isInClient = await liff.isInClient();

        setIsLineApp(isInClient);
      } catch (error) {
        console.error('Error checking LINE environment:', error);
        setIsLineApp(false);
      }
    };

    checkLineEnvironment();
  }, []);

  const downloadQR = async (qrUrl: string) => {
    try {
      setIsDownloading(true);
      setError(null);

      // Different handling for LINE environment
      if (isLineApp) {
        await handleLineDownload(qrUrl);
      } else {
        await handleBrowserDownload(qrUrl);
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
      setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดาวน์โหลด QR Code');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleLineDownload = async (qrUrl: string) => {
    try {
      // Use LINE LIFF's openWindow API for iOS
      const downloadUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/qr/download-line?url=${encodeURIComponent(qrUrl)}&orderId=${orderId}`;

      if (liff.isInClient()) {
        await liff.openWindow({
          url: downloadUrl,
          external: true
        });
      }
    } catch (error) {
      throw new Error('Failed to open download in LINE');
    }
  };

  const handleBrowserDownload = async (qrUrl: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/qr/download?url=${encodeURIComponent(qrUrl)}`,
      {
        method: 'GET',
        credentials: 'omit',
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

    if (blob.type !== 'image/png') {
      throw new Error('Invalid image format');
    }

    // For iOS Safari
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const reader = new FileReader();

      reader.onloadend = function () {
        const url = reader.result as string;

        window.location.href = url;
      };

      reader.readAsDataURL(blob);

      return;
    }

    // For other browsers
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = blobUrl;
    link.download = `qr-payment-${orderId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
  };

  return {
    downloadQR,
    isDownloading,
    error,
    isLineApp
  };
};
