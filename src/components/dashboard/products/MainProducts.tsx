'use client'

import React, { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import Divider from '@mui/material/Divider';

import { Box, IconButton } from '@mui/material';

import BtnImport from "@/components/dashboard/products/btnImport";
import type { Column } from "@/components/global/EnhancedTable";
import EnhancedTable from "@/components/global/EnhancedTable";
import useProductAll from "@/actions/backend/products/useProductAll";
import useProductSearch from '@/actions/backend/products/useProductSearch';
import type { TypesProduct } from "@/types/productTypes";

import PriceEditor from '@/components/dashboard/products/priceEditor';
import EditProductDialog from './EditProductDialog';
import ProductInfoCell from './ProductInfoCell';

const columns: Column<TypesProduct>[] = [
  // { id: 'id', numeric: true, disablePadding: false, label: 'ID' },
  { id: 'sku', numeric: false, disablePadding: false, label: 'SKU' },
  {
    id: 'name', // ใช้ name เป็น id แต่จะแสดงข้อมูลรวมกัน
    numeric: false,
    disablePadding: false,
    label: 'ข้อมูลสินค้า',
    format: (value: any, row: TypesProduct) => <ProductInfoCell product={row} />
  },

  //{ id: 'stock', numeric: true, disablePadding: false, label: 'คงเหลือ' },
  { id: 'availablestock', numeric: true, disablePadding: false, label: 'พร้อมขาย' },
  {
    id: 'warehousePrice',
    numeric: true,
    disablePadding: false,
    label: 'ต้นทุน',
    format: (value: TypesProduct['warehousePrice']) => {
      if (!value?.price) return '-';

      return `${value.price.toLocaleString()}฿`;
    }
  },

  {
    id: 'active',
    numeric: false,
    disablePadding: false,
    label: 'Active',
    format: (value: boolean) => value ? 'Yes' : 'No'
  },

  /*
  {
    id: 'updatedAt',
    numeric: false,
    disablePadding: false,
    label: 'Last Updated',
    format: (value: Date) => new Date(value).toLocaleString()
  },
*/

];




const rowsPerPageOptions = [20, 100];


const MainProducts = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [orderBy, setOrderBy] = useState<keyof TypesProduct>('id');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [effectiveSearchQuery, setEffectiveSearchQuery] = useState('');

  const [editingProduct, setEditingProduct] = useState<TypesProduct | null>(null);

  const { data: allProductsData, isLoading: isLoadingAll, isError: isErrorAll, error: errorAll }
    = useProductAll(page + 1, rowsPerPage);

  const { data: searchData, isLoading: isLoadingSearch, isError: isErrorSearch, error: errorSearch }
    = useProductSearch(effectiveSearchQuery, page + 1, rowsPerPage);

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

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof TypesProduct) => {
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



  const renderActions = (row: TypesProduct) => (
    <Box sx={{
      display: 'flex',
      gap: 2,
      alignItems: 'center',
      minWidth: '400px' // ปรับความกว้างตามจำนวน price editors
    }}>
      {/**
       * <StatusSwitch items={row} />
       */}
      <Divider orientation="vertical" flexItem />
      <Box sx={{
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap'
      }}>
        {Array.isArray(row.listPrice) && row.listPrice.map((price) => (
          <PriceEditor
            key={`${row.sku}-${price.priceId}`} // ใช้ค่าที่ unique เป็น key
            sku={row.sku}
            priceId={price.priceId}
            initialPrice={price.price}
            priceName={price.priceName}
          />
        ))}
      </Box>
      <Divider orientation="vertical" flexItem />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton
          onClick={() => setEditingProduct(row)}
          size="small"
          color="primary"
        >
          <i className="tabler-edit" />
        </IconButton>

      </Box>
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

  console.log('xxx:', data);

  return (
    <>
      <h1>ข้อมูลสินค้า</h1>
      <div className="flex flex-wrap justify-between gap-2 mb-4">
        <div className='flex gap-2 items-center'>
          <BtnImport />
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

      <EnhancedTable<TypesProduct>
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

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </>
  );
}

export default MainProducts
