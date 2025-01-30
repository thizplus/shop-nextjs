// components/orders/dialogOrderDetail.tsx
import { useState } from 'react';



import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import ImageSearchIcon from '@mui/icons-material/ImageSearch';

import StatusLabel from '@/components/global/statusLabel';
import { formatNumber } from '@/components/global/functions/numberFormat';
import type { TypeOrder } from '@/types/orderTypes';
import formatThaiDateTime from '@/components/global/functions/formatThaiDateTime';

interface DialogOrderDetailProps {
  order: TypeOrder;
}

const DialogOrderDetail = ({ order }: DialogOrderDetailProps) => {
  const [open, setOpen] = useState<boolean>(false);


  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button
        size="small"
        variant="contained"
        onClick={handleClickOpen}
        startIcon={<i className="tabler-eye" />}
      >
        รายละเอียด
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        aria-labelledby='order-detail-dialog-title'
      >
        <DialogTitle id='order-detail-dialog-title'>
          <div className="flex justify-between items-center">
            <div className="text-lg font-medium">
              {order.orderId}
            </div>
            <StatusLabel status={order.payment.status} />
          </div>
        </DialogTitle>

        <DialogContent>
          <div className="space-y-4">
            {/* ข้อมูลคำสั่งซื้อ */}
            <div className="border rounded-lg p-4">
              <div className="font-medium mb-2">ข้อมูลคำสั่งซื้อ</div>
              <div className="text-sm leading-none">
                <div>
                  <div className="">วันที่สั่งซื้อ : {formatThaiDateTime(order.createdAt.toLocaleString())}</div>

                </div>

              </div>
            </div>

            <div className="grid grid-cols-1  gap-4">
              {/* ที่อยู่จัดส่ง */}
              <div className="border rounded-lg p-4">
                <div className="font-medium mb-2">รูปแบบการจัดส่ง</div>
                <div className="text-sm leading-none p-2 border rounded-sm inline-block">
                  {order.shippingMethod}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1  gap-4">
              {/* ที่อยู่จัดส่ง */}
              <div className="border rounded-lg p-4">


                <div className="font-medium mb-2">ที่อยู่จัดส่ง</div>
                <div className="text-sm leading-none">
                  <div className='flex gap-2'>
                    <div className="">{order.shippingInfo.cusName}</div>
                    <div className="">{order.shippingInfo.cusTel}</div>
                  </div>
                  <div className="text-sm">
                    {order.shippingInfo.addressNo} {order.shippingInfo.district} {order.shippingInfo.amphoe} {order.shippingInfo.province} {order.shippingInfo.zipcode}
                  </div>
                </div>
              </div>

              {/* ข้อมูลการชำระเงิน */}
              {order.payment.status === 'success' &&
                <div className="border rounded-lg p-4">
                  <div className="font-medium mb-2">ข้อมูลการชำระเงิน</div>
                  <div className="space-y-3">
                    {order.payment.slip.map((slip, index) => (
                      <div key={slip._id?.toString()} className="border-b pb-2 last:border-0">
                        <div className="flex justify-between items-start mb-1 leading-none">
                          <a className='flex gap-2' href={slip.url} title='' target='_blank'>

                            <ImageSearchIcon className='text-3xl' />
                            <div className=' leading-none'>
                              <p>สลิปที่ {index + 1}</p>
                              <div className="text-xs text-gray-500">
                                {formatThaiDateTime(slip.uploadedAt.toLocaleString())}
                              </div>
                            </div>


                          </a>
                          <div className="text-right font-medium">
                            {formatNumber(slip.amount)} ฿
                          </div>
                        </div>
                        {slip.url && (
                          <div className="mt-2">

                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              }
            </div>

            {/* รายการสินค้า */}
            <div className="border rounded-lg p-4">
              <div className="font-medium mb-4">รายการสินค้า</div>
              <div className="space-y-2">
                {/* รายการสินค้า */}
                {order.listProducts.map((product) => (
                  <div key={product.sku} className="flex flex-col space-y-1 pb-1 border-b last:border-b-0">
                    <div className="flex justify-between items-start leading-none">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">รหัส: {product.sku}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(product.total)} ฿</div>
                        <div className="text-sm text-gray-500">
                          {formatNumber(product.price)} × {product.qty}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* สรุปยอด */}
                <div className=" pt-2 leading-none">
                  <div className="flex justify-between items-center text-gray-600">
                    <div>ค่าจัดส่ง:</div>
                    <div>{formatNumber(order.shippingCost)} ฿</div>
                  </div>
                  <div className="flex justify-between items-center font-medium text-lg">
                    <div>ยอดรวมทั้งสิ้น:</div>
                    <div>{formatNumber(order.netTotal)} ฿</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>

        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleClose} variant="outlined" color='error' size='small'>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DialogOrderDetail;
