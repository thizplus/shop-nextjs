// components/dashboard/dailyPayment/MainDailyPayment.tsx
'use client'

import React, { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import type { Column } from "@/components/global/EnhancedTable";
import EnhancedTable from "@/components/global/EnhancedTable";
import { formatNumber } from '@/components/global/functions/numberFormat';
import formatThaiDateTime from '@/components/global/functions/formatThaiDateTime';
import StatusLabel from '@/components/global/statusLabel';
import type { IDailyPayment } from '@/types/dailyPayment';
import { useDailyPayment, useDailyPaymentSearch } from '@/actions/backend/dailyPayment/useDailyPayment';
import DialogDetail from './DialogDetail';
import DialogPayment from './DialogPayment';


const columns: Column<IDailyPayment>[] = [
  {
    id: 'docId',
    numeric: false,
    disablePadding: false,
    label: 'เลขที่เอกสาร'
  },
  {
    id: 'totalAmount',
    numeric: true,
    disablePadding: false,
    label: 'ยอดรวม',
    format: (value: number) => formatNumber(value)
  },
  {
    id: 'payment',
    numeric: false,
    disablePadding: false,
    label: 'สถานะ',
    format: (value) => (
      <StatusLabel status={value.status} />
    )
  },
  {
    id: 'createdAt',
    numeric: false,
    disablePadding: false,
    label: 'วันที่สร้าง',
    format: (value) => formatThaiDateTime(value)
  }
];

const rowsPerPageOptions = [20, 50];

const MainDailyPayment = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [orderBy, setOrderBy] = useState<keyof IDailyPayment>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [effectiveSearchQuery, setEffectiveSearchQuery] = useState('');

  const { data: allPaymentsData, isLoading: isLoadingAll, isError: isErrorAll, error: errorAll }
    = useDailyPayment(page + 1, rowsPerPage);

  const { data: searchData, isLoading: isLoadingSearch, isError: isErrorSearch, error: errorSearch }
    = useDailyPaymentSearch(effectiveSearchQuery, page + 1, rowsPerPage);

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

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof IDailyPayment) => {
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

  const renderActions = (row: IDailyPayment) => (
    <div className='flex gap-2'>
      <DialogDetail payment={row} />
      <DialogPayment payment={row} />
    </div>
  );

  const isLoading = isSearching ? isLoadingSearch : isLoadingAll;
  const isError = isSearching ? isErrorSearch : isErrorAll;
  const error = isSearching ? errorSearch : errorAll;
  const data = isSearching ? searchData : allPaymentsData;

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error instanceof Error ? error.message : 'An unknown error occurred'}</div>;

  if (!data || !Array.isArray(data.items)) {
    return <div>Error: Invalid data received from the server</div>;
  }

  return (
    <>
      <h1>รายการเรียกเก็บเงิน</h1>
      <div className="flex flex-wrap justify-between gap-2 mb-4">
        <div className='flex gap-2 items-center'>
          <TextField
            label="ค้นหาจากเลขที่เอกสาร"
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

      <EnhancedTable<IDailyPayment>
        columns={columns}
        data={data.items}
        getRowId={(row) => row._id.toString()}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        totalItems={data.totalItems}
        orderBy={orderBy}
        order={order}
        onRequestSort={handleRequestSort}
        renderRowActions={renderActions}
      />
    </>
  );
}

export default MainDailyPayment;
