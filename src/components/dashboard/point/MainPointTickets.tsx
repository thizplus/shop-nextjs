// components/dashboard/points/MainPointTickets.tsx
'use client'

import React, { useState } from 'react';

import { Switch, FormControlLabel } from '@mui/material';

import type { Column } from "@/components/global/EnhancedTable";
import EnhancedTable from "@/components/global/EnhancedTable";
import { formatNumber } from '@/components/global/functions/numberFormat';
import { TicketType } from "@/types/pointTypes";
import type { IPointTicket } from "@/types/pointTypes";

import DialogCreatePointTicket from './DialogCreatePointTicket';
import { usePointTickets, useToggleTicketStatus } from '@/actions/backend/point/usePointTickets';
import PointSettingManager from './PointSettingManager';

// กำหนด columns สำหรับตาราง
const columns: Column<IPointTicket>[] = [
  {
    id: 'name',
    numeric: false,
    disablePadding: false,
    label: 'ชื่อตั๋ว'
  },
  {
    id: 'type',
    numeric: false,
    disablePadding: false,
    label: 'ประเภท',
    format: (value: TicketType) => value === TicketType.CART ? 'ส่วนลดสินค้า' : 'ส่วนลดค่าจัดส่ง'
  },
  {
    id: 'pointCost',
    numeric: true,
    disablePadding: false,
    label: 'ราคาพอยต์',
    format: (value) => `${formatNumber(value)}`
  },
  {
    id: 'discountValue',
    numeric: true,
    disablePadding: false,
    label: 'มูลค่าส่วนลด',
    format: (value) => `${formatNumber(value)}`
  },
  {
    id: 'expiresInDays',
    numeric: true,
    disablePadding: false,
    label: 'อายุการใช้งาน',
    format: (value) => `${value} วัน`
  },
  {
    id: 'isActive',
    numeric: false,
    disablePadding: false,
    label: 'สถานะ',
    format: (value) => value ? 'ใช้งาน' : 'ปิดใช้งาน'
  }
];

const rowsPerPageOptions = [20, 100];

const MainPointTickets = () => {
  // States
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [orderBy, setOrderBy] = useState<keyof IPointTicket>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Queries
  const {
    data,
    isLoading,
    isError,
    error
  } = usePointTickets(page + 1, rowsPerPage);

  const toggleMutation = useToggleTicketStatus();

  // Handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof IPointTicket) => {
    const isAsc = orderBy === property && order === 'asc';

    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleToggleStatus = async (ticketId: string) => {
    try {
      await toggleMutation.mutateAsync(ticketId);
    } catch (error) {
      console.error('Failed to toggle ticket status:', error);
    }
  };

  // Render Action Button
  const renderActions = (row: IPointTicket) => (
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

  // Loading and Error States
  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  if (isError) return <div>Error: {error instanceof Error ? error.message : 'An unknown error occurred'}</div>;

  if (!data || !Array.isArray(data.items)) {
    return <div>Error: Invalid data received from the server</div>;
  }

  return (
    <>
      <div className=" mb-4">
        <h1>ตั๋วแลกพอยต์</h1>
        <PointSettingManager />
      </div>

      <div className='flex justify-between mb-4'>
        <DialogCreatePointTicket />
      </div>

      <EnhancedTable<IPointTicket>
        columns={columns}
        data={data.items}
        getRowId={(row) => row._id?.toString() || ''}
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
};

export default MainPointTickets;
