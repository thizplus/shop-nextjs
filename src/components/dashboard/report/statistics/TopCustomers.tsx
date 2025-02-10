import { useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Pagination from '@mui/material/Pagination'

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

const userTypeLabels = {
  store: 'ร้านค้า',
  shop: 'ร้านขายของ',
  wholesale: 'ขายส่ง'
}

const TopCustomers = ({ customers }: TopCustomersProps) => {
  const [page, setPage] = useState(1)
  const itemsPerPage = 5

  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => b.totalAmount - a.totalAmount)
  }, [customers])

  const currentCustomers = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage


    return sortedCustomers.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedCustomers, page])

  const pageCount = Math.ceil(customers.length / itemsPerPage)
  const showPagination = customers.length > itemsPerPage

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  return (
    <Card className='md:min-h-96'>
      <CardHeader
        title={`ลูกค้าที่ซื้อมากที่สุด (${customers.length} ราย)`}
      />

      <CardContent className='flex flex-col'>
        {currentCustomers.map((customer, index) => (
          <div key={customer.userId} className='flex items-center gap-4 mb-4 last:mb-0'>
            <CustomAvatar
              size={32}
              src={customer.pictureUrl || `/images/avatars/${(index % 6) + 1}.png`}
            />
            <div className='flex justify-between items-center w-full gap-4'>
              <div>
                <Typography className='font-medium text-sm leading-none' color='text.primary'>
                  {customer.name}
                </Typography>
                <div className='flex gap-2 items-center'>
                  <Typography variant='body2' className='leading-none text-xs' color='text.secondary'>
                    {customer.phone}
                  </Typography>
                  <Typography variant='caption' className='leading-none text-xs' color='text.secondary'>
                    •
                  </Typography>
                  <Typography variant='body2' className='leading-none text-xs' color='text.secondary'>
                    {userTypeLabels[customer.userType]}
                  </Typography>
                </div>
              </div>
              <div className='flex flex-col items-end'>
                <Typography className='font-medium leading-none text-sm' color='text.primary'>
                  ฿{customer.totalAmount.toLocaleString()}
                </Typography>
                <Typography variant='body2' className='leading-none text-xs' color='text.secondary'>
                  {customer.orderCount.toLocaleString()} ออเดอร์
                </Typography>
              </div>
            </div>
          </div>
        ))}

        {/* Pagination - แสดงเฉพาะเมื่อมีข้อมูลเกิน itemsPerPage */}
        {showPagination && (
          <div className='flex justify-center pt-4'>
            <Pagination
              count={pageCount}
              page={page}
              onChange={handlePageChange}
              variant="outlined"
              shape="rounded"
              size='small'
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TopCustomers
