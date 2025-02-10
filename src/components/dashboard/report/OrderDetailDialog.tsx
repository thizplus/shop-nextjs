// components/OrderDetailDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,

  useTheme,
  useMediaQuery
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { formatNumber } from '@/components/global/functions/numberFormat';
import useOrderDetail from '@/actions/backend/orders/useOrderDetail';

interface Props {
  orderId: string | null;
  onClose: () => void;
}

const OrderDetailDialog = ({ orderId, onClose }: Props) => {
  const { data: order, isLoading } = useOrderDetail(orderId);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isLoading || !order) return null;

  return (
    <Dialog
      open={!!orderId}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      className={isMobile ? 'sm:mx-0' : ''}
    >
      <DialogTitle className='flex justify-between items-center border-b'>
        <div>
          <p className="text-lg font-medium">รายละเอียดคำสั่งซื้อ</p>
          <p className="text-sm text-gray-500">#{order.orderId}</p>
        </div>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className="!p-0">
        <div className="p-4 space-y-4">
          {/* ข้อมูลลูกค้า */}
          <div>
            <h3 className="text-base font-medium mb-2">ข้อมูลลูกค้า</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium">{order.shippingInfo.cusName}</p>
              <p className="text-sm text-gray-600">{order.shippingInfo.cusTel}</p>
              <p className="text-sm text-gray-600">
                {order.shippingInfo.addressNo} {order.shippingInfo.district} {order.shippingInfo.amphoe} {order.shippingInfo.province} {order.shippingInfo.zipcode}
              </p>
            </div>
          </div>

          <Divider />

          {/* รายการสินค้า */}
          <div>
            <h3 className="text-base font-medium mb-2">รายการสินค้า</h3>
            <div className="space-y-2">
              {order.listProducts.map((product) => (
                <div key={product.sku} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <div className="leading-none">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                    </div>
                    <div className="text-right leading-none">
                      <p className="font-medium">฿{formatNumber(product.price)}</p>
                      <p className="text-sm text-gray-500">x {product.qty}</p>
                    </div>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between text-sm leading-none">
                    <div>
                      <p>ยอดรวม</p>
                      <p className="text-success.main">กำไร/ชิ้น</p>
                    </div>
                    <div className="text-right">
                      <p>฿{formatNumber(product.total)}</p>
                      <p className="text-success.main">฿{formatNumber(product.profit || 0)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Divider />

          {/* สรุปค่าใช้จ่าย */}
          <div>
            <h3 className="text-base font-medium mb-2">สรุปค่าใช้จ่าย</h3>
            <div className="bg-gray-50 p-3 rounded-lg leading-none">
              <div className="flex justify-between">
                <span>ยอดรวมสินค้า</span>
                <span>฿{formatNumber(order.subTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>ค่าจัดส่ง</span>
                <span>฿{formatNumber(order.shippingCost)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-error">
                  <span>ส่วนลด</span>
                  <span>-฿{formatNumber(order.discountAmount)}</span>
                </div>
              )}
              <Divider className='my-2' />
              <div className="flex justify-between font-medium">
                <span>ยอดรวมสุทธิ</span>
                <span>฿{formatNumber(order.netTotal)}</span>
              </div>
            </div>
          </div>

          {/* ข้อมูลการจัดส่ง */}
          {order.shippingInfo.trackingNo && (
            <>
              <Divider />
              <div>
                <h3 className="text-base font-medium mb-2">ข้อมูลการจัดส่ง</h3>
                <div className="bg-info.light p-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600 block">เลขพัสดุ</span>
                      <span className="font-medium">{order.shippingInfo.trackingNo}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block">ขนส่ง</span>
                      <span className="font-medium uppercase">{order.shippingInfo.shippingChannel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;
