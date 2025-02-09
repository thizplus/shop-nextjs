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
          <PickersRange
            value={dateRange}
            onChange={handleDateChange}
          />
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
                  <Grid container spacing={3}>
                    {/* Cards ข้อมูลการขายเดิม */}
                    <Grid item xs={12} sm={6} md={2}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">จำนวนออเดอร์</Typography>
                        <Typography variant="h4">{data.summary.totalOrders}</Typography>
                        <Typography variant="caption" color="textSecondary">รายการ</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">ยอดขายรวม</Typography>
                        <Typography variant="h4">{formatNumber(data.summary.totalAmount)}</Typography>
                        <Typography variant="caption" color="textSecondary">บาท</Typography>
                      </Card>
                    </Grid>
                    {/* Cards ข้อมูลกำไร/ขาดทุน */}
                    <Grid item xs={12} sm={6} md={2}>
                      <Card variant="outlined" sx={{ p: 2, bgcolor: 'error.light' }}>
                        <Typography variant="subtitle2" color="error">ต้นทุนรวม</Typography>
                        <Typography variant="h4" color="error">
                          {formatNumber(data.summary.totalCost)}
                        </Typography>
                        <Typography variant="caption" color="error">บาท</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <Card variant="outlined" sx={{ p: 2, bgcolor: 'warning.light' }}>
                        <Typography variant="subtitle2" color="warning.dark">ค่าใช้จ่ายคลัง</Typography>
                        <Typography variant="h4" color="warning.dark">
                          {formatNumber(data.summary.totalWarehouseFees)}
                        </Typography>
                        <Typography variant="caption" color="warning.dark">บาท</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <Card variant="outlined" sx={{ p: 2, bgcolor: 'success.light' }}>
                        <Typography variant="subtitle2" color="success.dark">กำไรขั้นต้น</Typography>
                        <Typography variant="h4" color="success.dark">
                          {formatNumber(data.summary.totalGrossProfit)}
                        </Typography>
                        <Typography variant="caption" color="success.dark">บาท</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <Card variant="outlined" sx={{ p: 2, bgcolor: 'primary.light' }}>
                        <Typography variant="subtitle2" color="primary.dark">กำไรสุทธิ</Typography>
                        <Typography variant="h4" color="primary.dark">
                          {formatNumber(data.summary.totalNetProfit)}
                        </Typography>
                        <Typography variant="caption" color="primary.dark">บาท</Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              {data.dailyReports.map((daily: DailyReport) => (
                <Accordion key={daily.date} defaultExpanded={true}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
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
                            <TableCell align="right">ยอดขาย</TableCell>
                            <TableCell align="right" sx={{ color: 'error.main' }}>ต้นทุน</TableCell>
                            <TableCell align="right" sx={{ color: 'warning.dark' }}>ค่าคลัง</TableCell>
                            <TableCell align="right" sx={{ color: 'success.main' }}>กำไรขั้นต้น</TableCell>
                            <TableCell align="right" sx={{ color: 'primary.main' }}>กำไรสุทธิ</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {daily.orders.map((order: OrderDetail) => (
                            <TableRow key={order.orderId} hover>
                              <TableCell>{order.createdAt}</TableCell>
                              <TableCell>{order.orderId}</TableCell>
                              <TableCell>{order.customerName}</TableCell>
                              <TableCell align="right">{formatNumber(order.totalAmount)}</TableCell>
                              <TableCell align="right" sx={{ color: 'error.main' }}>
                                {formatNumber(order.profitInfo?.totalCost || 0)}
                              </TableCell>
                              <TableCell align="right" sx={{ color: 'warning.dark' }}>
                                {formatNumber(order.warehouseFees?.totalFees || 0)}
                              </TableCell>
                              <TableCell align="right" sx={{ color: 'success.main' }}>
                                {formatNumber(order.profitInfo?.grossProfit || 0)}
                              </TableCell>
                              <TableCell align="right" sx={{ color: 'primary.main' }}>
                                {formatNumber(order.profitInfo?.netProfit || 0)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow
                            sx={{
                              '& td': {
                                fontWeight: 'bold',
                                backgroundColor: 'action.selected'
                              }
                            }}
                          >
                            <TableCell colSpan={3}>รวมประจำวัน</TableCell>
                            <TableCell align="right">{formatNumber(daily.summary.totalAmount)}</TableCell>
                            <TableCell align="right" sx={{ color: 'error.main' }}>
                              {formatNumber(daily.summary.totalCost)}
                            </TableCell>
                            <TableCell align="right" sx={{ color: 'warning.dark' }}>
                              {formatNumber(daily.summary.totalWarehouseFees)}
                            </TableCell>
                            <TableCell align="right" sx={{ color: 'success.main' }}>
                              {formatNumber(daily.summary.totalGrossProfit)}
                            </TableCell>
                            <TableCell align="right" sx={{ color: 'primary.main' }}>
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
