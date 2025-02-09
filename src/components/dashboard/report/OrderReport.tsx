// components/OrderReport.tsx
import { useState, useCallback } from 'react';

import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import useOrderReport from '@/actions/backend/orders/useOrderReport';
import PickersRange from './PickersRange';
import OrderDetailDialog from './OrderDetailDialog';
import { formatNumber } from '@/components/global/functions/numberFormat';
import formatThaiDateTime from '@/components/global/functions/formatThaiDateTime';

import type {
  ReportOrder,
  DailyReport,
  DailySummary
} from '@/types/reportTypes';

const OrderReport = () => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([new Date(), new Date()]);
  const [selectedOrder, setSelectedOrder] = useState<ReportOrder | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDateChange = useCallback((dates: [Date | null, Date | null]) => {
    setDateRange(dates);
  }, []);

  const { data, isLoading, error } = useOrderReport(dateRange[0], dateRange[1]);

  const handleOpenDialog = (order: ReportOrder) => {
    setSelectedOrder(order);
  };

  const handleCloseDialog = () => {
    setSelectedOrder(null);
  };

  if (error) {
    return (
      <Card sx={{ p: 3, bgcolor: 'error.light' }}>
        <Typography color="error" variant="body1">
          เกิดข้อผิดพลาด: {error instanceof Error ? error.message : 'Unknown error'}
        </Typography>
      </Card>
    );
  }

  const renderSummaryCards = (summaryData: DailySummary) => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">จำนวนออเดอร์</Typography>
          <Typography variant="h4">{summaryData.totalOrders}</Typography>
          <Typography variant="caption" color="textSecondary">รายการ</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">ยอดขายรวม</Typography>
          <Typography variant="h4">{formatNumber(summaryData.totalAmount)}</Typography>
          <Typography variant="caption" color="textSecondary">บาท</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card variant="outlined" sx={{ p: 2, bgcolor: 'error.light' }}>
          <Typography variant="subtitle2">ต้นทุนรวม</Typography>
          <Typography variant="h4">{formatNumber(summaryData.totalCost)}</Typography>
          <Typography variant="caption">บาท</Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card variant="outlined" sx={{ p: 2, bgcolor: 'success.light' }}>
          <Typography variant="subtitle2">กำไรสุทธิ</Typography>
          <Typography variant="h4">{formatNumber(summaryData.totalNetProfit)}</Typography>
          <Typography variant="caption">บาท</Typography>
        </Card>
      </Grid>
    </Grid>
  );

  const renderMobileOrderCard = (order: ReportOrder) => (
    <Card key={order.orderId} sx={{ mb: 2, p: 2 }}>
      <Grid container spacing={1}>
        <Grid item xs={8}>
          <Typography variant="subtitle2">{order.orderId}</Typography>
          <Typography variant="body2" color="textSecondary">
            {order.shippingInfo.cusName}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {formatThaiDateTime(order.createdAt?.toLocaleString())}
          </Typography>
        </Grid>
        <Grid item xs={4} sx={{ textAlign: 'right' }}>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog(order)}
            color="primary"
          >
            <VisibilityIcon />
          </IconButton>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="textSecondary">ยอดขาย</Typography>
          <Typography variant="body1">{formatNumber(order.totalAmount)}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="error.main">ต้นทุน</Typography>
          <Typography variant="body1" color="error.main">
            {formatNumber(order.profitSummary?.totalCost || 0)}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="warning.main">ค่าคลัง</Typography>
          <Typography variant="body1" color="warning.main">
            {formatNumber(order.warehouseFees?.totalFees || 0)}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="success.main">กำไรสุทธิ</Typography>
          <Typography variant="body1" color="success.main">
            {formatNumber(order.profitSummary?.netProfit || 0)}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );

  const renderDesktopOrderTable = (orders: ReportOrder[]) => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>เวลา</TableCell>
            <TableCell>เลขที่คำสั่งซื้อ</TableCell>
            <TableCell>ลูกค้า</TableCell>
            <TableCell align="right">ยอดขาย</TableCell>
            <TableCell align="right" sx={{ color: 'error.main' }}>ต้นทุน</TableCell>
            <TableCell align="right" sx={{ color: 'warning.main' }}>ค่าคลัง</TableCell>
            <TableCell align="right" sx={{ color: 'success.main' }}>กำไรสุทธิ</TableCell>
            <TableCell align="center">รายละเอียด</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.orderId} hover>
              <TableCell>{formatThaiDateTime(order.createdAt?.toLocaleString())}</TableCell>
              <TableCell>{order.orderId}</TableCell>
              <TableCell>{order.shippingInfo.cusName}</TableCell>
              <TableCell align="right">{formatNumber(order.totalAmount)}</TableCell>
              <TableCell align="right" sx={{ color: 'error.main' }}>
                {formatNumber(order.profitSummary?.totalCost || 0)}
              </TableCell>
              <TableCell align="right" sx={{ color: 'warning.main' }}>
                {formatNumber(order.warehouseFees?.totalFees || 0)}
              </TableCell>
              <TableCell align="right" sx={{ color: 'success.main' }}>
                {formatNumber(order.profitSummary?.netProfit || 0)}
              </TableCell>
              <TableCell align="center">
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(order)}
                  color="primary"
                >
                  <InfoOutlinedIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <PickersRange value={dateRange} onChange={handleDateChange} />
        </Grid>

        {isLoading ? (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : data ? (
          <>
            {/* Summary Section */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>สรุปรวมทั้งหมด</Typography>
                  {renderSummaryCards(data.summary)}
                </CardContent>
              </Card>
            </Grid>

            {/* Orders List */}
            <Grid item xs={12}>
              {data.dailyReports.map((daily: DailyReport) => (
                <Accordion key={daily.date} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {daily.date}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={4}>
                        <Typography color="textSecondary">
                          จำนวนออเดอร์: {daily.summary.totalOrders} รายการ
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={4}>
                        <Typography color="success.main">
                          กำไรสุทธิ: {formatNumber(daily.summary.totalNetProfit)} บาท
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionSummary>
                  <AccordionDetails>
                    {isMobile ? (
                      <Box>
                        {daily.orders.map((order) => renderMobileOrderCard(order))}
                      </Box>
                    ) : (
                      renderDesktopOrderTable(daily.orders)
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Grid>
          </>
        ) : null}
      </Grid>

      {/* Order Detail Dialog */}
      {selectedOrder && (
        <OrderDetailDialog
          open={Boolean(selectedOrder)}
          onClose={handleCloseDialog}
          order={selectedOrder}
        />
      )}
    </Box>
  );
};

export default OrderReport;
