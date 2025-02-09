// components/OrderDetailDialog.tsx
import React from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
  useTheme,
  useMediaQuery,
  Divider,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { formatNumber } from '@/components/global/functions/numberFormat';
import formatThaiDateTime from '@/components/global/functions/formatThaiDateTime';
import type { ReportOrder } from '@/types/reportTypes';

interface OrderDetailDialogProps {
  open: boolean;
  onClose: () => void;
  order: ReportOrder;
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({ open, onClose, order }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Calculate totals
  const totalQuantity = order.listProducts.reduce((sum, product) => sum + product.qty, 0);
  const subTotal = order.listProducts.reduce((sum, product) => sum + product.total, 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" component="span">
              รายละเอียดคำสั่งซื้อ: {order.orderId}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary" display="block">
              วันที่สั่งซื้อ: {formatThaiDateTime(order.createdAt?.toLocaleString())}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Customer Info Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                ข้อมูลลูกค้า
              </Typography>
              <Typography variant="body2" gutterBottom>ชื่อ: {order.shippingInfo.cusName}</Typography>
              <Typography variant="body2" gutterBottom>เบอร์โทร: {order.shippingInfo.cusTel}</Typography>
              <Typography variant="body2" gutterBottom>
                ที่อยู่: {order.shippingInfo.addressNo}
              </Typography>
              <Typography variant="body2" gutterBottom>
                {order.shippingInfo.district} {order.shippingInfo.amphoe}
              </Typography>
              <Typography variant="body2" gutterBottom>
                {order.shippingInfo.province} {order.shippingInfo.zipcode}
              </Typography>
            </Paper>
          </Grid>

          {/* Shipping Info Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                ข้อมูลการจัดส่ง
              </Typography>
              <Typography variant="body2" gutterBottom>
                ช่องทาง: {order.shippingInfo.shippingChannel || '-'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                เลขพัสดุ: {order.shippingInfo.trackingNo || '-'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                ค่าจัดส่ง: {formatNumber(order.shippingCost)} บาท
              </Typography>
              {order.warehouseFees && (
                <Typography variant="body2" gutterBottom>
                  ค่าบริการคลัง: {formatNumber(order.warehouseFees.serviceFee)} บาท
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Products Table */}
          <Grid item xs={12}>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>รหัสสินค้า</TableCell>
                    <TableCell>สินค้า</TableCell>
                    <TableCell align="right">ราคา/ชิ้น</TableCell>
                    <TableCell align="right">จำนวน</TableCell>
                    <TableCell align="right">ต้นทุน</TableCell>
                    <TableCell align="right">กำไร/ชิ้น</TableCell>
                    <TableCell align="right">รวม</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.listProducts.map((product) => (
                    <TableRow key={product.sku}>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">{formatNumber(product.price)}</TableCell>
                      <TableCell align="right">{product.qty}</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        {formatNumber(product.totalCost)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        {formatNumber(product.profit)}
                      </TableCell>
                      <TableCell align="right">{formatNumber(product.total)}</TableCell>
                    </TableRow>
                  ))}

                  {/* Summary Rows */}
                  <TableRow>
                    <TableCell colSpan={3} />
                    <TableCell align="right">
                      <strong>รวม {totalQuantity} ชิ้น</strong>
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'error.main' }}>
                      <strong>{formatNumber(order.profitSummary?.totalCost || 0)}</strong>
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'success.main' }}>
                      <strong>{formatNumber(order.profitSummary?.grossProfit || 0)}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{formatNumber(subTotal)}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    สรุปคำสั่งซื้อ
                  </Typography>
                  <Box sx={{ '& > :not(style)': { mb: 1 } }}>
                    <Typography variant="body2">
                      ยอดรวมสินค้า: {formatNumber(subTotal)} บาท
                    </Typography>
                    <Typography variant="body2">
                      ค่าจัดส่ง: {formatNumber(order.shippingCost)} บาท
                    </Typography>
                    {order.warehouseFees && (
                      <Typography variant="body2">
                        ค่าบริการคลัง: {formatNumber(order.warehouseFees.totalFees)} บาท
                      </Typography>
                    )}
                    {order.discountAmount > 0 && (
                      <Typography variant="body2" color="error">
                        ส่วนลด: -{formatNumber(order.discountAmount)} บาท
                      </Typography>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" fontWeight="bold">
                      ยอดรวมสุทธิ: {formatNumber(order.netTotal)} บาท
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    สรุปกำไร/ขาดทุน
                  </Typography>
                  <Box sx={{ '& > :not(style)': { mb: 1 } }}>
                    <Typography variant="body2" color="error">
                      ต้นทุนรวม: {formatNumber(order.profitSummary?.totalCost || 0)} บาท
                    </Typography>
                    <Typography variant="body2" color="primary">
                      กำไรขั้นต้น: {formatNumber(order.profitSummary?.grossProfit || 0)} บาท
                    </Typography>
                    <Typography variant="body2" color="warning.main">
                      ค่าใช้จ่ายคลัง: {formatNumber(order.warehouseFees?.totalFees || 0)} บาท
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                      กำไรสุทธิ: {formatNumber(order.profitSummary?.netProfit || 0)} บาท
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          ปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailDialog;
