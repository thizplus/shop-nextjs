import React from 'react';

interface Props {
  count?: number;
}

const ProductCardSkeleton: React.FC<Props> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="border p-4 rounded grid  animate-pulse">
          <div className="bg-gray-200 h-40 w-full rounded mb-2" />

          <div className="flex justify-between mb-1">
            <div className="h-4 bg-gray-200 w-20 rounded" />
            <div className="h-4 bg-gray-200 w-8 rounded" />
          </div>

          <div className="h-4 bg-gray-200 w-3/4 rounded mb-1" />
          <div className="h-4 bg-gray-200 w-20 rounded mb-2" />
          <div className="h-8 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
};

export default ProductCardSkeleton;
