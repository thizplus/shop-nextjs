// components/statistics/TopCustomers.tsx
import { useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import CustomAvatar from '@core/components/mui/Avatar'


interface Customer {
  userId: string
  name: string
  phone: string
  userType: 'store' | 'shop' | 'wholesale'
  orderCount: number
  totalAmount: number
  lastOrderDate: string
  pictureUrl?: string
}

interface TopCustomersProps {
  customers: Customer[]

}

const sortOptions = [
  'ยอดซื้อสูงสุด',
  'ยอดซื้อต่ำสุด',
  'จำนวนออเดอร์มากสุด',
  'จำนวนออเดอร์น้อยสุด'
]

const userTypeLabels = {
  store: 'ร้านค้า',
  shop: 'ร้านขายของ',
  wholesale: 'ขายส่ง'
}

const TopCustomers = ({ customers }: TopCustomersProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sortOption, setSortOption] = useState<string>(sortOptions[0])



  const sortedCustomers = useMemo(() => {
    const sorted = [...customers]

    switch (sortOption) {
      case 'ยอดซื้อสูงสุด':
        return sorted.sort((a, b) => b.totalAmount - a.totalAmount)
      case 'ยอดซื้อต่ำสุด':
        return sorted.sort((a, b) => a.totalAmount - b.totalAmount)
      case 'จำนวนออเดอร์มากสุด':
        return sorted.sort((a, b) => b.orderCount - a.orderCount)
      case 'จำนวนออเดอร์น้อยสุด':
        return sorted.sort((a, b) => a.orderCount - b.orderCount)
      default:
        return sorted
    }
  }, [customers, sortOption])



  return (
    <Card className='bs-full'>
      <CardHeader
        title='ลูกค้าที่ซื้อมากที่สุด'

      />

      <CardContent className='flex flex-col gap-4'>
        {sortedCustomers.map((customer, index) => (
          <div key={customer.userId} className='flex items-center gap-4'>
            <CustomAvatar
              size={34}
              src={customer.pictureUrl || `/images/avatars/${(index % 6) + 1}.png`}
            />
            <div className='flex justify-between items-center is-full gap-4'>
              <div>
                <Typography className='font-medium' color='text.primary'>
                  {customer.name}
                </Typography>
                <div className='flex gap-2 items-center'>
                  <Typography variant='body2' color='text.secondary'>
                    {customer.phone}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    •
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {userTypeLabels[customer.userType]}
                  </Typography>
                </div>
              </div>
              <div className='flex flex-col items-end'>
                <Typography className='font-medium' color='text.primary'>
                  ฿{customer.totalAmount.toLocaleString()}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {customer.orderCount.toLocaleString()} ออเดอร์
                </Typography>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default TopCustomers
