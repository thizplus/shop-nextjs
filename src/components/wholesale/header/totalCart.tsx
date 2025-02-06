import React, { useState, useMemo, useEffect } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import TextField from '@mui/material/TextField'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

import { useCartStore } from '@/stores/cartStore'
import { useConfigStore } from '@/stores/configStore'
import { useClientStores } from '@/stores/authStore'
import { useShippingStore } from '@/stores/shippingStore'
import { formatNumber } from '@/components/global/functions/numberFormat'
import { useCartChanges } from '../header/useCartChanges'
import ShippingInfo from '@/components/global/shipping/shippingInfo'
import actionCreateOrder from '@/actions/backend/orders/actionOrder'

/*
import { sendLineNotification } from '@/actions/global/lineNotification';
import { sendLineFlexMessage } from '@/actions/global/lineFlexMessage';
*/

import type { TypeOrder } from '@/types/orderTypes'
import Payment from '../../global/header/payment'
import { usePriceUpdate } from '@/actions/wholesale/usePriceUpdate'
import { checkWarehouseStock } from '@/actions/backend/orders/checkWarehouseStock'
import { useShippingMethodStore } from '@/stores/shippingMethodStore'
import { getClientDeliveryStatus } from '@/actions/client/clientDeliveryStatus'
import ShippingMethodSelector from '@/components/global/shipping/ShippingMethodSelector'
import { sendOrderToWarehouse } from '@/actions/zortout/actionWarehouse'
import type { IClientCoupon } from '@/types/couponTypes'
import CouponSection from '@/components/global/coupon/CouponSection'

interface PropsTotalCart {
  priceId: string
}

const TotalCart: React.FC<PropsTotalCart> = ({ priceId }) => {
  const { carts, getTotalAmount, getItemCount, updateItemQuantity, removeItem } = useCartStore()
  const { config, loading, error, fetchConfig } = useConfigStore()
  const { selectedAddress } = useShippingStore()
  const [open, setOpen] = useState<boolean>(false)
  const [isProcess, setIsProcess] = useState<boolean>(false)
  const cartVersion = useCartChanges(priceId)
  const [payment, setPayment] = useState<TypeOrder | undefined>(undefined)
  const { updateCartPrices } = usePriceUpdate(priceId)

  const [couponDiscount, setCouponDiscount] = useState(0)
  const [selectedCoupon, setSelectedCoupon] = useState<IClientCoupon | null>(null)

  const { user } = useClientStores()
  const { method } = useShippingMethodStore()

  const [deliveryStatus, setDeliveryStatus] = useState<{ enableGrabDelivery: boolean }>({
    enableGrabDelivery: false
  })

  const [insufficientStock, setInsufficientStock] = useState<Array<{
    name: string
    available: number
  }> | null>(null)

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  useEffect(() => {
    if (!config) {
      fetchConfig()
    }
  }, [config, fetchConfig])

  useEffect(() => {
    const fetchDeliveryStatus = async () => {
      if (user?.userId) {
        try {
          const status = await getClientDeliveryStatus()

          setDeliveryStatus(status)
        } catch (error) {
          console.error('Failed to fetch delivery status:', error)
          setSnackbar({
            open: true,
            message: 'ไม่สามารถตรวจสอบสถานะการจัดส่งได้',
            severity: 'error'
          })
        }
      }
    }

    fetchDeliveryStatus()
  }, [user?.userId]) // เพิ่ม dependency เป็น user?.userId

  const handleClickOpen = async () => {
    setOpen(true)

    // await updateCartPrices(); // อัพเดทราคาเมื่อเปิด dialog
  }

  const handleClose = (): void => setOpen(false)

  const handleQuantityChange = (sku: string, newQuantity: number): void => {
    if (newQuantity === 0) {
      removeItem(priceId, sku)
    } else {
      updateItemQuantity(priceId, sku, newQuantity)
    }
  }

  const cartItems = carts[priceId] || []
  const filteredItems = cartItems.filter(item => item.qty > 0)

  const calculateShippingCost = useMemo(() => {
    // ถ้าเลือก Grab ให้คืนค่า 0
    if (method === 'grab') return 0

    if (!config || !config.shippingCost || getTotalAmount(priceId) === 0) return 0
    const totalAmount = getTotalAmount(priceId)
    const { standard, special } = config.shippingCost

    if (totalAmount <= standard.value) {
      return standard.cost
    } else {
      return Math.ceil(totalAmount / special.value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, priceId, getTotalAmount, cartVersion, method])

  useEffect(() => {
    const updateTotals = async () => {
      if (open) {
        await updateCartPrices()

        // Set net total after cart prices are updated
        setNetTotal(getTotalAmount(priceId) + calculateShippingCost)
      }
    }

    updateTotals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, getTotalAmount, priceId, calculateShippingCost])

  const totalWithShipping = useMemo(() => {
    return getTotalAmount(priceId) + calculateShippingCost
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getTotalAmount, priceId, calculateShippingCost, cartVersion])

  const [netTotal, setNetTotal] = useState(totalWithShipping)

  const totalCartSum = useMemo(() => {
    return getTotalAmount(priceId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getTotalAmount, priceId, cartVersion])

  const isCartEmpty = useMemo(() => {
    return totalCartSum <= 0
  }, [totalCartSum])

  const canCheckout = useMemo(() => {
    if (!config) return false
    const { minOrderStatus, minOrderValue } = config.saleModel

    return !minOrderStatus || getTotalAmount(priceId) >= minOrderValue
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, priceId, getTotalAmount, cartVersion])

  const handleCreateOrders = async () => {
    const { user } = useClientStores.getState()

    if (!user?.userId || !selectedAddress) {
      setSnackbar({
        open: true,
        message: !user?.userId ? 'กรุณาเข้าสู่ระบบก่อนทำรายการ' : 'กรุณาเลือกที่อยู่จัดส่ง',
        severity: 'error'
      })

      return
    }

    setIsProcess(true)

    try {
      // เช็ค stock ก่อน
      const stockCheck = await checkWarehouseStock(
        filteredItems.map(item => ({
          sku: item.sku,
          qty: item.qty
        }))
      )

      if (!stockCheck.success) {
        setInsufficientStock(
          stockCheck.insufficientItems?.map(item => ({
            name: item.name,
            available: item.available
          })) || null
        )
        throw new Error(stockCheck.error || 'สินค้าในสต็อกไม่เพียงพอ')
      }

      setInsufficientStock(null)

      // สร้าง order data
      const orderData: Omit<TypeOrder, '_id' | 'createdAt' | 'updatedAt' | '__v'> = {
        orderId: `${process.env.NEXT_PUBLIC_SITE_CODE}-${Date.now()}`,
        typeOrder: 'store',
        typeId: priceId,
        userId: user.userId,
        listProducts: filteredItems.map(item => ({
          sku: item.sku,
          name: item.name,
          price: item.customPrice || item.price,
          qty: item.qty,
          total: item.qty * (item.customPrice || item.price)
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
        subTotal: getTotalAmount(priceId),
        totalAmount: getTotalAmount(priceId) - couponDiscount,
        netTotal: netTotal,
        expire: new Date(Date.now() + 15 * 60000),
        payment: {
          status: 'pending',
          amount: 0,
          slip: []
        },
        discountAmount: couponDiscount,
        coupon: selectedCoupon
          ? {
              code: selectedCoupon.code,
              type: selectedCoupon.type,
              value: selectedCoupon.value,
              isPercent: selectedCoupon.isPercent,
              discountAmount: couponDiscount
            }
          : undefined
      }

      // ส่งไปที่คลัง
      const warehouseResponse = await sendOrderToWarehouse(orderData)

      if (!warehouseResponse?.success) {
        throw new Error(warehouseResponse?.error || 'Failed to process in warehouse')
      }

      // สร้าง order ในร้านค้า
      await actionCreateOrder({
        ...orderData,
        warehouseOrderId: warehouseResponse.order._id
      })

      setSnackbar({
        open: true,
        message: 'สร้างคำสั่งซื้อสำเร็จ',
        severity: 'success'
      })

      handleClose()
      setPayment(warehouseResponse.order)
      useCartStore.getState().clearCart(priceId)
    } catch (error) {
      console.error('Failed to create order:', error)
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ',
        severity: 'error'
      })
    } finally {
      setIsProcess(false)
    }
  }

  const handleUpdatePayment = (updatedPayment: TypeOrder['payment']) => {
    setPayment(prevPayment => {
      if (prevPayment) {
        return { ...prevPayment, payment: updatedPayment }
      }

      return prevPayment
    })

    // ที่นี่คุณอาจต้องการอัปเดตข้อมูลในฐานข้อมูลหรือ state อื่นๆ ด้วย
  }

  const handleCancelOrder = () => {
    // เพิ่มโลจิกสำหรับการยกเลิกคำสั่งซื้อที่นี่
    // เช่น เรียก API เพื่อยกเลิกคำสั่งซื้อ
    setPayment(undefined)
  }

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const primaryColor = config?.displayConfig.primaryColor ? config?.displayConfig.primaryColor : '#000000'

  return (
    <>
      <div className='flex gap-2'>
        <Button
          variant='contained'
          onClick={handleClickOpen}
          size='small'
          disabled={getTotalAmount(priceId) <= 0}
          className={`flex gap-2`}
          style={{ background: primaryColor }}
        >
          <i className='tabler-shopping-bag text-[32px]'></i>
          <div className='block leading-none my-auto text-left'>
            <p>{formatNumber(totalCartSum)} ฿</p>
            <p className='text-xs'>{getItemCount(priceId)} รายการ</p>
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
            handleClose()
          }
        }}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle id='alert-dialog-title'>ยืนยันการสั่งซื้อ</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>รายการสินค้าในตะกร้า:</DialogContentText>
          <div className='mt-4'>
            {filteredItems.map((item, index) => (
              <div key={index} className='flex items-center mb-4 justify-between'>
                <div className='flex gap-2 items-center'>
                  {item.imagepath && <img src={item.imagepath} alt={item.name} className='w-full max-w-[80px]' />}
                  <div className='leading-none'>
                    <p className='font-semibold text-sm'>{item.name}</p>
                    <p className='text-xs'>
                      {item.customPrice ? (
                        <span className='text-green-600'>ราคาพิเศษ: {formatNumber(item.customPrice)} </span>
                      ) : (
                        <span>ราคา: {formatNumber(item.price)} </span>
                      )}
                      | คงเหลือ: {item.availablestock}
                    </p>
                    <div className='flex items-center justify-between'>
                      <div className='flex justify-between mt-2'>
                        <p
                          onClick={() => handleQuantityChange(item.sku, item.qty - 1)}
                          className='flex p-0 my-auto cursor-pointer'
                        >
                          {' '}
                          <i className='tabler-minus'></i>
                        </p>
                        <TextField
                          value={item.qty}
                          onChange={e => handleQuantityChange(item.sku, parseInt(e.target.value) || 0)}
                          type='number'
                          onFocus={event => event.currentTarget.select()}
                          inputProps={{
                            min: 0,
                            max: item.availablestock,
                            className: 'p-0 text-center h-full p-1 w-[70px]'
                          }}
                          size='small'
                        />
                        <p
                          onClick={() => handleQuantityChange(item.sku, item.qty + 1)}
                          className='flex p-0 my-auto cursor-pointer'
                        >
                          {' '}
                          <i className='tabler-plus'></i>
                        </p>
                      </div>
                      <p className='mt-4 text-sm text-right'>
                        รวม: {formatNumber(item.qty * (item.customPrice || item.price))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {deliveryStatus?.enableGrabDelivery && (
            <ShippingMethodSelector enableGrabDelivery={deliveryStatus.enableGrabDelivery} />
          )}

          <ShippingInfo />

          <CouponSection
            totalAmount={getTotalAmount(priceId)}
            onApplyCoupon={(discount, coupon) => {
              setCouponDiscount(discount)
              setSelectedCoupon(coupon)
              setNetTotal(totalWithShipping - discount)
            }}
          />

          <div className='block text-right leading-none ml-auto py-2'>
            <div className='flex gap-2 justify-between'>
              <p>ยอดรวมสินค้า:</p>
              <p>{formatNumber(getTotalAmount(priceId))}</p>
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
            <Alert severity='error' className='mt-2'>
              <div className='font-semibold'>สินค้าคงเหลือไม่เพียงพอ:</div>
              {insufficientStock.map((item, index) => (
                <div key={index} className='text-sm'>
                  {item.name}
                </div>
              ))}
            </Alert>
          )}

          {config?.saleModel.minOrderStatus && getTotalAmount(priceId) < config.saleModel.minOrderValue && (
            <p className='text-red-500 mt-2 text-center underline'>
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
  )
}

export default TotalCart
