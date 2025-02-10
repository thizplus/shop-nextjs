// components/statistics/TopProducts.tsx
import { useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'



interface Product {
  sku: string
  name: string
  totalQty: number
  totalAmount: number
  imagePath: string | null
  categories: Array<{
    catId: string
    name: string
  }>
}

interface TopProductsProps {
  products: Product[]
}

const sortOptions = [
  'ยอดขายสูงสุด',
  'ยอดขายต่ำสุด',
  'จำนวนขายมากสุด',
  'จำนวนขายน้อยสุด'
]

const TopProducts = ({ products }: TopProductsProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sortOption, setSortOption] = useState<string>(sortOptions[0])



  const sortedProducts = useMemo(() => {
    const sorted = [...products]

    switch (sortOption) {
      case 'ยอดขายสูงสุด':
        return sorted.sort((a, b) => b.totalAmount - a.totalAmount)
      case 'ยอดขายต่ำสุด':
        return sorted.sort((a, b) => a.totalAmount - b.totalAmount)
      case 'จำนวนขายมากสุด':
        return sorted.sort((a, b) => b.totalQty - a.totalQty)
      case 'จำนวนขายน้อยสุด':
        return sorted.sort((a, b) => a.totalQty - b.totalQty)
      default:
        return sorted
    }
  }, [products, sortOption])

  return (
    <Card>
      <CardHeader
        title='สินค้าขายดี 10 อันดับ'
      />
      <CardContent className='flex flex-col'>
        {sortedProducts.map((item) => (
          <Box
            key={item.sku}
            className='flex items-center gap-4'
            sx={{
              '&:not(:last-child)': {
                pb: 4
              }
            }}
          >
            <Box
              component="img"
              src={item.imagePath || '/images/products/default-product.png'}
              alt={item.name}
              sx={{
                width: 46,
                height: 46,
                objectFit: 'cover',
                borderRadius: 1,
                flexShrink: 0
              }}
            />
            <Box className='flex flex-1 justify-between items-center min-w-0'>
              <Box className='flex flex-col min-w-0'>
                <Tooltip title={item.name} placement="top">
                  <Typography
                    className='font-medium'
                    color='text.primary'
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '180px'
                    }}
                  >
                    {item.name}
                  </Typography>
                </Tooltip>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '180px'
                  }}
                >
                  SKU: {item.sku}
                </Typography>
              </Box>
              <Box className='flex flex-col items-end ml-2'>
                <Typography className='font-medium whitespace-nowrap' color='text.primary'>
                  ฿{item.totalAmount.toLocaleString()}
                </Typography>
                <Typography variant='body2' color='text.secondary' className='whitespace-nowrap'>
                  {item.totalQty.toLocaleString()} ชิ้น
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  )
}

export default TopProducts
