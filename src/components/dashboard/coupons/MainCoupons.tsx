// components/dashboard/coupons/MainCoupons.tsx
'use client'

import React, { useEffect, useState } from 'react';

import {
  Button,
  TextField,
  Switch, FormControlLabel
} from '@mui/material';

import type { Column } from "@/components/global/EnhancedTable";
import EnhancedTable from "@/components/global/EnhancedTable";
import { formatNumber } from '@/components/global/functions/numberFormat';
import formatThaiDateTime from '@/components/global/functions/formatThaiDateTime';
import type { ICoupon } from "@/types/couponTypes";
import useCouponsAll from '@/actions/backend/coupons/useCouponsAll';
import useCouponsSearch from '@/actions/backend/coupons/useCouponsSearch';
import DialogCreateCoupon from './DialogCreateCoupon';
import useToggleCouponStatus from '@/actions/backend/coupons/useToggleCouponStatus';

const columns: Column<ICoupon>[] = [
  {
    id: 'code',
    numeric: false,
    disablePadding: false,
    label: 'Code'
  },
  {
    id: 'type',
    numeric: false,
    disablePadding: false,
    label: 'ประเภท',
    format: (value) => value === 'cart' ? 'ส่วนลดสินค้า' : 'ส่วนลดค่าจัดส่ง'
  },
  {
    id: 'value',
    numeric: true,
    disablePadding: false,
    label: 'มูลค่า',
    format: (value) => `${formatNumber(value)}`
  },
  {
    id: 'usageCount',
    numeric: true,
    disablePadding: false,
    label: 'ใช้แล้ว',
    format: (value) => `${value}`
  },
  {
    id: 'startDate',
    numeric: false,
    disablePadding: false,
    label: 'วันที่เริ่ม',
    format: (value) => formatThaiDateTime(value.toString())
  },
  {
    id: 'endDate',
    numeric: false,
    disablePadding: false,
    label: 'วันที่สิ้นสุด',
    format: (value) => formatThaiDateTime(value.toString())
  },
  {
    id: 'isActive',
    numeric: false,
    disablePadding: false,
    label: 'สถานะ',
    format: (value) => value ? 'ใช้งาน' : 'ปิดใช้งาน'
  }
];

const rowsPerPageOptions = [20, 50];

const MainCoupons = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [orderBy, setOrderBy] = useState<keyof ICoupon>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [effectiveSearchQuery, setEffectiveSearchQuery] = useState('');



  const { data: allCouponsData, isLoading: isLoadingAll, isError: isErrorAll, error: errorAll }
    = useCouponsAll(page + 1, rowsPerPage);

  const { data: searchData, isLoading: isLoadingSearch, isError: isErrorSearch, error: errorSearch }
    = useCouponsSearch(effectiveSearchQuery, page + 1, rowsPerPage);

  console.log('allCouponsData:', allCouponsData)

  useEffect(() => {
    if (!isSearching) {
      setEffectiveSearchQuery('');
    }
  }, [isSearching]);



  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof ICoupon) => {
    const isAsc = orderBy === property && order === 'asc';

    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      setEffectiveSearchQuery(searchQuery.trim());
      setPage(0);
    }
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setEffectiveSearchQuery('');
    setPage(0);
  };

  const toggleCouponMutation = useToggleCouponStatus();

  const handleToggleStatus = async (couponId: string) => {
    try {
      await toggleCouponMutation.mutateAsync(couponId);
    } catch (error) {
      console.error('Failed to toggle coupon status:', error);
    }
  };

  const renderActions = (row: ICoupon) => (
    <div className='flex gap-2'>
      <FormControlLabel
        control={
          <Switch
            checked={row.isActive}
            onChange={() => handleToggleStatus(row._id.toString())}
            color={row.isActive ? 'success' : 'error'}
          />
        }
        label={row.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
      />
    </div>
  );

  const isLoading = isSearching ? isLoadingSearch : isLoadingAll;
  const isError = isSearching ? isErrorSearch : isErrorAll;
  const error = isSearching ? errorSearch : errorAll;
  const data = isSearching ? searchData : allCouponsData;

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error instanceof Error ? error.message : 'An unknown error occurred'}</div>;

  if (!data || !Array.isArray(data.items)) {
    console.log('Received data:', data); // เพิ่ม log เพื่อดูโครงสร้างข้อมูลที่ได้

    return <div>Error: Invalid data received from the server</div>;
  }



  return (
    <>
      <div className="flex justify-between mb-4">
        <h1>คูปองส่วนลด</h1>
      </div>

      <div className='flex justify-between'>

        <DialogCreateCoupon />
        <div className="flex flex-wrap justify-between gap-2 mb-4">
          <div className='flex gap-2 items-center'>
            <TextField
              label="ค้นหาจากรหัส"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{
                '& .MuiInputBase-root': {
                  height: '40px',
                },
                '& .MuiInputLabel-root': {
                  transform: 'translate(14px, 8px) scale(1)',
                  '&.MuiInputLabel-shrink': {
                    transform: 'translate(14px, -6px) scale(0.75)',
                  },
                },
              }}
            />
            <Button
              variant='contained'
              color='primary'
              onClick={handleSearch}
              startIcon={<i className='tabler-search' />}
            >
              ค้นหา
            </Button>
            {isSearching && (
              <Button
                variant="outlined"
                onClick={handleResetSearch}
              >
                ล้างค่า
              </Button>
            )}
          </div>
        </div>
      </div>

      <EnhancedTable<ICoupon>
        columns={columns}
        data={data?.items || []}  // เพิ่ม optional chaining
        getRowId={(row) => row._id?.toString() || ''}  // ป้องกัน _id เป็น undefined
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        totalItems={data?.totalItems || 0}  // เพิ่ม optional chaining
        orderBy={orderBy}
        order={order}
        onRequestSort={handleRequestSort}
        renderRowActions={renderActions}
      />
    </>
  );
};

export default MainCoupons;
