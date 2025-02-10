import { useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Pagination from '@mui/material/Pagination'

import CustomAvatar from '@core/components/mui/Avatar'

type ThemeColor = 'primary' | 'info' | 'success' | 'warning' | 'error'

interface Category {
  catId: string
  name: string
  totalAmount: number
  totalOrders: number
  totalItems: number
}

interface TopCategoriesProps {
  categories: Category[]
}

const categoryStyles: Array<{ color: ThemeColor; icon: string }> = [
  { color: 'primary', icon: 'tabler-box' },
  { color: 'info', icon: 'tabler-basket' },
  { color: 'success', icon: 'tabler-shopping-bag' },
  { color: 'warning', icon: 'tabler-gift' },
  { color: 'error', icon: 'tabler-package' }
]

const TopCategories = ({ categories }: TopCategoriesProps) => {
  const [page, setPage] = useState(1)
  const itemsPerPage = 5

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => b.totalAmount - a.totalAmount)
  }, [categories])

  const currentCategories = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage


    return sortedCategories.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedCategories, page])

  const pageCount = Math.ceil(categories.length / itemsPerPage)
  const showPagination = categories.length > itemsPerPage

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  return (
    <Card className='md:min-h-96'>
      <CardHeader
        className='text-xs'
        title={`หมวดหมู่ขายดี (${categories.length} รายการ)`}
      />
      <CardContent className='flex flex-col'>
        {currentCategories.map((item, index) => {
          const style = categoryStyles[index % categoryStyles.length]

          return (
            <div key={item.catId} className='flex items-center gap-4 mb-4 last:mb-0'>
              <CustomAvatar variant='rounded' size={32} skin='light' color={style.color}>
                <i className={style.icon} />
              </CustomAvatar>
              <div className='flex justify-between items-center gap-4 w-full flex-wrap'>
                <div className='flex flex-col flex-1'>
                  <Typography className='font-medium leading-none text-sm' color='text.primary'>
                    {item.name}
                  </Typography>
                  <Typography variant='body2' className='text-xs' color='text.secondary'>
                    {item.totalItems.toLocaleString()} ชิ้น
                  </Typography>
                </div>
                <div className='flex flex-col items-end leading-none'>
                  <Typography className='font-medium text-sm' color='text.primary'>
                    ฿{item.totalAmount.toLocaleString()}
                  </Typography>
                  <Chip
                    label={`${item.totalOrders.toLocaleString()} SKU`}
                    variant='tonal'
                    size='small'
                    className='text-xs p-0'
                    color={style.color}
                  />
                </div>
              </div>
            </div>
          )
        })}

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

export default TopCategories
