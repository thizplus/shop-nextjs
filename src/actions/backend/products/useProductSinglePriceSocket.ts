import { useState, useEffect, useCallback, useRef } from 'react';

import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import { useCartStore } from '@/stores/cartStore';
import type { TypesProductWholesale } from '@/types/productTypes';

interface ProductsResponse {
  items: TypesProductWholesale[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

interface useProductSinglePriceSocketReturn {
  products: TypesProductWholesale[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  requestProducts: (page: number, search: string, category: string, showAvailableOnly: boolean) => void;
}

export const useProductSinglePriceSocket = (priceId: string): useProductSinglePriceSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [products, setProducts] = useState<TypesProductWholesale[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lastRequestParamsRef = useRef<{
    page: number;
    search: string;
    category: string;
    showAvailableOnly: boolean;
  } | null>(null);

  const requestProducts = useCallback((
    page: number,
    search: string,
    category: string,
    showAvailableOnly: boolean
  ) => {
    if (socketRef.current?.connected) {
      setIsLoading(true);
      lastRequestParamsRef.current = { page, search, category, showAvailableOnly };

      socketRef.current.emit('requestWholesaleProducts', {
        page,
        limit: 20,
        searchTerm: search,
        selectedCategory: category,
        priceId,
        showAvailableOnly
      });
    }
  }, [priceId]);

  const handleProductsList = useCallback((data: ProductsResponse) => {
    setProducts(data.items);
    setCurrentPage(data.currentPage);
    setTotalPages(data.totalPages);
    setIsLoading(false);
  }, []);

  const handleProductUpdate = useCallback((updatedProduct: TypesProductWholesale) => {
    setProducts(prevProducts => {
      const productExists = prevProducts.some(p => p.sku === updatedProduct.sku);

      if (productExists) {
        return prevProducts.map(product =>
          product.sku === updatedProduct.sku ? { ...product, ...updatedProduct } : product
        );
      }

      // If the product doesn't exist in the current view, request a refresh
      if (lastRequestParamsRef.current) {
        const { page, search, category, showAvailableOnly } = lastRequestParamsRef.current;

        requestProducts(page, search, category, showAvailableOnly);
      }

      return prevProducts;
    });

    const cartStore = useCartStore.getState();
    const cartItem = cartStore.carts[priceId]?.find(item => item.sku === updatedProduct.sku);

    if (cartItem) {
      if (updatedProduct.availablestock < cartItem.qty) {
        // Adjust cart quantity if available stock is less than cart quantity
        cartStore.updateItemQuantity(priceId, updatedProduct.sku, updatedProduct.availablestock);
      }

      cartStore.updateAvailableStock(priceId, updatedProduct.sku, updatedProduct.availablestock);
      cartStore.updateItemPrice(priceId, updatedProduct.sku, updatedProduct.price);
    }
  }, [priceId, requestProducts]);

  const setupSocketConnection = useCallback(() => {
    if (socketRef.current) return;

    const socket = io(`${process.env.NEXT_PUBLIC_SERVER_URL}/wholesale`, {
      query: { priceId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setError(null);

      if (lastRequestParamsRef.current) {
        const { page, search, category, showAvailableOnly } = lastRequestParamsRef.current;

        requestProducts(page, search, category, showAvailableOnly);
      } else {
        requestProducts(1, '', '', false);
      }
    });

    socket.on('wholesaleProductsList', handleProductsList);
    socket.on('wholesaleProductUpdate', handleProductUpdate);

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Failed to connect to server');
      setIsLoading(false);

      // Attempt to reconnect
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        socket.connect();
      }, 5000);
    });

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // Reconnect if server disconnected
        socket.connect();
      }
    });

    return socket;
  }, [priceId, requestProducts, handleProductsList, handleProductUpdate]);

  useEffect(() => {
    const socket = setupSocketConnection();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (socket) {
        socket.off('wholesaleProductsList', handleProductsList);
        socket.off('wholesaleProductUpdate', handleProductUpdate);
        socket.disconnect();
      }

      socketRef.current = null;
    };
  }, [setupSocketConnection, handleProductsList, handleProductUpdate]);

  return {
    products,
    currentPage,
    totalPages,
    isLoading,
    error,
    requestProducts
  };
};
