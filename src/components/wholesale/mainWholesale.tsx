'use client'

import { useEffect, useRef, useState, useCallback } from 'react';

import actionSearchPrice from '@/actions/backend/price/searchPrice';
import ProductList from './body/productList';
import MainHeader from './header/mainHeader';
import Loading from '../global/Loading';
import NotFoundPage from '../global/notFound';
import { useCheckPriceAccess } from '@/actions/backend/price/useCheckPriceAccess';
import AccessDenied from '../global/AccessDenied';
import { useLiffAuth } from '@/actions/client/useLiffAuth';

import { useConfigStore } from '@/stores/configStore';
import Payment from '../global/header/payment';
import type { TypeOrder } from "@/types/orderTypes";
import { usePendingOrders } from '@/actions/backend/orders/usePendingOrders';
import FooterStore from '../global/footerStore';
import Slider from '../global/Slider';


type PropsPriceId = {
  priceId: string;
};

type PriceData = {
  items: any[];
  totalPages: number;
  currentPage: number;
};

const MainWholesale: React.FC<PropsPriceId> = ({ priceId }) => {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState<string | null>(null);
  const fetchAttempted = useRef(false);

  // Payment dialog state
  const [showPayment, setShowPayment] = useState(false);

  const { user, isLiffLoading, liffError } = useLiffAuth(priceId);
  const { data: accessData, isLoading: isAccessLoading, error: accessError } = useCheckPriceAccess(priceId);
  const { config, loading: configLoading } = useConfigStore();

  // Use pending orders hook
  const {
    pendingOrder,
    isLoading: isPendingOrderLoading,
    refreshPendingOrders
  } = usePendingOrders({
    userId: user?.userId,
    typeId: priceId,
    isLoggedIn: !!user
  });

  useEffect(() => {
    const fetchPriceData = async () => {
      if (fetchAttempted.current) return;
      fetchAttempted.current = true;

      try {
        const result = await actionSearchPrice(priceId, 1, 1);

        setPriceData(result);
      } catch (err) {
        setPriceError('ไม่พบข้อมูลรายการสินค้า');
      } finally {
        setIsPriceLoading(false);
      }
    };

    fetchPriceData();
  }, [priceId]);

  // Show payment dialog if there's a pending order
  useEffect(() => {
    if (pendingOrder && user) {
      setShowPayment(true);
    }
  }, [pendingOrder, user]);

  // Handle payment dialog close
  const handlePaymentClose = useCallback(() => {
    setShowPayment(false);
    refreshPendingOrders();
  }, [refreshPendingOrders]);

  // Handle payment update
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePaymentUpdate = useCallback((updatedPayment: TypeOrder['payment']) => {
    refreshPendingOrders();
  }, [refreshPendingOrders]);

  // Combined loading state
  const isLoading = isPriceLoading || isLiffLoading || isAccessLoading || isPendingOrderLoading || configLoading;

  if (isLoading) return <Loading />;
  if (liffError) return <div>เกิดข้อผิดพลาดในการเข้าสู่ระบบ: {liffError}</div>;
  if (priceError) return <div>{priceError}</div>;
  if (accessError) return <div>เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์: {accessError.message}</div>;
  if (accessData && !accessData.hasAccess) return <AccessDenied />;
  if (!priceData || priceData.items.length === 0) return <NotFoundPage />;

  return (
    <>
      <MainHeader
        priceId={priceId}
        priceName={priceData.items[0].name}
      />
      <Slider />
      <ProductList priceId={priceId} />

      {/* Show Payment dialog for pending order */}
      {pendingOrder && showPayment && (
        <Payment
          paymentData={pendingOrder}
          qr={config?.slipOK.qr_image}
          onClose={handlePaymentClose}
          onOpen={showPayment}
          onUpdatePayment={handlePaymentUpdate}
        />
      )}

      <FooterStore />
    </>
  );
};

export default MainWholesale;
