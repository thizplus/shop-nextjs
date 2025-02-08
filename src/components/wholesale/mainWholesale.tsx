'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

import actionSearchPrice from '@/actions/backend/price/searchPrice';
import ProductList from './body/productList';
import MainHeader from './header/mainHeader';
import Loading from '../global/Loading';
import NotFoundPage from '../global/notFound';
import AccessDenied from '../global/AccessDenied';
import { useLiffAuth } from '@/actions/client/useLiffAuth';

import { useConfigStore } from '@/stores/configStore';
import Payment from '../global/header/payment';

import { usePendingOrders } from '@/actions/backend/orders/usePendingOrders';
import FooterStore from '../global/footerStore';
import Slider from '../global/Slider';

type PropsPriceId = {
  priceId: string;
  allowedUsers: string[];
  liffId?: string;
};

type PriceData = {
  items: any[];
  totalPages: number;
  currentPage: number;
};

const MainWholesale: React.FC<PropsPriceId> = ({
  priceId,
  allowedUsers,
  liffId
}) => {




  // Authentication state
  const { user, isLiffLoading, liffError } = useLiffAuth(liffId, priceId);

  // Price data state
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState<string | null>(null);
  const fetchAttempted = useRef(false);

  // Payment dialog state
  const [showPayment, setShowPayment] = useState(false);

  // Config and pending orders
  const { config, loading: configLoading } = useConfigStore();

  const {
    pendingOrder,
    isLoading: isPendingOrderLoading,
    refreshPendingOrders
  } = usePendingOrders({
    userId: user?.userId,
    typeId: priceId,
    isLoggedIn: !!user
  });

  // Fetch price data
  useEffect(() => {
    const fetchPriceData = async () => {
      if (fetchAttempted.current || !priceId) return;

      fetchAttempted.current = true;
      setIsPriceLoading(true);

      try {
        const result = await actionSearchPrice(priceId, 1, 1);

        setPriceData(result);
      } catch (err) {
        setPriceError('ไม่พบข้อมูลรายการสินค้า');
        console.error('Error fetching price data:', err);
      } finally {
        setIsPriceLoading(false);
      }
    };

    fetchPriceData();
  }, [priceId]);

  // Show payment dialog for pending orders
  useEffect(() => {
    if (pendingOrder && user && !showPayment) {
      setShowPayment(true);
    }
  }, [pendingOrder, user, showPayment]);

  // Payment handlers
  const handlePaymentClose = useCallback(() => {
    setShowPayment(false);
    refreshPendingOrders();
  }, [refreshPendingOrders]);

  const handlePaymentUpdate = useCallback(() => {
    refreshPendingOrders();
  }, [refreshPendingOrders]);

  // Memoized states
  const isInitialLoading = useMemo(() =>
    isPriceLoading || isLiffLoading,
    [isPriceLoading, isLiffLoading]
  );

  const isDataLoading = useMemo(() =>
    isPendingOrderLoading || configLoading,
    [isPendingOrderLoading, configLoading]
  );

  const hasAccess = useMemo(() => {
    // ถ้าไม่มี user ให้ return false
    if (!user) return false;

    // ถ้าไม่มี allowedUsers หรือเป็น array เปล่า ให้ปิดไม่ให้เข้า
    if (!allowedUsers || !allowedUsers.length) return false;

    // ตรวจสอบว่า user อยู่ใน allowedUsers หรือไม่
    return allowedUsers.includes(user.userId);
  }, [user, allowedUsers]);

  // Early returns for loading and error states
  if (isInitialLoading) {
    return <Loading />;
  }

  if (liffError) {
    return (
      <div className="p-4 text-center text-red-600">
        เกิดข้อผิดพลาดในการเข้าสู่ระบบ: {liffError}
      </div>
    );
  }

  if (priceError) {
    return (
      <div className="p-4 text-center text-red-600">
        {priceError}
      </div>
    );
  }

  console.log('allowedUsers', allowedUsers)
  console.log('user', user)
  console.log('hasAccess', hasAccess)

  if (!hasAccess) {
    return <AccessDenied />;
  }



  if (!priceData?.items?.length) {
    return <NotFoundPage />;
  }

  const hasSlides = priceData.items.length > 0;
  const hasQRImage = config?.slipOK?.qr_image;

  return (
    <>
      {isDataLoading && <Loading />}

      <MainHeader
        priceId={priceId}
        priceName={priceData.items[0].name}
      />

      {hasSlides && <Slider />}

      <ProductList
        priceId={priceId}
      />

      {pendingOrder && showPayment && hasQRImage && (
        <Payment
          paymentData={pendingOrder}
          qr={config.slipOK.qr_image}
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
