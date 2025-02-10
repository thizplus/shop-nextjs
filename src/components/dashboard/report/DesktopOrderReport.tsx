// components/DesktopOrderReport.tsx
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';


import type { ReportResponse, DailyReport, OrderDetail } from '@/actions/backend/orders/useOrderReport';
import { formatNumber } from '@/components/global/functions/numberFormat';
import { formatDateReport } from '@/components/global/functions/formatDateReport';
import OrderStatistics from './OrderStatistics';


interface Props {
  data: ReportResponse;
  onSelectOrder: (orderId: string) => void;
}


const DesktopOrderReport = ({ data, onSelectOrder }: Props) => {
  return (
    <>
      {/* สรุปรวม */}
      <OrderStatistics
        totalOrders={data.summary.totalOrders}
        totalNetAmount={data.summary.totalNetAmount}
        totalCost={data.summary.totalCost}
        totalNetProfit={data.summary.totalNetProfit}
        totalWarehouseFees={data.summary.totalWarehouseFees}
      />

      {/* รายการรายวัน */}
      <Grid item xs={12}>
        {data.dailyReports.map((daily: DailyReport) => (
          <Accordion key={daily.date} defaultExpanded={true}>
            <AccordionSummary
              expandIcon={
                <i className="tabler-chevron-down text-lg text-gray-400" />
              }
            >
              <div className='flex gap-4'>
                <p>
                  {daily.date}
                </p> |

                <p>
                  จำนวนออเดอร์: <span className='text-primary font-bold'>{daily.summary.totalOrders} รายการ</span>
                </p> |

                <p>
                  กำไรสุทธิ: <span className='text-success font-bold'>{formatNumber(daily.summary.totalNetProfit)}฿</span>
                </p>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>เวลาที่สั่งซื้อ</TableCell>
                      <TableCell>เลขที่คำสั่งซื้อ</TableCell>
                      <TableCell>ลูกค้า</TableCell>
                      <TableCell align="right">ยอดขายสุทธิ</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>ต้นทุนสุทธิ</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>กำไรสุทธิ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {daily.orders.map((order: OrderDetail) => {
                      // คำนวณต้นทุนสุทธิ (รวมค่าคลัง)
                      const totalNetCost = (order.profitInfo?.totalCost || 0) +
                        (order.warehouseFees?.totalFees || 0);

                      return (
                        <TableRow
                          key={order.orderId}
                          hover
                          className="cursor-pointer"
                          onClick={() => onSelectOrder(order.orderId)}
                        >
                          <TableCell>{formatDateReport(order.createdAt)}</TableCell>
                          <TableCell>{order.orderId}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell align="right">{formatNumber(order.netTotal)}</TableCell>
                          <TableCell align="right" sx={{ color: 'error.main' }}>
                            {formatNumber(totalNetCost)}
                          </TableCell>
                          <TableCell align="right" sx={{ color: 'success.main' }}>
                            {formatNumber(order.profitInfo?.netProfit || 0)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {/* แถวสรุปท้ายตาราง */}
                    <TableRow
                      sx={{
                        '& td': {
                          fontWeight: 'bold',
                          backgroundColor: 'action.selected'
                        }
                      }}
                    >
                      <TableCell colSpan={3}>รวมประจำวัน</TableCell>
                      <TableCell align="right">{formatNumber(daily.summary.totalNetAmount)}</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        {formatNumber(daily.summary.totalCost + daily.summary.totalWarehouseFees)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        {formatNumber(daily.summary.totalNetProfit)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}
      </Grid>
    </>
  );
};

export default DesktopOrderReport;
