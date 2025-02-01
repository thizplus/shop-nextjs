'use client'

import React, { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import type { Column } from "@/components/global/EnhancedTable";
import EnhancedTable from "@/components/global/EnhancedTable";
import useProductsByPriceId from "@/actions/backend/price/inner/useProductsByPriceId";
import useProductSearchByPriceId from '@/actions/backend/price/inner/useProductSearchByPriceId';
import type { TypesProductInner } from '@/types/productTypes';
import BtnBack from '@/components/global/btnBack';
import BtnUploadCSV from '@/components/dashboard/price/inner/btnUpload';
import BtnUpdate from '@/components/dashboard/price/inner/btnUpdate';

//import { PriceUsersManager } from '@/components/dashboard/price/PriceUsersManager';
import { LiffIdManager } from '@/components/dashboard/price/LiffIdManager';



const columns: Column<TypesProductInner>[] = [

  { id: 'sku', numeric: false, disablePadding: false, label: 'SKU' },
  { id: 'name', numeric: false, disablePadding: false, label: 'ชื่อ' },
  { id: 'price', numeric: true, disablePadding: false, label: 'ราคา' },
  { id: 'stock', numeric: true, disablePadding: false, label: 'คงเหลือ' },
  { id: 'availablestock', numeric: true, disablePadding: false, label: 'พร้อมขาย' },
];

const rowsPerPageOptions = [20, 100];

type PropsMainInner = {
  params: { id: string }
}

const MainInner = ({ params }: PropsMainInner) => {

  const priceId = params.id;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [orderBy, setOrderBy] = useState<keyof TypesProductInner>('sku');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [effectiveSearchQuery, setEffectiveSearchQuery] = useState('');

  const { data: allProductsData, isLoading: isLoadingAll, isError: isErrorAll, error: errorAll }
    = useProductsByPriceId(priceId as string, page + 1, rowsPerPage);

  const { data: searchData, isLoading: isLoadingSearch, isError: isErrorSearch, error: errorSearch }
    = useProductSearchByPriceId(priceId as string, effectiveSearchQuery, page + 1, rowsPerPage);

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

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof TypesProductInner) => {
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

  const renderActions = (row: TypesProductInner) => (
    <>
      <BtnUpdate items={row} priceId={priceId} />
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
      <h1>ราคา: {data.priceName} [{data.priceId}]</h1>
      <div className="flex flex-wrap justify-between gap-2 mb-4">
        <div className='flex gap-2 items-center'>
          <BtnBack url="/dashboard/price" />
          <BtnUploadCSV priceId={data.priceId} priceName={data.priceName} />
        </div>
        <div className='flex gap-2 items-center'>


          <TextField
            label="ค้นหาจาก SKU หรือ ชื่อสินค้า"
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

      <div className="mb-6 grid grid-cols-1 gap-4">

        <LiffIdManager
          priceId={data.priceId}
          priceName={data.priceName}
        />

      </div>

      <EnhancedTable<TypesProductInner>
        columns={columns}
        data={data.items}
        getRowId={(row) => row.sku}
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

export default MainInner
