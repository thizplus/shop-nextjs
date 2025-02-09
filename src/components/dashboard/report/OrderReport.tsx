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
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import useOrderReport from '@/actions/backend/orders/useOrderReport';
import PickersRange from './PickersRange';
import type { DailyReport, OrderDetail } from '@/actions/backend/orders/useOrderReport';
import { formatNumber } from '@/components/global/functions/numberFormat';

const OrderReport = () => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([new Date(), new Date()]);

  const handleDateChange = useCallback((dates: [Date | null, Date | null]) => {
    setDateRange(dates);
  }, []);

  const { data, isLoading, error } = useOrderReport(dateRange[0], dateRange[1]);

  if (error) {
    return (
      <Card sx={{ p: 3, bgcolor: 'error.light' }}>
        <Typography color="error" variant="body1">
          เกิดข้อผิดพลาด: {error instanceof Error ? error.message : 'Unknown error'}
        </Typography>
      </Card>
    );
  }

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
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ pb: 1, borderColor: 'divider' }}>
                    สรุปรวมทั้งหมด
                  </Typography>
                  <Grid container spacing={2}>
                    {/* จำนวนออเดอร์ */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">จำนวนออเดอร์</Typography>
                        <Typography variant="h4">{data.summary.totalOrders}</Typography>
                        <Typography variant="caption" color="textSecondary">รายการ</Typography>
                      </Card>
                    </Grid>

                    {/* ยอดขายสุทธิ */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">ยอดขายสุทธิ</Typography>
                        <Typography variant="h4">{formatNumber(data.summary.totalNetAmount)}</Typography>
                        <Typography variant="caption" color="textSecondary">บาท</Typography>
                      </Card>
                    </Grid>

                    {/* กำไรสุทธิ */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Card variant="outlined" sx={{ p: 2, bgcolor: 'success.light' }}>
                        <Typography variant="subtitle2">กำไรสุทธิ</Typography>
                        <Typography variant="h4">{formatNumber(data.summary.totalNetProfit)}</Typography>
                        <Typography variant="caption">บาท</Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              {data.dailyReports.map((daily: DailyReport) => (
                <Accordion key={daily.date} defaultExpanded={true}>
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
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>วันที่สั่งซื้อ</TableCell>
                            <TableCell>เลขที่คำสั่งซื้อ</TableCell>
                            <TableCell>ลูกค้า</TableCell>
                            <TableCell align="right">ยอดขายสุทธิ</TableCell>
                            <TableCell align="right" sx={{ color: 'error.main' }}>ต้นทุนสุทธิ</TableCell>
                            <TableCell align="right" sx={{ color: 'success.main' }}>กำไรสุทธิ</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {daily.orders.map((order: OrderDetail) => {
                            // คำนวณต้นทุนสุทธิ (รวมค่าคลัง)
                            const totalNetCost = (order.profitInfo?.totalCost || 0) + (order.warehouseFees?.totalFees || 0);

                            return (
                              <TableRow key={order.orderId} hover>
                                <TableCell>{order.createdAt}</TableCell>
                                <TableCell>{order.orderId}</TableCell>
                                <TableCell>{order.customerName}</TableCell>
                                <TableCell align="right">{formatNumber(order.netTotal)}</TableCell>
                                <TableCell align="right" sx={{ color: 'error.main' }}>
                                  {formatNumber(totalNetCost)}
                                </TableCell>
                                <TableCell align="right" sx={{ color: 'success.main' }}>
                                  {formatNumber(order.profitInfo?.netProfit || 0)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow
                            sx={{
                              '& td': {
                                fontWeight: 'bold',
                                backgroundColor: 'action.selected'
                              }
                            }}
                          >
                            <TableCell colSpan={3}>รวมประจำวัน</TableCell>
                            <TableCell align="right">{formatNumber(daily.summary.totalNetAmount)}</TableCell>
                            <TableCell align="right" sx={{ color: 'error.main' }}>
                              {formatNumber(daily.summary.totalCost + daily.summary.totalWarehouseFees)}
                            </TableCell>
                            <TableCell align="right" sx={{ color: 'success.main' }}>
                              {formatNumber(daily.summary.totalNetProfit)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Grid>
          </>
        ) : null}
      </Grid>
    </Box>
  );
};

export default OrderReport;
