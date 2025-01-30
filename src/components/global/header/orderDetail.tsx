// React Imports
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'

import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import ListAltIcon from '@mui/icons-material/ListAlt';

import type { TypeOrder } from '@/types/orderTypes'
import { formatNumber } from '@/components/global/functions/numberFormat'
import getStatusColor from '@/components/global/functions/statusColor'

type propsOrderDetail = {
  order: TypeOrder
}

const OrderDetail = ({ order }: propsOrderDetail) => {
  // States
  const [open, setOpen] = useState<boolean>(false)

  const handleClickOpen = () => setOpen(true)

  const handleClose = () => setOpen(false)

  return (
    <>

      <p className='text-sm cursor-pointer flex' onClick={handleClickOpen}>
        <ListAltIcon className='text-[16px] my-auto' /><span className='my-auto'>รายละเอียด</span>
      </p>

      <Dialog
        open={open}
        disableEscapeKeyDown
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        fullWidth
        maxWidth="xs"
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
      >
        <div className='px-6 pt-4'>
          <p className='text-md'>คำสั่งซื้อ # <span className='font-bold'>{order.orderId}</span></p>
        </div>
        <DialogContent>
          <p className={`text-md font-bold leading-none ${getStatusColor(order.payment.status)}`}>{order.payment.status}</p>

          <div className='grid grid-cols-[1fr_20%_10%] gap-2 py-2 border-b-[1px] font-bold'>
            <p className='text-md'>รายการ</p>
            <p className='text-md text-right'>ราคา</p>
            <p className='text-md text-right'>รวม</p>
          </div>
          {
            order.listProducts.map((item, index) => (
              <div key={index} className='grid grid-cols-[1fr_20%_10%] gap-2 py-2 border-b-[1px]'>
                <div className=' leading-none'>
                  <p className='text-sm font-bold'>{item.name}</p>

                </div>
                <p className='text-sm text-right'>{formatNumber(item.price)}฿ X {item.qty}</p>
                <p className='text-sm text-right'>{formatNumber(item.total)}฿</p>
              </div>
            ))
          }

          <div className='py-2 border-b-[1px]'>
            <p>ที่อยู่จัดจัดส่ง: </p>
            <div className=" leading-none flex gap-3">
              <i className='tabler-map-pin text-[64px] my-auto' />

              <div className='leading-none my-auto'>
                <p className='text-bold flex gap-2 font-bold text-sm leading-none'>
                  {`${order.shippingInfo.cusName}
                ${order.shippingInfo.cusTel}`}
                </p>
                <p className='leading-none text-sm'>
                  {`${order.shippingInfo.addressNo}
                  ${order.shippingInfo.district}
                  ${order.shippingInfo.amphoe}
                  ${order.shippingInfo.province}
                  ${order.shippingInfo.zipcode}`}
                </p>

                <p className='text-bold flex gap-2 font-bold text-sm leading-none'>
                  {`${order.shippingInfo.location} `}
                </p>
              </div>
            </div>
          </div>

          <div className='block text-right leading-none ml-auto py-2'>
            <div className='flex gap-2 justify-between'>
              <p>ยอดรวมสินค้า:</p>
              <p>{formatNumber(order.totalAmount)}฿</p>
            </div>
            <div className='flex gap-2 justify-between'>
              <p>ค่าจัดส่ง:</p>
              <p>{formatNumber(order.shippingCost)}฿</p>
            </div>
            <div className='flex gap-2 justify-between'>
              <p>ยอดรวมทั้งสิ้น:</p>
              <p>{formatNumber(order.netTotal)}฿</p>
            </div>
          </div>

        </DialogContent>
        <DialogActions className='dialog-actions-dense'>

          <Button onClick={handleClose} color='error' variant='outlined'>ปิดหน้าจอ</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default OrderDetail
