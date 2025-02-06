// components/dashboard/price/CopyButtons.tsx
import React from 'react';

import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import type { TypePriceList } from "@/types/priceListTypes";

interface CopyButtonsProps {
  items: TypePriceList;
}

const CopyButtons = ({ items }: CopyButtonsProps) => {
  const handleCopyLiff = async () => {
    if (!items.LIFF_ID) return;

    try {
      const liffUrl = `https://liff.line.me/${items.LIFF_ID}`;

      await navigator.clipboard.writeText(liffUrl);

      // อาจจะเพิ่ม toast notification ตรงนี้ถ้าต้องการ
    } catch (err) {
      console.error('Failed to copy LIFF URL:', err);
    }
  };

  const handleCopyWholesale = async () => {
    try {
      const wholesaleUrl = `${process.env.NEXT_PUBLIC_APP_URL}/wholesale/${items.priceId}`;

      await navigator.clipboard.writeText(wholesaleUrl);

      // อาจจะเพิ่ม toast notification ตรงนี้ถ้าต้องการ
    } catch (err) {
      console.error('Failed to copy wholesale URL:', err);
    }
  };

  return (
    <div className='my-auto flex gap-x-2'>
      <Tooltip title={items.LIFF_ID ? "คัดลอก LIFF URL" : "ไม่มี LIFF ID"}>
        <span> {/* ใช้ span ครอบเพื่อให้ Tooltip ทำงานได้แม้ปุ่มจะ disable */}
          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={handleCopyLiff}
            disabled={!items.LIFF_ID}
            startIcon={<ContentCopyIcon />}
            className='my-auto'
          >
            LIFF
          </Button>
        </span>
      </Tooltip>

      <Tooltip title="คัดลอกลิงค์ขายส่ง">
        <Button
          size="small"
          variant="contained"
          color="info"
          onClick={handleCopyWholesale}
          startIcon={<ContentCopyIcon />}
          className='my-auto'
        >
          URL
        </Button>
      </Tooltip>
    </div>
  );
};

export default CopyButtons;
