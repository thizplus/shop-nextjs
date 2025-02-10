// components/statistics/TopCategories.tsx
import { useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

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

// สีและไอคอนสำหรับแต่ละหมวดหมู่ (หมุนเวียนใช้)
const categoryStyles: Array<{ color: ThemeColor; icon: string }> = [
  { color: 'primary', icon: 'tabler-box' },
  { color: 'info', icon: 'tabler-basket' },
  { color: 'success', icon: 'tabler-shopping-bag' },
  { color: 'warning', icon: 'tabler-gift' },
  { color: 'error', icon: 'tabler-package' }
]

const sortOptions = [
  'ยอดขายสูงสุด',
  'ยอดขายต่ำสุด',
  'จำนวนออเดอร์มากสุด',
  'จำนวนสินค้ามากสุด'
]

const TopCategories = ({ categories }: TopCategoriesProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sortOption, setSortOption] = useState<string>(sortOptions[0])



  const sortedCategories = useMemo(() => {
    const sorted = [...categories]

    switch (sortOption) {
      case 'ยอดขายสูงสุด':
        return sorted.sort((a, b) => b.totalAmount - a.totalAmount)
      case 'ยอดขายต่ำสุด':
        return sorted.sort((a, b) => a.totalAmount - b.totalAmount)
      case 'จำนวนออเดอร์มากสุด':
        return sorted.sort((a, b) => b.totalOrders - a.totalOrders)
      case 'จำนวนสินค้ามากสุด':
        return sorted.sort((a, b) => b.totalItems - a.totalItems)
      default:
        return sorted
    }
  }, [categories, sortOption])


  return (
    <Card>
      <CardHeader className='text-xs'
        title='หมวดหมู่ขายดี'

      />
      <CardContent className='flex flex-col gap-6'>
        {sortedCategories.map((item, index) => {
          const style = categoryStyles[index % categoryStyles.length]

          return (
            <div key={item.catId} className='flex items-center gap-4'>
              <CustomAvatar variant='rounded' skin='light' color={style.color}>
                <i className={style.icon} />
              </CustomAvatar>
              <div className='flex justify-between items-center gap-4 is-full flex-wrap'>
                <div className='flex flex-col flex-1'>
                  <Typography className='font-medium' color='text.primary'>
                    {item.name}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {item.totalItems.toLocaleString()} ชิ้น
                  </Typography>
                </div>
                <div className='flex flex-col items-end gap-1'>
                  <Typography className='font-medium' color='text.primary'>
                    ฿{item.totalAmount.toLocaleString()}
                  </Typography>
                  <Chip
                    label={`${item.totalOrders.toLocaleString()} SKU`}
                    variant='tonal'
                    size='small'
                    color={style.color}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default TopCategories
