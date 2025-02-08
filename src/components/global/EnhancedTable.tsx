import React, { useState, useMemo } from 'react';

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow,
  TableSortLabel, Paper, Checkbox, Box, FormControlLabel, Switch, useMediaQuery, useTheme
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

export interface Column<T> {
  id: keyof T | 'actions';
  numeric: boolean;
  disablePadding: boolean;
  label: string;
  format?: (value: any, row: T) => React.ReactNode;
  hideOnMobile?: boolean; // เพิ่มตัวเลือกสำหรับซ่อนคอลัมน์บนมือถือ
}

export interface EnhancedTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowId: (row: T) => string;
  page: number;
  rowsPerPage: number;
  rowsPerPageOptions: number[];
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  totalItems: number;
  orderBy: keyof T;
  order: 'asc' | 'desc';
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof T) => void;
  renderRowActions?: (row: T) => React.ReactNode;
  selected?: readonly string[];
  onSelectChange?: (newSelected: readonly string[]) => void;
}

export default function EnhancedTable<T extends Record<string, any>>(props: EnhancedTableProps<T>) {
  const {
    columns,
    data,
    getRowId,
    page,
    rowsPerPage,
    rowsPerPageOptions,
    onPageChange,
    onRowsPerPageChange,
    totalItems,
    orderBy,
    order,
    onRequestSort,
    renderRowActions,
    selected = [],
    onSelectChange
  } = props;

  const [dense, setDense] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectChange) return;

    if (event.target.checked) {
      const newSelected = data.map((n) => getRowId(n).toString());

      onSelectChange(newSelected);

      return;
    }

    onSelectChange([]);
  };

  const handleCheckboxClick = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    event.stopPropagation();
    if (!onSelectChange) return;

    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    onSelectChange(newSelected);
  };

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const isAsc = order === 'asc';

      if (a[orderBy] < b[orderBy]) return isAsc ? -1 : 1;
      if (a[orderBy] > b[orderBy]) return isAsc ? 1 : -1;

      return 0;
    });
  }, [data, order, orderBy]);

  // ต่อจาก code ด้านบน...

  // กรองคอลัมน์ที่จะแสดงตาม device
  const visibleColumns = isMobile
    ? columns.filter(col => !col.hideOnMobile)
    : columns;

  const renderMobileView = () => (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          {sortedData.map((row) => {
            const isItemSelected = isSelected(getRowId(row).toString());

            return (
              <Paper
                key={getRowId(row)}
                elevation={1}
                sx={{
                  mb: 2,
                  p: 2,
                  backgroundColor: isItemSelected ? 'action.selected' : 'background.paper'
                }}
              >
                {onSelectChange && (
                  <Box sx={{ mb: 1 }}>
                    <Checkbox
                      checked={isItemSelected}
                      onChange={(event) => {
                        const id = getRowId(row).toString();

                        const newSelected = event.target.checked
                          ? [...selected, id]
                          : selected.filter(item => item !== id);

                        onSelectChange(newSelected);
                      }}
                    />
                  </Box>
                )}

                {visibleColumns.map((column) => (
                  <Box
                    key={column.id as string}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: 1,
                      borderColor: 'divider'
                    }}
                  >
                    <Box component="span" sx={{ fontWeight: 'medium', mr: 2 }}>
                      {column.label}
                    </Box>
                    <Box sx={{ textAlign: column.numeric ? 'right' : 'left' }}>
                      {column.format
                        ? column.format(row[column.id], row)
                        : row[column.id]
                      }
                    </Box>
                  </Box>
                ))}

                {renderRowActions && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    {renderRowActions(row)}
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {isMobile ? (
        renderMobileView()
      ) : (
        <Paper sx={{ width: '100%', mb: 2 }}>
          <TableContainer>
            <Table
              sx={{ minWidth: 750 }}
              aria-labelledby="tableTitle"
              size={dense ? 'small' : 'medium'}
            >
              <TableHead>
                <TableRow>
                  {onSelectChange && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        indeterminate={selected.length > 0 && selected.length < data.length}
                        checked={data.length > 0 && selected.length === data.length}
                        onChange={handleSelectAllClick}
                        inputProps={{
                          'aria-label': 'select all items',
                        }}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={column.id as string}
                      align={column.numeric ? 'right' : 'left'}
                      padding={column.disablePadding ? 'none' : 'normal'}
                      sortDirection={orderBy === column.id ? order : false}
                    >
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={(event) => onRequestSort(event, column.id)}
                      >
                        {column.label}
                        {orderBy === column.id ? (
                          <Box component="span" sx={visuallyHidden}>
                            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                          </Box>
                        ) : null}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  {renderRowActions && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map((row, index) => {
                  const isItemSelected = isSelected(getRowId(row).toString());
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={getRowId(row)}
                      selected={isItemSelected}
                    >
                      {onSelectChange && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            onClick={(event) => handleCheckboxClick(event, getRowId(row).toString())}
                            inputProps={{
                              'aria-labelledby': labelId,
                            }}
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell key={column.id as string} align={column.numeric ? 'right' : 'left'}>
                          {column.format
                            ? column.format(row[column.id], row)
                            : row[column.id]
                          }
                        </TableCell>
                      ))}
                      {renderRowActions && (
                        <TableCell>
                          {renderRowActions(row)}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={rowsPerPageOptions}
            component="div"
            count={totalItems}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </Paper>
      )}
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
    </Box>
  );
}
