'use client'

import { useEffect, useState, useCallback } from 'react';

import HeaderStore from "./headerStore"
import { useLiffAuth } from '@/actions/client/useLiffAuth';
import { useClientStores } from '@/stores/authStore';
import ProductList from './body/productList';
import { useConfigStore } from '@/stores/configStore';
import Loading from '../global/Loading';
import Payment from '../global/header/payment';
import { usePendingOrders } from '@/actions/backend/orders/usePendingOrders';

import Slider from '../global/Slider';
import FooterStore from '../global/footerStore';

import { usePin } from '@/actions/client/usePin';
import PinDialog from '../global/PinDialog';
import TickerDisplay from '../global/TickerDisplay';
import useMaintenance from '@/actions/client/useMaintenance';
import MaintenancePage from '../global/MaintenancePage';

type PropsMainStore = {
  priceId: string;
  liffId?: string;
};

const MainStore = ({ priceId, liffId }: PropsMainStore) => {


  const { isLiffLoading, liffError } = useLiffAuth(liffId, priceId);
  const { user, isLoggedIn } = useClientStores();
  const { config, fetchConfig, loading: configLoading } = useConfigStore();
  const [showPinDialog, setShowPinDialog] = useState(false);
  const { handlePinSubmit, error, isVerifying, hasPin } = usePin(user?.userId);



  // State for payment dialog
  const [showPayment, setShowPayment] = useState(false);

  // ใช้ hook ตรวจสอบ maintenance
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



  // Use pending orders hook
  const {
    pendingOrder,
    isLoading: isPendingOrderLoading,
    refreshPendingOrders
  } = usePendingOrders({
    userId: user?.userId,
    typeId: 'store', // กำหนด typeId เป็น 'store'
    isLoggedIn: !!user
  });


  // Initialize LIFF and fetch config
  useEffect(() => {
    if (!config) {
      fetchConfig();
    }
  }, [config, fetchConfig]);

  // Show payment dialog if there's a pending order
  useEffect(() => {
    if (pendingOrder && isLoggedIn) {
      setShowPayment(true);
    }
  }, [pendingOrder, isLoggedIn]);

  useEffect(() => {
    if (config?.displayConfig.isProtected && user && !user.isPinVerified) {
      setShowPinDialog(true);
    }
  }, [config, user]);

  const onPinSubmit = async (pin: string) => {
    try {
      await handlePinSubmit(pin);
      setShowPinDialog(false);
    } catch (error) {
      // จัดการ error ถ้าต้องการ
      console.error('PIN error:', error);
    }
  };


  // Handle payment dialog close
  const handlePaymentClose = useCallback(() => {
    setShowPayment(false);
    refreshPendingOrders();
  }, [refreshPendingOrders]);

  // Handle payment update
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePaymentUpdate = useCallback((updatedPayment: any) => {
    refreshPendingOrders();
  }, [refreshPendingOrders]);

  // Show loading state
  if (isLiffLoading || configLoading || isPendingOrderLoading || isMaintenanceLoading) {
    return <Loading />;
  }

  // Show error if any
  if (liffError) {
    return (
      <div className="p-4 text-red-500">
        เกิดข้อผิดพลาดในการเชื่อมต่อ: {liffError}
      </div>
    );
  }



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
      <HeaderStore />

      <Slider />
      {/* เพิ่ม TickerDisplay สำหรับร้านค้าหลัก */}
      {config?.tickers && <TickerDisplay />}
      {config && <ProductList priceIds={config.saleModel.listPrice.map(price => price.id)} />}

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

export default MainStore;
