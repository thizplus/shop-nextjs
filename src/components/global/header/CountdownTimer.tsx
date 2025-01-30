import React, { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';

interface CountdownProps {
  expireDate: string | Date;
  onExpire?: () => void;
}

const CountdownTimer: React.FC<CountdownProps> = ({ expireDate, onExpire }) => {
  const [timeRemaining, setTimeRemaining] = useState<{ minutes: number; seconds: number }>({ minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const expireTime = new Date(expireDate).getTime();
      const now = new Date().getTime();
      const diff = expireTime - now;

      if (diff <= 0) {
        setIsExpired(true);
        onExpire?.();

        return { minutes: 0, seconds: 0 };
      }

      return {
        minutes: Math.floor(diff / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      };
    };

    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining();

      setTimeRemaining(remaining);
    }, 1000);

    setTimeRemaining(calculateTimeRemaining());

    return () => clearInterval(timer);
  }, [expireDate, onExpire]);



  const { minutes, seconds } = timeRemaining;
  const color = minutes < 5 ? 'text-red-600' : 'text-gray-600';

  if (isExpired) {
    return (
      <div className="text-center p-4 bg-red-100 rounded-md">
        <Typography variant="h6" color="error">หมดเวลาชำระเงิน</Typography>
        <Typography variant="body2">กรุณาสร้างคำสั่งซื้อใหม่</Typography>
      </div>
    );
  }

  return (
    <div className="text-center">
      <Typography variant="body2" className="mb-1">เวลาที่เหลือในการชำระเงิน:</Typography>
      <Typography variant="h4" className={`leading-none font-bold ${color}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Typography>
    </div>
  );
};

export default CountdownTimer;
