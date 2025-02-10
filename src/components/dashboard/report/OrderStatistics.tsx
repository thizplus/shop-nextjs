// components/OrderStatistics.tsx
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

import CustomAvatar from '@core/components/mui/Avatar'
import { formatNumber } from '@/components/global/functions/numberFormat'
import type { ThemeColor } from '@/@core/types'

interface OrderStatsProps {
  totalOrders: number;
  totalNetAmount: number;
  totalCost: number;
  totalNetProfit: number;
  totalWarehouseFees: number;
}

type DataType = {
  icon: string
  stats: string
  title: string
  color: ThemeColor
}


const OrderStatistics = ({
  totalOrders,
  totalNetAmount,
  totalCost,
  totalNetProfit,
  totalWarehouseFees
}: OrderStatsProps) => {
  const data: DataType[] = [
    {
      stats: `${totalOrders}`,
      title: 'คำสั่งซื้อ',
      color: 'primary',
      icon: 'tabler-shopping-cart' // หรือ tabler-package
    },
    {
      stats: `${formatNumber(totalNetAmount)}฿`,
      title: 'ยอดขายสุทธิ',
      color: 'info',
      icon: 'tabler-cash' // หรือ tabler-currency-baht
    },
    {
      stats: `${formatNumber(totalCost + totalWarehouseFees)}฿`,
      title: 'ต้นทุน',
      color: 'error',
      icon: 'tabler-receipt' // หรือ tabler-calculator
    },
    {
      stats: `${formatNumber(totalNetProfit)}฿`,
      title: 'กำไรสุทธิ',
      color: 'success',
      icon: 'tabler-trending-up' // หรือ tabler-chart-line
    }
  ]

  return (
    <Card className='mb-2'>

      <CardContent>
        <Grid container spacing={4}>
          {data.map((item, index) => (
            <Grid key={index} item xs={6} sm={6} md={3} className='flex items-center gap-4'>
              <CustomAvatar color={item.color} variant='rounded' size={40} skin='light'>
                <i className={item.icon}></i>
              </CustomAvatar>
              <div className='flex flex-col leading-none'>
                <Typography variant='h6' className='leading-tight'>{item.stats}</Typography>
                <Typography variant='body2' className="leading-tight" color="textSecondary">{item.title}</Typography>
              </div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default OrderStatistics;
