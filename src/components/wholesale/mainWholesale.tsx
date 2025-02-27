'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

import { useClientStores } from '@/stores/authStore';
import { useConfigStore } from '@/stores/configStore';
import { useLiffAuth } from '@/actions/client/useLiffAuth';
import { usePendingOrders } from '@/actions/backend/orders/usePendingOrders';
import { usePin } from '@/actions/client/usePin';

import actionSearchPrice from '@/actions/backend/price/searchPrice';
import ProductList from './body/productList';
import MainHeader from './header/mainHeader';
import Loading from '../global/Loading';
import NotFoundPage from '../global/notFound';
import AccessDenied from '../global/AccessDenied';
import Payment from '../global/header/payment';
import FooterStore from '../global/footerStore';
import Slider from '../global/Slider';
import PinDialog from '../global/PinDialog';
import TickerDisplay from '../global/TickerDisplay';
import useMaintenance from '@/actions/client/useMaintenance';
import MaintenancePage from '../global/MaintenancePage';

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
  // State management
  const { user, isLoggedIn } = useClientStores();
  const { config, fetchConfig, loading: configLoading } = useConfigStore();
  const { isLiffLoading, liffError } = useLiffAuth(liffId, priceId);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const { handlePinSubmit, error, isVerifying, hasPin } = usePin(user?.userId);

  // Price data state
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState<string | null>(null);
  const fetchAttempted = useRef(false);

  // Payment dialog state
  const [showPayment, setShowPayment] = useState(false);

  const {
    isLoading: isMaintenanceLoading,
    data: maintenanceData,
    isMaintenanceActive,
    shouldBlockUser
  } = useMaintenance();

  // ตรวจสอบว่าควรบล็อคผู้ใช้หรือไม่
  const shouldBlock = isMaintenanceActive && (
    !user || shouldBlockUser(user.createdAt ? user.createdAt.toString() : undefined)
  );



  // Fetch pending orders
  const {
    pendingOrder,
    isLoading: isPendingOrderLoading,
    refreshPendingOrders
  } = usePendingOrders({
    userId: user?.userId,
    typeId: priceId,
    isLoggedIn: !!user
  });

  // Fetch config if not available
  useEffect(() => {
    if (!config) {
      fetchConfig();
    }
  }, [config, fetchConfig]);

  // PIN protection check
  useEffect(() => {
    if (config?.displayConfig.isProtected && user && !user.isPinVerified) {
      setShowPinDialog(true);
    }
  }, [config, user]);

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
    if (pendingOrder && isLoggedIn && !showPayment) {
      setShowPayment(true);
    }
  }, [pendingOrder, isLoggedIn, showPayment]);

  // Handle PIN submission
  const onPinSubmit = async (pin: string) => {
    try {
      await handlePinSubmit(pin);
      setShowPinDialog(false);
    } catch (error) {
      console.error('PIN error:', error);
    }
  };

  // Payment handlers
  const handlePaymentClose = useCallback(() => {
    setShowPayment(false);
    refreshPendingOrders();
  }, [refreshPendingOrders]);

  const handlePaymentUpdate = useCallback(() => {
    refreshPendingOrders();
  }, [refreshPendingOrders]);

  // Check access permission
  const hasAccess = useMemo(() => {
    if (!user || !allowedUsers?.length) return false;

    return allowedUsers.includes(user.userId);
  }, [user, allowedUsers]);

  // Loading states
  const isInitialLoading = useMemo(() =>
    isPriceLoading || isLiffLoading || configLoading || isMaintenanceLoading,
    [isPriceLoading, isLiffLoading, configLoading, isMaintenanceLoading]
  );

  const isDataLoading = useMemo(() =>
    isPendingOrderLoading || configLoading,
    [isPendingOrderLoading, configLoading]
  );

  // Early returns for different states


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

  if (!hasAccess) {
    return <AccessDenied />;
  }

  if (!priceData?.items?.length) {
    return <NotFoundPage />;
  }


  const hasSlides = priceData.items.length > 0;
  const hasQRImage = config?.slipOK?.qr_image;


  // ถ้ามีการปิดปรับปรุงและควรบล็อคผู้ใช้ ให้แสดงหน้า maintenance
  if (shouldBlock) {
    // ตรวจสอบว่าเป็นการจำกัดผู้ใช้ใหม่หรือไม่
    const isRestrictedMode = maintenanceData?.config?.isEnabled &&
      maintenanceData?.config?.isRestrictNewUsers &&
      user?.createdAt !== undefined;

    return (
      <MaintenancePage
        message={maintenanceData?.config?.message}
        storeName={process.env.NEXT_PUBLIC_SITE_NAME}
        isRestrictedUser={isRestrictedMode}
        restrictDate={maintenanceData?.config?.restrictAfterDate}
      />
    );
  }

  return (
    <>
      {isDataLoading && <Loading />}

      <MainHeader
        priceId={priceId}
        priceName={priceData.items[0].name}
      />

      {hasSlides && <Slider />}

      {/* เพิ่ม TickerDisplay สำหรับร้านค้าตามราคา */}
      {config?.tickers && <TickerDisplay priceId={priceId} />}

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

      <PinDialog
        open={showPinDialog}
        isProtected={config?.displayConfig.isProtected ?? false}
        user={user}
        onPinSubmit={onPinSubmit}
        error={error}
        isVerifying={isVerifying}
        hasPin={hasPin}
      />
    </>
  );
};

export default MainWholesale;
