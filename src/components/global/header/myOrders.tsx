import { useState, useEffect } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Pagination from '@mui/material/Pagination'

import type { TypeClient } from '@/types/clientTypes'
import type { TypeOrder } from '@/types/orderTypes'
import actionGetOrders from '@/actions/orders/getOrders'
import OrderDetail from './orderDetail'
import formatThaiDateTime from '@/components/global/functions/formatThaiDateTime'
import getStatusColor from '@/components/global/functions/statusColor'
import { useConfigStore } from '@/stores/configStore'

type propsMyOrders = {
  profile: TypeClient;
  priceId: string;
}

const MyOrders = ({ profile, priceId }: propsMyOrders) => {
  const [open, setOpen] = useState<boolean>(false)
  const [orders, setOrders] = useState<TypeOrder[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const { config } = useConfigStore();
  const primaryColor = config?.displayConfig.primaryColor ? config?.displayConfig.primaryColor : '#000000'
  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

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
        className={`border-0`}

      >
        <i className='tabler-library text-[18px] mr-1' /> <span className='text-[16px]'>ประวัติคำสั่งซื้อ</span>
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id='alert-dialog-title'>คำสั่งซื้อของฉัน</DialogTitle>
        <DialogContent>
          <div className="mb-4">

            {orders.map((order) => (
              <div key={order.orderId} className="border-b py-2 flex justify-between">
                <div className='leading-none'>
                  <p className='text-sm font-bold leading-none block'>{order.orderId}</p>
                  <p className='text-xs'>{formatThaiDateTime(order.createdAt.toString())}</p>
                  <OrderDetail order={order} />




                  {/* เพิ่มส่วนแสดง tracking info */}
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
                          <p className='text-xs uppercase'>
                            <span className='font-semibold'>ขนส่ง:</span> {order.shippingInfo.shippingChannel}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {formatThaiDateTime(order.shippingInfo.trackingUpdateAt.toString())}
                          </p>

                        </div>
                      )}

                    </div>
                  )}

                </div>
                <div className='flex gap-2'>
                  <p className={`text-sm font-bold leading-none ${getStatusColor(order.payment.status)}`}>
                    {order.payment.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="secondary"
              variant="outlined"
              shape="rounded"
            />
          </div>
        </DialogContent>
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
