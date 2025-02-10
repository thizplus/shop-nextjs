// components/OrderReport.tsx
import { useState, useCallback } from 'react'

import {
  Box,
  Typography,
  Grid,
  Card,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Switch,
  FormControlLabel
} from '@mui/material'

import useOrderReport from '@/actions/backend/orders/useOrderReport'
import useOrderStats from '@/actions/backend/orders/useOrderStats'
import { TopProducts, TopCategories, TopCustomers } from './statistics'
import PickersRange from './PickersRange'
import MobileOrderReport from './MobileOrderReport'
import DesktopOrderReport from './DesktopOrderReport'
import OrderDetailDialog from './OrderDetailDialog'

const OrderReport = () => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([new Date(), new Date()])
  const [showStats, setShowStats] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  // Query hooks
  const {
    data: reportData,
    isLoading: isReportLoading,
    error: reportError
  } = useOrderReport(dateRange[0], dateRange[1])

  const {
    data: statsData,
    isLoading: isStatsLoading,
    error: statsError
  } = useOrderStats(dateRange[0], dateRange[1])

  const handleDateChange = useCallback((dates: [Date | null, Date | null]) => {
    setDateRange(dates)
  }, [])

  const handleSelectOrder = useCallback((orderId: string) => {
    setSelectedOrderId(orderId)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setSelectedOrderId(null)
  }, [])

  const handleToggleStats = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setShowStats(event.target.checked)
  }, [])

  if (reportError) {
    return (
      <Card sx={{ p: 3, bgcolor: 'error.light' }}>
        <Typography color="error" variant="body1">
          เกิดข้อผิดพลาด: {reportError instanceof Error ? reportError.message : 'Unknown error'}
        </Typography>
      </Card>
    )
  }

  const reportProps = {
    data: reportData,
    onSelectOrder: handleSelectOrder
  }

  return (
    <>
      <Box>
        <Grid container spacing={isMobile ? 2 : 3}>
          <Grid item xs={12}>
            <Card sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={9}>
                  <PickersRange value={dateRange} onChange={handleDateChange} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showStats}
                        onChange={handleToggleStats}
                        name="showStats"
                      />
                    }
                    label="แสดงสถิติการขาย"
                  />
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* แสดงสถิติ */}
          {showStats && (
            <Grid item xs={12}>
              {isStatsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : statsData ? (
                <Grid container spacing={3}>
                  {/* สินค้าขายดี */}
                  <Grid item xs={12} md={4}>
                    <TopProducts
                      products={statsData.topProducts}

                    />
                  </Grid>

                  {/* หมวดหมู่ขายดี */}
                  <Grid item xs={12} md={4}>
                    <TopCategories
                      categories={statsData.topCategories}

                    />
                  </Grid>

                  {/* ลูกค้าที่ซื้อมากที่สุด */}
                  <Grid item xs={12} md={4}>
                    <TopCustomers
                      customers={statsData.topCustomers}

                    />
                  </Grid>
                </Grid>
              ) : null}
              {statsError && (
                <Card sx={{ p: 2, bgcolor: 'error.light' }}>
                  <Typography color="error" variant="body1">
                    เกิดข้อผิดพลาดในการโหลดสถิติ: {statsError instanceof Error ? statsError.message : 'Unknown error'}
                  </Typography>
                </Card>
              )}
            </Grid>
          )}

          {/* แสดงรายงาน */}
          {isReportLoading ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            </Grid>
          ) : reportData ? (
            <Grid item xs={12}>
              {isMobile ? (
                <MobileOrderReport {...reportProps} />
              ) : (
                <DesktopOrderReport {...reportProps} />
              )}
            </Grid>
          ) : null}
        </Grid>
      </Box>

      {/* Dialog สำหรับแสดงรายละเอียดออเดอร์ */}
      <OrderDetailDialog
        orderId={selectedOrderId}
        onClose={handleCloseDialog}
      />
    </>
  )
}

export default OrderReport
