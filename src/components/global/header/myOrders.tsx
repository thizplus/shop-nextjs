import { useState, useEffect } from 'react'

import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  Pagination,
  Tab,
  Box,
  Card,
  Grid,
  Typography
} from '@mui/material'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { subDays } from 'date-fns'

import type { TypeClient } from '@/types/clientTypes'
import type { TypeOrder } from '@/types/orderTypes'
import actionGetOrders from '@/actions/orders/getOrders'

import OrderDetail from './orderDetail'
import formatThaiDateTime from '@/components/global/functions/formatThaiDateTime'
import { useConfigStore } from '@/stores/configStore'
import ShippingLabel from '../shippingLabel'
import StatusLabel from '../statusLabel'
import PickersRange from '@/components/dashboard/report/PickersRange'
import { formatNumber } from '@/components/global/functions/numberFormat'
import useCustomerOrderStats from '@/actions/backend/clients/useCustomerOrderStats'

const OrderHistory = ({ orders, onPageChange, currentPage, totalPages }: {
  orders: TypeOrder[];
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  currentPage: number;
  totalPages: number;
}) => (
  <div className="mb-4">
    {orders.map((order) => (
      <div key={order.orderId} className="border-b py-2 flex justify-between">
        <div className='leading-none'>
          <p className='text-sm font-bold leading-none block'>{order.orderId}</p>
          <p className='text-xs'>{order?.createdAt ? formatThaiDateTime(order.createdAt.toLocaleString()) : '-'}</p>
          <OrderDetail order={order} />

          {order.payment.status === 'success' && order.shippingInfo.trackingNo && (
            <div className='mt-1 space-y-0.5'>
              <p className='text-xs flex gap-1'>
                <span className='font-semibold'>เลขพัสดุ:</span>
                <a
                  href={`https://th.kerryexpress.com/th/track/?track=${order.shippingInfo.trackingNo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {order.shippingInfo.trackingNo}
                </a>
              </p>

              {order.shippingInfo.trackingUpdateAt && (
                <div className='flex gap-2'>
                  <ShippingLabel status={order.shippingMethod} />
                  <p className='text-xs text-gray-500'>
                    {formatThaiDateTime(order.shippingInfo.trackingUpdateAt.toString())}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className='flex gap-2'>
          <StatusLabel status={order.payment.status} />
        </div>
      </div>
    ))}
    <div className="flex justify-center mt-4">
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={onPageChange}
        color="secondary"
        variant="outlined"
        shape="rounded"
      />
    </div>
  </div>
)

const OrderStats = ({ profile, priceId }: { profile: TypeClient; priceId: string }) => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    subDays(new Date(), 7),
    new Date()
  ])

  const { data: stats, isLoading } = useCustomerOrderStats(
    profile.userId,
    priceId,
    dateRange[0],
    dateRange[1]
  )

  return (
    <div className="space-y-4">
      <PickersRange value={dateRange} onChange={setDateRange} />

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card className="p-4">
            <Typography variant="subtitle2" color="text.secondary">
              คำสั่งซื้อทั้งหมด
            </Typography>
            <Typography variant="h5" className="mt-2">
              {isLoading ? '-' : formatNumber(stats?.summary?.totalOrders || 0)}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card className="p-4">
            <Typography variant="subtitle2" color="text.secondary">
              มูลค่าการสั่งซื้อรวม
            </Typography>
            <Typography variant="h5" className="mt-2">
              ฿{isLoading ? '-' : formatNumber(stats?.summary?.totalAmount || 0)}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card className="p-4">
            <Typography variant="subtitle2" color="text.secondary">
              มูลค่าเฉลี่ยต่อออเดอร์
            </Typography>
            <Typography variant="h5" className="mt-2">
              ฿{isLoading ? '-' : formatNumber(stats?.summary?.avgOrderValue || 0)}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <Box className="p-6">
              <Typography variant="h6" className="mb-4">
                สินค้าที่สั่งซื้อ
              </Typography>
              {stats?.summary.topProducts?.map((product) => (
                <Box
                  key={product.sku}
                  className="flex items-center gap-4 mb-4 last:mb-0"
                >
                  <Box
                    component="img"
                    src={product.imagePath || '/images/products/default-product.png'}
                    alt={product.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <Box className="flex flex-1 justify-between items-center min-w-0">
                    <Box className="flex flex-col min-w-0">
                      <Typography
                        className="font-medium text-sm leading-none mb-1"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '180px'
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Typography variant="body2" className="text-xs" color="text.secondary">
                        SKU: {product.sku}
                      </Typography>
                    </Box>
                    <Box className="flex flex-col items-end ml-2">
                      <Typography className="font-medium text-sm">
                        ฿{formatNumber(product.totalAmount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" className="text-xs">
                        {formatNumber(product.totalQty)} ชิ้น
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}

              {!isLoading && (!stats?.summary.topProducts || stats.summary.topProducts.length === 0) && (
                <Typography color="text.secondary" className="text-center py-4">
                  ไม่พบข้อมูลการสั่งซื้อในช่วงเวลาที่เลือก
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <Box className="p-6">
              <Typography variant="h6" className="mb-4">
                หมวดหมู่ที่สั่งซื้อ
              </Typography>
              {stats?.summary.topCategories?.map((category) => (
                <Box
                  key={category.catId}
                  className="flex justify-between items-center mb-4 last:mb-0"
                >
                  <Typography className="text-sm">{category.name}</Typography>
                  <Box className="text-right">
                    <Typography className="text-sm font-medium">
                      ฿{formatNumber(category.totalAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className="text-xs">
                      {formatNumber(category.totalItems)} ชิ้น
                    </Typography>
                  </Box>
                </Box>
              ))}

              {!isLoading && (!stats?.summary.topCategories || stats.summary.topCategories.length === 0) && (
                <Typography color="text.secondary" className="text-center py-4">
                  ไม่พบข้อมูลหมวดหมู่
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

type propsMyOrders = {
  profile: TypeClient;
  priceId: string;
}

const MyOrders = ({ profile, priceId }: propsMyOrders) => {
  const [open, setOpen] = useState<boolean>(false)
  const [orders, setOrders] = useState<TypeOrder[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [tabValue, setTabValue] = useState('1')
  const { config } = useConfigStore()
  const primaryColor = config?.displayConfig.primaryColor ?? '#000000'

  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue)
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value)
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await actionGetOrders({
          userId: profile.userId,
          typeId: priceId,
          page: currentPage,
          limit: 10
        })

        setOrders(result.items)
        setTotalPages(result.totalPages)
      } catch (error) {
        console.error('Error fetching orders:', error)
      }
    }

    if (open) {
      fetchOrders()
    }
  }, [profile.userId, priceId, currentPage, open])

  return (
    <>
      <Button
        onClick={handleClickOpen}
        style={{ flex: 1, borderRadius: 0, background: primaryColor }}
        className="border-0"
      >
        <i className='tabler-library text-[18px] mr-1' />
        <span className='text-[16px]'>ประวัติคำสั่งซื้อ</span>
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id='alert-dialog-title'>
          <TabContext value={tabValue}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleTabChange} aria-label="order tabs">
                <Tab
                  value="1"
                  label="ประวัติคำสั่งซื้อ"
                  icon={<i className='tabler-history text-[18px]' />}
                  iconPosition="start"
                />
                <Tab
                  value="2"
                  label="สถิติการสั่งซื้อ"
                  icon={<i className='tabler-chart-bar text-[18px]' />}
                  iconPosition="start"
                />
              </TabList>
            </Box>
            <TabPanel value="1" sx={{ p: 0, pt: 2 }}>
              <OrderHistory
                orders={orders}
                onPageChange={handlePageChange}
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </TabPanel>
            <TabPanel value="2" sx={{ p: 0, pt: 2 }}>
              <OrderStats
                profile={profile}
                priceId={priceId}
              />
            </TabPanel>
          </TabContext>
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleClose} variant='contained' color='error'>
            ปิดหน้าจอ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MyOrders
