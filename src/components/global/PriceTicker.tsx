import React from 'react';

import { useConfigStore } from '@/stores/configStore';

interface ListPrice {
  id: string;
  name: string;
  minPurchase: number;
  LIFF_ID: string;
  allowedUsers?: string[];
}

interface SaleModel {
  minOrderStatus: boolean;
  minOrderValue: number;
  type: string;
  listPrice: ListPrice[];
}

interface PriceTickerProps {
  saleModel: SaleModel;
}

const PriceTicker: React.FC<PriceTickerProps> = ({ saleModel }) => {

  const { config } = useConfigStore();
  const primaryColor = config?.displayConfig.primaryColor ? config?.displayConfig.primaryColor : '#000000'


  // Format number to Thai Baht
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  // Sort prices by minPurchase from low to high
  const sortedPrices = [...saleModel.listPrice].sort((a, b) => a.minPurchase - b.minPurchase);

  // Create ticker content
  const TickerContent = () => (
    <>
      {sortedPrices.map((price, index) => (
        <React.Fragment key={price.id}>
          <span className="mx-4 inline-block">
            🤣 ซื้อครบ {formatPrice(price.minPurchase)} บาท รับส่วนลดราคา {price.name}
          </span>
          {index < sortedPrices.length - 1 && (
            <span className="mx-2 inline-block">|</span>
          )}
        </React.Fragment>
      ))}
    </>
  );





  return (
    <div className={`w-full text-white overflow-hidden`} style={{ background: primaryColor }}>
      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap py-1">
          <TickerContent />
          <TickerContent />
          <TickerContent />
        </div>
        <div className="absolute top-0 animate-marquee2 whitespace-nowrap py-1">
          <TickerContent />
          <TickerContent />
          <TickerContent />
        </div>
      </div>
      <style jsx>{`
        .animate-marquee {
          animation: marquee 80s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 80s linear infinite;
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

export default PriceTicker;
