import { useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import Pagination from '@mui/material/Pagination'

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

const TopProducts = ({ products }: TopProductsProps) => {
  const [page, setPage] = useState(1)
  const itemsPerPage = 5

  // เรียงลำดับสินค้าตามยอดขายสูงสุด
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => b.totalAmount - a.totalAmount)
  }, [products])

  // คำนวณข้อมูลสำหรับหน้าปัจจุบัน
  const currentProducts = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage


    return sortedProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedProducts, page])

  // คำนวณจำนวนหน้าทั้งหมด
  const pageCount = Math.ceil(products.length / itemsPerPage)
  const showPagination = products.length > itemsPerPage

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  return (
    <Card className='md:min-h-96'>
      <CardHeader
        title={`สินค้าขายดี (${products.length} รายการ)`}
      />
      <CardContent className='flex flex-col'>
        {currentProducts.map((item) => (
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
                width: 34,
                height: 34,
                objectFit: 'cover',
                borderRadius: 1,
                flexShrink: 0
              }}
            />
            <Box className='flex flex-1 justify-between items-center min-w-0'>
              <Box className='flex flex-col min-w-0'>
                <Tooltip title={item.name} placement="top">
                  <Typography
                    className='font-medium text-sm leading-none'
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
                  className='text-xs'
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
                <Typography className='font-medium whitespace-nowrap leading-none text-sm' color='text.primary'>
                  ฿{item.totalAmount.toLocaleString()}
                </Typography>
                <Typography variant='body2' color='text.secondary' className='whitespace-nowrap text-xs'>
                  {item.totalQty.toLocaleString()} ชิ้น
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}

        {/* Pagination - แสดงเฉพาะเมื่อมีข้อมูลเกิน itemsPerPage */}
        {showPagination && (
          <div className='flex justify-center'>
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

export default TopProducts
