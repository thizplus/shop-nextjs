import { useState } from 'react'

import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import { subDays } from 'date-fns'

import { formatNumber } from '@/components/global/functions/numberFormat'

import PickersRange from '@/components/dashboard/report/PickersRange'
import type { TypeClient } from '@/types/clientTypes'
import useCustomerOrderStats from '@/actions/backend/clients/useCustomerOrderStats'

interface CustomerOrderStatsProps {
  profile: TypeClient;
  priceId: string;
}

const CustomerOrderStats = ({ profile, priceId }: CustomerOrderStatsProps) => {
  // ตั้งค่าวันที่เริ่มต้นเป็น 7 วันย้อนหลัง
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    subDays(new Date(), 7),
    new Date()
  ])

  const { data: stats, isLoading } = useCustomerOrderStats(
    profile.userId,
    priceId,
    dateRange[0],
    dateRange[1]
  )

  return (
    <Grid container spacing={3}>
      {/* Date Range Picker */}
      <Grid item xs={12}>
        <PickersRange value={dateRange} onChange={setDateRange} />
      </Grid>

      {/* Summary Cards */}
      <Grid item xs={12} container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card className="p-4">
            <Typography variant="subtitle2" color="text.secondary">
              คำสั่งซื้อทั้งหมด
            </Typography>
            <Typography variant="h5" className="mt-2">
              {isLoading ? '-' : formatNumber(stats?.summary?.totalOrders || 0)}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card className="p-4">
            <Typography variant="subtitle2" color="text.secondary">
              มูลค่าการสั่งซื้อรวม
            </Typography>
            <Typography variant="h5" className="mt-2">
              ฿{isLoading ? '-' : formatNumber(stats?.summary?.totalAmount || 0)}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card className="p-4">
            <Typography variant="subtitle2" color="text.secondary">
              มูลค่าเฉลี่ยต่อออเดอร์
            </Typography>
            <Typography variant="h5" className="mt-2">
              ฿{isLoading ? '-' : formatNumber(stats?.summary?.avgOrderValue || 0)}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Top Products */}
      <Grid item xs={12} md={8}>
        <Card>
          <Box className="p-6">
            <Typography variant="h6" className="mb-4">
              สินค้าที่สั่งซื้อ
            </Typography>
            {stats?.summary.topProducts?.map((product) => (
              <Box
                key={product.sku}
                className="flex items-center gap-4 mb-4 last:mb-0"
              >
                <Box
                  component="img"
                  src={product.imagePath || '/images/products/default-product.png'}
                  alt={product.name}
                  className="w-10 h-10 rounded object-cover"
                />
                <Box className="flex flex-1 justify-between items-center min-w-0">
                  <Box className="flex flex-col min-w-0">
                    <Tooltip title={product.name} placement="top">
                      <Typography
                        className="font-medium text-sm leading-none mb-1"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '180px'
                        }}
                      >
                        {product.name}
                      </Typography>
                    </Tooltip>
                    <Typography
                      variant="body2"
                      className="text-xs"
                      color="text.secondary"
                    >
                      SKU: {product.sku}
                    </Typography>
                  </Box>
                  <Box className="flex flex-col items-end ml-2">
                    <Typography className="font-medium text-sm">
                      ฿{formatNumber(product.totalAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className="text-xs">
                      {formatNumber(product.totalQty)} ชิ้น
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}

            {!isLoading && (!stats?.summary.topProducts || stats.summary.topProducts.length === 0) && (
              <Typography color="text.secondary" className="text-center py-4">
                ไม่พบข้อมูลการสั่งซื้อในช่วงเวลาที่เลือก
              </Typography>
            )}
          </Box>
        </Card>
      </Grid>

      {/* Categories Summary */}
      <Grid item xs={12} md={4}>
        <Card>
          <Box className="p-6">
            <Typography variant="h6" className="mb-4">
              หมวดหมู่ที่สั่งซื้อ
            </Typography>
            {stats?.summary.topCategories?.map((category) => (
              <Box
                key={category.catId}
                className="flex justify-between items-center mb-4 last:mb-0"
              >
                <Typography className="text-sm">{category.name}</Typography>
                <Box className="text-right">
                  <Typography className="text-sm font-medium">
                    ฿{formatNumber(category.totalAmount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="text-xs">
                    {formatNumber(category.totalItems)} ชิ้น
                  </Typography>
                </Box>
              </Box>
            ))}

            {!isLoading && (!stats?.summary.topCategories || stats.summary.topCategories.length === 0) && (
              <Typography color="text.secondary" className="text-center py-4">
                ไม่พบข้อมูลหมวดหมู่
              </Typography>
            )}
          </Box>
        </Card>
      </Grid>
    </Grid>
  )
}

export default CustomerOrderStats
