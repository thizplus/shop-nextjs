import React, { useState, useMemo, useEffect, useCallback } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { useMultiPriceCartStore } from '@/stores/multiCartStore';
import { useConfigStore } from '@/stores/configStore';
import { useClientStores } from '@/stores/authStore';
import { useShippingStore } from '@/stores/shippingStore';
import { formatNumber } from '@/components/global/functions/numberFormat';
import ShippingInfo from '@/components/global/shipping/shippingInfo';
import actionCreateOrder from '@/actions/backend/orders/actionOrder';

//import { sendLineNotification } from '@/actions/global/lineNotification';
//import { sendLineFlexMessage } from '@/actions/global/lineFlexMessage';

import { sendOrderToWarehouse } from '@/actions/zortout/actionWarehouse';
import type { TypeOrder } from '@/types/orderTypes';
import Payment from '../global/header/payment';
import { useMultiPriceUpdate } from '@/actions/store/useMultiPriceUpdate';
import { checkWarehouseStock } from '@/actions/backend/orders/checkWarehouseStock';
import { useShippingMethodStore } from '@/stores/shippingMethodStore';

import ShippingMethodSelector from '../global/shipping/ShippingMethodSelector';
import { getClientDeliveryStatus } from '@/actions/client/clientDeliveryStatus';
import CouponSection from '../global/coupon/CouponSection';
import type { IClientCoupon } from '@/types/couponTypes';

const MultiPriceTotalCart: React.FC = () => {


  const { user } = useClientStores();
  const { method } = useShippingMethodStore();

  const [deliveryStatus, setDeliveryStatus] = useState<{ enableGrabDelivery: boolean }>({
    enableGrabDelivery: false
  });

  const {
    items,
    getTotalAmount,
    getItemCount,
    updateItemQuantity,
    removeItem,
    clearCart,
    getApplicablePrice,
    baseTotalCart,
    recalculateBaseTotalCart
  } = useMultiPriceCartStore();

  const { config, loading, error, fetchConfig } = useConfigStore();
  const { selectedAddress } = useShippingStore();
  const [open, setOpen] = useState<boolean>(false);
  const [isProcess, setIsProcess] = useState<boolean>(false);
  const [payment, setPayment] = useState<TypeOrder | undefined>(undefined);
  const [localTotalAmount, setLocalTotalAmount] = useState<number>(0);
  const [localBaseTotalCart, setLocalBaseTotalCart] = useState<number>(0);


  const [couponDiscount, setCouponDiscount] = useState(0);
  const [selectedCoupon, setSelectedCoupon] = useState<IClientCoupon | null>(null);

  const [insufficientStock, setInsufficientStock] = useState<Array<{
    name: string;
    available: number;
  }> | null>(null);

  const { updateCartPrices } = useMultiPriceUpdate();

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const priceList = useMemo(() => {
    if (!config) return [];

    return [...config.saleModel.listPrice].sort((a, b) => a.minPurchase - b.minPurchase);
  }, [config]);

  const basePrice = useMemo(() => priceList[0], [priceList]);

  useEffect(() => {
    if (!config) {
      fetchConfig();
    }
  }, [config, fetchConfig]);

  useEffect(() => {
    const fetchDeliveryStatus = async () => {
      if (user?.userId) {
        try {
          const status = await getClientDeliveryStatus();

          setDeliveryStatus(status);
        } catch (error) {
          console.error('Failed to fetch delivery status:', error);
          setSnackbar({
            open: true,
            message: 'ไม่สามารถตรวจสอบสถานะการจัดส่งได้',
            severity: 'error'
          });
        }
      }
    };

    fetchDeliveryStatus();
  }, [user?.userId]); // เพิ่ม dependency เป็น user?.userId

  useEffect(() => {
    setLocalTotalAmount(getTotalAmount());
    setLocalBaseTotalCart(baseTotalCart);

    //  console.log('Updated total amount:', getTotalAmount());
    // console.log('Updated base total cart:', baseTotalCart);
    //  console.log('Applicable price ID:', getApplicablePrice());
  }, [getTotalAmount, baseTotalCart, getApplicablePrice]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const applicablePriceId = useMemo(() => getApplicablePrice(), [getApplicablePrice, localBaseTotalCart]);

  const applicablePriceName = useMemo(() => {
    if (!config) return '';
    const priceConfig = config.saleModel.listPrice.find(p => p.id === applicablePriceId);


    return priceConfig ? priceConfig.name : 'ราคาปกติ';
  }, [config, applicablePriceId]);

  const handleClickOpen = async () => {
    setOpen(true);

    try {
      const updated = await updateCartPrices();

      if (updated) {
        // อัพเดท local state หลังจากอัพเดทราคา
        setLocalTotalAmount(getTotalAmount());
        setLocalBaseTotalCart(recalculateBaseTotalCart());
      }
    } catch (err) {
      console.error('Failed to update prices:', err);
      setSnackbar({
        open: true,
        message: 'ไม่สามารถอัพเดทราคาสินค้าได้',
        severity: 'error'
      });
    }
  };

  const handleClose = (): void => setOpen(false);

  const handleQuantityChange = useCallback((sku: string, newQuantity: number): void => {
    if (newQuantity === 0) {
      removeItem(sku);
    } else {
      updateItemQuantity(sku, newQuantity);
    }

    setLocalTotalAmount(getTotalAmount());
    setLocalBaseTotalCart(recalculateBaseTotalCart());
  }, [removeItem, updateItemQuantity, getTotalAmount, recalculateBaseTotalCart]);

  const filteredItems = useMemo(() => items.filter(item => item.qty > 0), [items]);

  const calculateShippingCost = useMemo(() => {
    // ถ้าเลือก Grab ให้คืนค่า 0
    if (method === 'grab') return 0;

    // คำนวณค่าจัดส่งปกติ
    if (!config || !config.shippingCost || localTotalAmount === 0) return 0;
    const { standard, special } = config.shippingCost;

    if (localTotalAmount <= standard.value) {
      return standard.cost;
    } else {
      return Math.ceil(localTotalAmount / special.value);
    }
  }, [config, localTotalAmount, method]);

  const priceDisplay = useMemo(() => {
    if (!config?.saleModel.listPrice) return [];

    // เรียงลำดับราคาตาม minPurchase
    return [...config.saleModel.listPrice].sort((a, b) => a.minPurchase - b.minPurchase);
  }, [config]);

  const totalWithShipping = useMemo(() => {
    return localTotalAmount + calculateShippingCost;
  }, [localTotalAmount, calculateShippingCost]);


  const [netTotal, setNetTotal] = useState(totalWithShipping);

  const isCartEmpty = useMemo(() => {
    return localTotalAmount <= 0;
  }, [localTotalAmount]);

  const canCheckout = useMemo(() => {
    if (!config) return false;
    const { minOrderStatus, minOrderValue } = config.saleModel;


    return !minOrderStatus || localTotalAmount >= minOrderValue;
  }, [config, localTotalAmount]);

  const handleCreateOrders = async () => {
    const { user } = useClientStores.getState();

    if (!user || !user.userId) {
      setSnackbar({ open: true, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ', severity: 'error' });

      return;
    }

    if (!selectedAddress) {
      setSnackbar({ open: true, message: 'กรุณาเลือกที่อยู่จัดส่ง', severity: 'error' });

      return;
    }

    setIsProcess(true);

    try {
      // Check Zort stock first
      const stockCheck = await checkWarehouseStock(
        filteredItems.map(item => ({
          sku: item.sku,
          qty: item.qty
        }))
      );

      if (!stockCheck.success) {
        if (stockCheck.error) {
          throw new Error(stockCheck.error);
        }

        // อัพเดต insufficientStock state เพื่อแสดง Alert
        setInsufficientStock(
          stockCheck.insufficientItems?.map(item => ({
            name: item.name,
            available: item.available
          })) || null
        );

        setIsProcess(false);

        return;
      }

      // ถ้าสต็อกพอ เคลียร์ insufficientStock
      setInsufficientStock(null);

      const now = new Date();
      const expire = new Date(now.getTime() + 15 * 60000); // +15 นาที

      const orderData = {
        orderId: `${process.env.NEXT_PUBLIC_SITE_CODE}-${Date.now()}`,
        typeOrder: 'store',
        typeId: 'store',
        userId: user.userId,
        listProducts: filteredItems.map(item => ({
          sku: item.sku,
          name: item.name,
          price: item.prices[applicablePriceId] || Object.values(item.prices)[0],
          qty: item.qty,
          total: (item.prices[applicablePriceId] || Object.values(item.prices)[0]) * item.qty
        })),
        shippingInfo: {
          _id: selectedAddress._id || 'default_id',
          cusName: selectedAddress.cusName,
          cusTel: selectedAddress.cusTel,
          addressNo: selectedAddress.addressNo,
          district: selectedAddress.district,
          amphoe: selectedAddress.amphoe,
          province: selectedAddress.province,
          zipcode: selectedAddress.zipcode,
          location: selectedAddress.location,
          isDefault: selectedAddress.isDefault || false
        },
        shippingCost: calculateShippingCost,
        shippingMethod: method,
        subTotal: localBaseTotalCart,
        totalAmount: localTotalAmount - couponDiscount,
        netTotal: netTotal,
        expire: expire.toISOString(),
        payment: {
          status: 'pending',
          amount: 0,
          slip: []
        },
        discountAmount: couponDiscount,
        coupon: selectedCoupon ? {
          code: selectedCoupon.code,
          type: selectedCoupon.type,
          value: selectedCoupon.value,
          isPercent: selectedCoupon.isPercent,
          discountAmount: couponDiscount
        } : undefined
      } as unknown as TypeOrder;

      actionCreateOrder(orderData);

      // await sendLineNotification(orderData);
      // await sendLineFlexMessage(orderData);

      const res = await sendOrderToWarehouse(orderData);

      setSnackbar({ open: true, message: 'สร้างคำสั่งซื้อสำเร็จ', severity: 'success' });

      handleClose();

      setPayment(res.orderData);
      clearCart();
      console.log('orderData send payment:', res.orderData)

    } catch (error) {
      console.error('Failed to create order:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ',
        severity: 'error'
      });
    } finally {
      setIsProcess(false);
    }
  };

  const handleUpdatePayment = (updatedPayment: TypeOrder['payment']) => {
    setPayment(prevPayment => {
      if (prevPayment) {
        return { ...prevPayment, payment: updatedPayment };
      }


      return prevPayment;
    });
  };

  const handleCancelOrder = () => {
    setPayment(undefined);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const primaryColor = config?.displayConfig.primaryColor ? config?.displayConfig.primaryColor : '#000000'




  return (
    <>
      <div className='flex gap-2'>
        <Button
          variant='contained'
          onClick={handleClickOpen}
          size='small'
          disabled={localTotalAmount <= 0}
          className={`flex gap-2`}
          style={{ background: primaryColor }}
        >
          <i className="tabler-shopping-bag text-[32px]"></i>
          <div className='block leading-none my-auto text-left'>
            <p>{formatNumber(localTotalAmount)} ฿</p>
            <p className='text-xs'>{getItemCount()} รายการ</p>
          </div>
        </Button>
      </div>

      <Dialog
        open={open}
        disableEscapeKeyDown
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose();
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id='alert-dialog-title'>ยืนยันการสั่งซื้อ</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            รายการสินค้าในตะกร้า:
          </DialogContentText>
          <div className="mt-4">
            {filteredItems.map((item, index) => (
              <div key={index} className="grid grid-cols-1 items-center mb-4 justify-between w-full">
                <div className="grid items-center grid-cols-[100px_1fr] gap-2">
                  {item.imagepath && (
                    <img src={item.imagepath} alt={item.name} className="w-full max-w-[80px]" />
                  )}
                  <div className='leading-none'>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className='text-xs'>
                      {priceDisplay.map((price, index) => (
                        <React.Fragment key={price.id}>
                          {`${price.name}: ${formatNumber(item.prices[price.id])}฿`}
                          {index < priceDisplay.length - 1 && ' | '}
                        </React.Fragment>
                      ))}

                    </p>
                    <p className='text-xs'> {'คงเหลือ:'}{item.availablestock}</p>
                    <div className='grid items-center grid-cols-[100px_1fr] gap-2'>
                      <div className='flex justify-between mt-2'>
                        <p onClick={() => handleQuantityChange(item.sku, item.qty - 1)} className='flex p-0 my-auto cursor-pointer'> <i className="tabler-minus"></i></p>
                        <TextField
                          value={item.qty}
                          onChange={(e) => handleQuantityChange(item.sku, parseInt(e.target.value) || 0)}
                          type="number"
                          onFocus={(event) => event.currentTarget.select()}
                          inputProps={{
                            min: 0,
                            max: item.availablestock,
                            className: 'p-0 text-center h-full p-1 w-[50px]'
                          }}
                          size="small"
                        />
                        <p onClick={() => handleQuantityChange(item.sku, item.qty + 1)} className='flex p-0 my-auto cursor-pointer'> <i className="tabler-plus"></i></p>
                      </div>
                      <p className="mt-4 text-xs text-right">
                        รวม: {formatNumber((item.prices[applicablePriceId] || Object.values(item.prices)[0]) * item.qty)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {deliveryStatus?.enableGrabDelivery && (
            <ShippingMethodSelector
              enableGrabDelivery={deliveryStatus.enableGrabDelivery}
            />
          )}
          <ShippingInfo />

          <CouponSection
            totalAmount={localTotalAmount}
            onApplyCoupon={(discount, coupon) => {
              setCouponDiscount(discount);
              setSelectedCoupon(coupon);
              setNetTotal(totalWithShipping - discount);
            }}
          />

          <div className='block text-sm text-right leading-none ml-auto py-2'>
            <div className='flex gap-2 justify-between'>
              <p>ยอดรวมสินค้า ({basePrice?.name}):</p>
              <p>{formatNumber(localBaseTotalCart)}</p>
            </div>
            <div className='flex gap-2 justify-between'>
              <p>ราคาของคุณ ({applicablePriceName}):</p>
              <p>{formatNumber(localTotalAmount)}</p>
            </div>
            {couponDiscount > 0 && (
              <div className='flex gap-2 justify-between text-green-600'>
                <p>ส่วนลดคูปอง:</p>
                <p>-{formatNumber(couponDiscount)}</p>
              </div>
            )}
            <div className='flex gap-2 justify-between'>
              <p>ค่าจัดส่ง:</p>
              <p>{formatNumber(calculateShippingCost)}</p>
            </div>
            <div className='flex gap-2 justify-between font-bold'>
              <p>ยอดรวมทั้งสิ้น:</p>
              <p>{formatNumber(netTotal)}</p>
            </div>
          </div>

          {insufficientStock && insufficientStock.length > 0 && (
            <Alert severity="error" className="mt-2">
              <div className="font-semibold">สินค้าคงเหลือไม่เพียงพอ:</div>
              {insufficientStock.map((item, index) => (
                <div key={index} className="text-sm">
                  {item.name} (มีในสต็อก: {item.available})
                </div>
              ))}
            </Alert>
          )}

          {config?.saleModel.minOrderStatus && localTotalAmount < config.saleModel.minOrderValue && (
            <p className="text-red-500 mt-2 text-center underline">
              ยอดสั่งซื้อขั้นต่ำ {formatNumber(config.saleModel.minOrderValue)} บาท
            </p>
          )}
        </DialogContent>
        <DialogActions className='dialog-actions-dense pt-3'>
          <Button onClick={handleClose} variant='outlined' color='error' disabled={isProcess}>
            เลือกสินค้าเพิ่ม
          </Button>

          <Button
            onClick={handleCreateOrders}
            autoFocus
            variant='contained'
            color='success'
            disabled={!canCheckout || isProcess || isCartEmpty}
          >
            {isProcess ? 'กำลังดำเนินการ...' : 'ยืนยันคำสั่งซื้อ'}
          </Button>
        </DialogActions>
      </Dialog>

      {payment && (
        <Payment
          paymentData={payment}
          qr={config?.slipOK.qr_image}
          onClose={handleCancelOrder}
          onOpen={true}
          onUpdatePayment={handleUpdatePayment}

        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            boxShadow: 3,
            borderRadius: 2
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MultiPriceTotalCart;
