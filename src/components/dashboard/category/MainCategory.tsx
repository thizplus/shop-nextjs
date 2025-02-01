'use client'

import React, { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';


import { Box } from '@mui/material';

import type { Column } from "@/components/global/EnhancedTable";
import EnhancedTable from "@/components/global/EnhancedTable";


import useCategoryAll from '@/actions/backend/category/useCategoryAll';
import useCategorySearch from '@/actions/backend/category/useCategorySearch';
import type { TypesCategory } from "@/types/categoryTypes";
import StatusSwitch from '@/components/dashboard/category/StatusSwitch';
import EditCategoryDialog from './EditCategoryDialog';
import CreateCategoryDialog from './CreateCategoryDialog';


const columns: Column<TypesCategory>[] = [
  { id: 'catId', numeric: true, disablePadding: false, label: 'รหัส' },
  { id: 'name', numeric: false, disablePadding: false, label: 'ชื่อ' },
  { id: 'description', numeric: false, disablePadding: false, label: 'รายละเอียด' },
  {
    id: 'updatedAt',
    numeric: false,
    disablePadding: false,
    label: 'อัพเดท',
    format: (value: Date) => new Date(value).toLocaleString()
  },
];

const rowsPerPageOptions = [20, 100];


const MainCategory = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [orderBy, setOrderBy] = useState<keyof TypesCategory>('catId');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [effectiveSearchQuery, setEffectiveSearchQuery] = useState('');

  const { data: allProductsData, isLoading: isLoadingAll, isError: isErrorAll, error: errorAll }
    = useCategoryAll(page + 1, rowsPerPage);

  const { data: searchData, isLoading: isLoadingSearch, isError: isErrorSearch, error: errorSearch }
    = useCategorySearch(effectiveSearchQuery, page + 1, rowsPerPage);

  useEffect(() => {
    console.log('Environment variables:', {
      SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
      APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME
    });
  }, []);

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

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof TypesCategory) => {
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



  const renderActions = (row: TypesCategory) => (
    <Box sx={{
      display: 'flex',
      gap: 2,
      alignItems: 'center',
    }}>
      <StatusSwitch items={row} />
      <EditCategoryDialog category={row} />
    </Box>
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
      <h1>หมวดหมู่สินค้า</h1>
      <div className="flex flex-wrap justify-between gap-2 mb-4">

        <div className='flex gap-2 items-center'>
          <CreateCategoryDialog />
        </div>

        <div className='flex gap-2 items-center'>
          <TextField
            label="ค้นหาจากชื่อหมวดหมู่"
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

      <EnhancedTable<TypesCategory>
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


export default MainCategory
