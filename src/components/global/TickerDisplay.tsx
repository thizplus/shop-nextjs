import React, { useRef } from 'react';

import { useConfigStore } from '@/stores/configStore';

interface TickerDisplayProps {
  priceId?: string;
}

const TickerDisplay = ({ priceId }: TickerDisplayProps) => {
  const { config } = useConfigStore();
  const containerRef = useRef<HTMLDivElement>(null);

  if (!config?.tickers?.length) return null;

  // กรองข้อความที่ active และตรงกับ priceId
  const activeMessages = config.tickers.filter(msg =>
    msg.isActive && (
      msg.priceId === priceId ||
      (msg.priceId === 'main' && !priceId) ||
      (!msg.priceId && !priceId)
    )
  );

  if (activeMessages.length === 0) return null;

  // สร้างเนื้อหาที่จะวิ่ง
  const TickerContent = () => (
    <div className="inline-flex items-center">
      {activeMessages.map((msg, index) => (
        <React.Fragment key={msg.id}>
          <span
            className="mx-4"
            style={{ color: msg.color || '#ffffff' }}
          >
            {msg.message}
          </span>
          {index < activeMessages.length - 1 && (
            <span className="mx-2" style={{ color: msg.color || '#ffffff' }}></span>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const primaryColor = config?.displayConfig.primaryColor ?? '#000000';

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden"
      style={{
        background: primaryColor,
        height: '40px' // กำหนดความสูงที่แน่นอน
      }}
    >
      <div className="relative flex overflow-x-hidden h-full">
        <div className="py-2 animate-marquee whitespace-nowrap flex items-center">
          <TickerContent />
          <TickerContent />
        </div>
        <div className="absolute top-0 py-2 animate-marquee2 whitespace-nowrap flex items-center">
          <TickerContent />
          <TickerContent />
        </div>
      </div>
      <style jsx>{`
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 30s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee2 {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0%); }
        }
      `}</style>
    </div>
  );
};

export default TickerDisplay;
