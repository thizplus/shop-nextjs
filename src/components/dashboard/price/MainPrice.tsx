'use client'

import React, { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import BtnCreatePrice from "@/components/dashboard/price/btnCreatePrice";
import type { Column } from "@/components/global/EnhancedTable";
import EnhancedTable from "@/components/global/EnhancedTable";

import type { TypePriceList } from "@/types/priceListTypes";

import BtnDeletePrice from '@/components/dashboard/price/btnDeletePrice';
import BtnEdit from '@/components/dashboard/price/btnEdit';
import { usePriceLists, usePriceListSearch } from '@/actions/backend/priceList/usePriceList';

const columns: Column<TypePriceList>[] = [

  { id: 'priceId', numeric: false, disablePadding: false, label: 'รหัส' },
  { id: 'priceName', numeric: false, disablePadding: false, label: 'ชื่อ' },
  {
    id: 'updatedAt',
    numeric: false,
    disablePadding: false,
    label: 'อัพเดท',
    format: (value: Date) => new Date(value).toLocaleString()
  },
];

const rowsPerPageOptions = [20, 50];


const MainPrice = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [orderBy, setOrderBy] = useState<keyof TypePriceList>('_id');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [effectiveSearchQuery, setEffectiveSearchQuery] = useState('');

  const { data: allProductsData, isLoading: isLoadingAll, isError: isErrorAll, error: errorAll }
    = usePriceLists(page + 1, rowsPerPage);

  const { data: searchData, isLoading: isLoadingSearch, isError: isErrorSearch, error: errorSearch }
    = usePriceListSearch(effectiveSearchQuery, page + 1, rowsPerPage);

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

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof TypePriceList) => {
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

  const renderActions = (row: TypePriceList) => (
    <>
      <BtnEdit items={row} />
      <BtnDeletePrice items={row} />


    </>
  );

  const isLoading = isSearching ? isLoadingSearch : isLoadingAll;
  const isError = isSearching ? isErrorSearch : isErrorAll;
  const error = isSearching ? errorSearch : errorAll;
  const data = isSearching ? searchData : allProductsData;

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error instanceof Error ? error.message : 'An unknown error occurred'}</div>;

  if (!data || !Array.isArray(data.items)) {
    console.error('Invalid data received:', data);

    return <div>Error: Invalid data received from the server</div>;
  }

  return (
    <>
      <h1>ราคาสินค้า</h1>
      <div className="flex flex-wrap justify-between gap-2 mb-4">
        <div className='flex gap-2 items-center'>
          <BtnCreatePrice listItems={data.items} />
        </div>
        <div className='flex gap-2 items-center'>
          <TextField
            label="ค้นหาเรทราคา"
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

      <EnhancedTable<TypePriceList>
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


export default MainPrice
