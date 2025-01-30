import { useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import type { IDailyPayment } from '@/types/dailyPayment';
import { formatNumber } from '@/components/global/functions/numberFormat';
import StatusLabel from '@/components/global/statusLabel';
import formatThaiDateTime from '@/components/global/functions/formatThaiDateTime';

interface Props {
  payment: IDailyPayment;
}

const DialogDetail = ({ payment }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="small"
        variant="contained"
        onClick={() => setOpen(true)}
        startIcon={<i className="tabler-eye" />}
      >
        รายละเอียด
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        aria-labelledby='payment-detail-dialog'
      >
        <DialogTitle>
          <div className="flex justify-between items-center">
            <div className="text-lg font-medium">{payment.docId}</div>
            <StatusLabel status={payment.payment.status} />
          </div>
        </DialogTitle>

        <DialogContent>
          <div className="space-y-2">
            <div className="text-sm border rounded-lg p-2">
              <div className="flex justify-between mb-2">
                <div>ร้านค้า : {payment.shopName}</div>
                <div>วันที่ : {formatThaiDateTime(payment.date)}</div>
              </div>
              <div className="flex justify-between items-center font-medium text-lg border-t">
                <div>ยอดรวมทั้งหมด:</div>
                <div>{formatNumber(payment.totalAmount)} ฿</div>

              </div>
            </div>
            {payment.orders.map((order) => (
              <div key={order.orderId} className="border rounded-lg p-2">
                <div className="font-medium mb-4">รายการสินค้า (Order: {order.orderId})</div>
                <div className="space-y-2">
                  {order.products.map((product) => (
                    <div key={product.sku} className="flex flex-col space-y-1 pb-1 border-b last:border-b-0">
                      <div className="flex justify-between items-start leading-none">
                        <div>
                          <div className="text-xs text-gray-500">รหัส: {product.sku}</div>
                          <div className="text-sm "> {product.name}</div>
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

                  <div className="leading-none space-y-1">
                    <div className="flex justify-between items-center text-gray-600">
                      <div className='text-sm leading-none'>ค่าจัดส่ง:</div>
                      <div className='text-sm leading-none'>{formatNumber(order.shippingCost)} ฿</div>
                    </div>
                    <div className="flex justify-between items-center text-gray-600">
                      <div className='text-sm leading-none'>ค่าบริการ:</div>
                      <div className='text-sm leading-none'>{formatNumber(order.serviceFee)} ฿</div>
                    </div>
                    <div className="flex justify-between items-center font-medium text-lg border-t pt-2">
                      <div>ยอดรวม:</div>
                      <div>{formatNumber(order.amount)} ฿</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}


          </div>
        </DialogContent>

        <DialogActions className='dialog-actions-dense'>
          <Button onClick={() => setOpen(false)} variant="outlined" color='error' size='small'>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DialogDetail;
