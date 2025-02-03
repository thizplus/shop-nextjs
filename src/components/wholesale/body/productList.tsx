import { useState, useEffect, useCallback, useRef } from 'react';

import { TextField, FormControlLabel, Switch, Pagination } from '@mui/material';

import { useClientStores } from '@/stores/authStore';
import actionFetchCategories from '@/actions/backend/category/fetchCategories';
import scrollToTop from '@/components/global/functions/scrollToTop';
import { formatNumber } from '@/components/global/functions/numberFormat';
import CategoryList from '@/components/global/CategoryList';
import type { TypesCategory } from '@/types/categoryTypes';
import { useProductSinglePriceSocket } from '@/actions/backend/products/useProductSinglePriceSocket';
import AddToCart from './addToCart';
import ProductCardSkeleton from '@/components/global/ProductCardSkeleton';

interface Props {
  priceId: string;
}

const SinglePriceProductList: React.FC<Props> = ({ priceId }) => {
  const { user } = useClientStores();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<Array<{ catId: string, name: string }>>([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    products,
    currentPage,
    totalPages,
    isLoading,
    error,
    requestProducts
  } = useProductSinglePriceSocket(priceId);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await actionFetchCategories(1, 100);

        setCategories(data.items.map((category: TypesCategory) => ({
          catId: category.catId,
          name: category.name
        })));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    requestProducts(1, searchTerm, selectedCategory, showAvailableOnly);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestProducts]);

  const handleShowAvailableOnlyChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;

    setShowAvailableOnly(newValue);
    requestProducts(1, searchTerm, selectedCategory, newValue);
  }, [searchTerm, selectedCategory, requestProducts]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    scrollToTop(800);
    requestProducts(value, searchTerm, selectedCategory, showAvailableOnly);
  };

  const handleCategoryChange = (event: { target: { value: string } }) => {
    const newCategory = event.target.value;

    setSelectedCategory(newCategory);
    requestProducts(1, searchTerm, newCategory, showAvailableOnly);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;

    setSearchTerm(newSearchTerm);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      requestProducts(1, newSearchTerm, selectedCategory, showAvailableOnly);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (error) {
    return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  }

  return (
    <>
      <CategoryList
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
      <div className="p-4 pb-14">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <TextField
            label="ค้นหาสินค้า..."
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            fullWidth
            size="small"
          />
          <FormControlLabel
            control={
              <Switch
                checked={showAvailableOnly}
                onChange={handleShowAvailableOnlyChange}
                color="primary"
                size="small"
              />
            }
            label="สินค้าที่มีในสต็อก"
            className="whitespace-nowrap"
          />
        </div>

        {isLoading ? (
          <ProductCardSkeleton count={4} />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {products.map((product) => {
                const customPrice = user?.customPrices?.find(
                  cp => cp.sku === product.sku
                );

                return (
                  <div key={product.sku} className="border p-4 rounded grid">
                    {product.imagepath && (
                      <img src={product.imagepath} alt={product.name} className="mt-2 w-full h-40 object-cover" />
                    )}
                    <div className='min-h-[80px]'>

                      <div className='flex justify-between mb-1'>
                        <p className='text-sm font-semibold'>{product.sku}</p>
                        <p className='text-sm'>เหลือ: {formatNumber(product.availablestock)}</p>
                      </div>
                      <h2 className="font-bold text-base leading-none">{product.name}</h2>
                    </div>

                    {/* แสดงราคาพิเศษหรือราคาปกติ */}
                    {customPrice ? (
                      <div className="mb-1rounded">
                        <p className="text-sm leading-none flex justify-between border-b-[1px] border-dashed text-green-600">
                          ราคาพิเศษ: <strong>{formatNumber(customPrice.price)}฿</strong>
                        </p>

                      </div>
                    ) : (

                      <div className="mb-1 rounded">
                        <p className="text-sm leading-none flex justify-between border-b-[1px] border-dashed">
                          ราคา: <strong>{formatNumber(product.price)}฿</strong>
                        </p>

                      </div>

                    )}

                    <AddToCart items={product} priceId={priceId} />
                  </div>
                );
              })}
            </div>

            {products.length === 0 && (
              <p className="text-center mt-4">ไม่พบสินค้า</p>
            )}

            <div className="mt-4 flex justify-center">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="secondary"
                variant="outlined"
                shape="rounded"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SinglePriceProductList;
