import { useState, useEffect, useCallback, useRef } from 'react';

import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import { useMultiPriceCartStore } from '@/stores/multiCartStore';
import type { MultiPriceProduct } from '@/types/multiplePrice';

interface ProductsResponse {
  items: MultiPriceProduct[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

interface useProductMultiPriceSocketProps {
  priceIds: string[];
}

interface useProductMultiPriceSocketReturn {
  products: MultiPriceProduct[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  requestProducts: (page: number, search: string, category: string, showAvailableOnly: boolean) => void;
}

export const useProductMultiPriceSocket = ({ priceIds }: useProductMultiPriceSocketProps): useProductMultiPriceSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [products, setProducts] = useState<MultiPriceProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestProducts = useCallback((
    page: number,
    search: string,
    category: string,
    showAvailableOnly: boolean
  ) => {
    if (socketRef.current) {
      setIsLoading(true);
      socketRef.current.emit('requestMultiPriceProducts', {
        page,
        limit: 20,
        searchTerm: search,
        selectedCategory: category,
        showAvailableOnly
      });
    }
  }, []);

  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}`, {
      query: { priceIds: priceIds.join(',') }
    });

    socketRef.current = socket;
    const { updateItemPrice, items } = useMultiPriceCartStore.getState();

    const handleProductsList = (data: ProductsResponse) => {
      setProducts(data.items);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setIsLoading(false);

      // Update cart prices
      data.items.forEach(product => {
        const cartItem = items.find(item => item.sku === product.sku);

        if (cartItem) {
          const newPrices = product.prices.reduce((acc, price) => ({
            ...acc,
            [price.priceId]: price.price
          }), {});

          updateItemPrice(product.sku, newPrices);
        }
      });
    };

    const handleProductUpdate = (updatedProduct: MultiPriceProduct) => {
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.sku === updatedProduct.sku ? { ...product, ...updatedProduct } : product
        )
      );

      const cartStore = useMultiPriceCartStore.getState();
      const cartItem = cartStore.items.find(item => item.sku === updatedProduct.sku);

      if (cartItem) {
        // อัพเดท availablestock
        cartStore.updateAvailableStock(updatedProduct.sku, updatedProduct.availablestock);

        // บังคับคำนวณราคาใหม่
        cartStore.recalculateBaseTotalCart();
      }
    };

    socket.on('connect', () => {
      setError(null);
      requestProducts(1, '', '', false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Failed to connect to server');
      setIsLoading(false);
    });

    socket.on('multiPriceProductsList', handleProductsList);
    socket.on('multiPriceProductUpdate', handleProductUpdate);
    socket.on('error', (errorMsg: string) => {
      console.error('Socket error:', errorMsg);
      setError(`Server error: ${errorMsg}`);
    });

    return () => {
      socket.off('multiPriceProductsList', handleProductsList);
      socket.off('multiPriceProductUpdate', handleProductUpdate);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [priceIds, requestProducts]);

  return {
    products,
    currentPage,
    totalPages,
    isLoading,
    error,
    requestProducts
  };
};
