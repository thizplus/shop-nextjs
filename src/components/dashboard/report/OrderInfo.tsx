import React, { useState } from 'react';

import { Switch, FormControlLabel, Grid } from '@mui/material';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import OptionMenu from '@core/components/option-menu';
import CustomAvatar from '@core/components/mui/Avatar';

// Define interfaces for data structures
interface Product {
  sku: string;
  name: string;
  totalQty: number;
  totalAmount: number;
  imgSrc?: string;
}

interface Customer {
  name: string;
  phone: string;
  orderCount: number;
  totalAmount: number;
  avatar?: string;
}

interface Category {
  name: string;
  totalAmount: number;
  amountDiff?: 'positive' | 'negative';
  avatarColor?: 'primary' | 'success' | 'error' | 'secondary' | 'info';
  avatarIcon?: string;
}

interface OrderInfoData {
  topProducts?: Product[];
  topCategories?: Category[];
  topCustomers?: Customer[];
}

interface OrderInfoProps {
  startDate: Date | null;
  endDate: Date | null;
  data?: OrderInfoData;
}

// Props interfaces for sub-components
interface TopProductsProps {
  products?: Product[];
  dateRange?: string;
}

interface TopCustomersProps {
  customers?: Customer[];
  dateRange?: string;
}

interface TopCategoriesProps {
  categories?: Category[];
  dateRange?: string;
}

const OrderInfo: React.FC<OrderInfoProps> = ({ startDate, endDate, data }) => {
  const [showTopProducts, setShowTopProducts] = useState<boolean>(false);
  const [showTopCategories, setShowTopCategories] = useState<boolean>(false);
  const [showTopCustomers, setShowTopCustomers] = useState<boolean>(false);

  const dateRangeText = `${startDate?.toLocaleDateString()} - ${endDate?.toLocaleDateString()}`;

  // Component สำหรับแสดงสินค้าขายดี
  const TopProducts: React.FC<TopProductsProps> = ({ products }) => (
    <Card>
      <CardHeader
        title="สินค้าขายดี"
        subheader={`ข้อมูลระหว่างวันที่ ${dateRangeText}`}
        action={<OptionMenu options={['จำนวนขาย - น้อยไปมาก', 'จำนวนขาย - มากไปน้อย', 'ยอดขายสูงสุด']} />}
      />
      <CardContent className="flex flex-col gap-[1.625rem]">
        {products?.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <img
              src={item.imgSrc || '/images/products/default.png'}
              alt={item.name}
              width={46}
            />
            <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-1 is-full">
              <div className="flex flex-col">
                <Typography className="font-medium" color="text.primary">
                  {item.name}
                </Typography>
                <Typography variant="body2">{`SKU: ${item.sku}`}</Typography>
              </div>
              <div className="flex flex-col items-end">
                <Typography className="font-medium">
                  {item.totalQty} ชิ้น
                </Typography>
                <Typography variant="body2">
                  ฿{item.totalAmount.toLocaleString()}
                </Typography>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  // Component สำหรับแสดงลูกค้าที่ซื้อมากที่สุด
  const TopCustomers: React.FC<TopCustomersProps> = ({ customers }) => (
    <Card className="bs-full">
      <CardHeader
        title="ลูกค้าที่สั่งซื้อมากที่สุด"
        subheader={`ข้อมูลระหว่างวันที่ ${dateRangeText}`}
        action={<OptionMenu options={['Refresh', 'Export', 'Share']} />}
      />
      <CardContent className="flex flex-col gap-4">
        {customers?.map((item, i) => (
          <div key={i} className="flex items-center gap-4">
            <CustomAvatar
              size={34}
              src={item.avatar || `/images/avatars/${(i % 6) + 1}.png`}
            />
            <div className="flex justify-between items-center is-full gap-4">
              <div>
                <Typography className="font-medium" color="text.primary">
                  {item.name}
                </Typography>
                <Typography variant="body2">{item.phone}</Typography>
              </div>
              <div className="text-right">
                <Typography className="font-medium" color="text.primary">
                  {item.orderCount} ออเดอร์
                </Typography>
                <Typography variant="body2">
                  ฿{item.totalAmount.toLocaleString()}
                </Typography>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  // Component สำหรับแสดงหมวดหมู่ขายดี
  const TopCategories: React.FC<TopCategoriesProps> = ({ categories }) => (
    <Card>
      <CardHeader
        title="หมวดหมู่สินค้าขายดี"
        subheader={`ข้อมูลระหว่างวันที่ ${dateRangeText}`}
        action={<OptionMenu options={['ยอดขายสูงสุด', 'จำนวนออเดอร์']} />}
      />
      <CardContent className="flex flex-col gap-[1.125rem]">
        {categories?.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <CustomAvatar skin="light" variant="rounded" color={item.avatarColor || 'primary'} size={34}>
              <i className={`${item.avatarIcon || 'tabler-category'} text-[22px]`} />
            </CustomAvatar>
            <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-1 is-full">
              <div className="flex flex-col">
                <Typography className="font-medium" color="text.primary">
                  {item.name}
                </Typography>
              </div>
              <Typography
                variant="h6"
                color={`${item.amountDiff === 'negative' ? 'error' : 'success'}.main`}
              >
                ฿{item.totalAmount.toLocaleString()}
              </Typography>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full mt-4">
      <Grid container spacing={2} className="mb-4">
        <Grid item xs={12} sm={4}>
          <FormControlLabel
            control={
              <Switch
                checked={showTopProducts}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowTopProducts(e.target.checked)}
              />
            }
            label="แสดงสินค้าขายดี"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControlLabel
            control={
              <Switch
                checked={showTopCategories}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowTopCategories(e.target.checked)}
              />
            }
            label="แสดงหมวดหมู่ขายดี"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControlLabel
            control={
              <Switch
                checked={showTopCustomers}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowTopCustomers(e.target.checked)}
              />
            }
            label="แสดงลูกค้าที่สั่งซื้อมากที่สุด"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {showTopProducts && (
          <Grid item xs={12} md={4}>
            <TopProducts products={data?.topProducts} />
          </Grid>
        )}
        {showTopCategories && (
          <Grid item xs={12} md={4}>
            <TopCategories categories={data?.topCategories} />
          </Grid>
        )}
        {showTopCustomers && (
          <Grid item xs={12} md={4}>
            <TopCustomers customers={data?.topCustomers} />
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default OrderInfo;
