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
import PriceTicker from '../global/PriceTicker';
import { usePin } from '@/actions/client/usePin';
import PinDialog from '../global/PinDialog';


const MainStore = () => {
  const { isLiffLoading, liffError } = useLiffAuth();
  const { user, isLoggedIn } = useClientStores();
  const { config, fetchConfig, loading: configLoading } = useConfigStore();
  const [showPinDialog, setShowPinDialog] = useState(false);
  const { handlePinSubmit, error, isVerifying, hasPin } = usePin(user?.userId);



  // State for payment dialog
  const [showPayment, setShowPayment] = useState(false);



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
  if (isLiffLoading || configLoading || isPendingOrderLoading) {
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

  return (
    <>
      <HeaderStore />

      <Slider />
      {config && <PriceTicker saleModel={config.saleModel} />}
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
