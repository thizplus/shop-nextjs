// components/MobileOrderReport.tsx
import { useState } from 'react';



import type { ReportResponse, DailyReport, OrderDetail } from '@/actions/backend/orders/useOrderReport';
import { formatNumber } from '@/components/global/functions/numberFormat';
import { formatDateReport } from '@/components/global/functions/formatDateReport';
import OrderStatistics from './OrderStatistics';

interface Props {
  data: ReportResponse;
  onSelectOrder: (orderId: string) => void;
}



const MobileOrderReport = ({ data, onSelectOrder }: Props) => {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  return (
    <div>
      {/* สรุปรวม */}
      <OrderStatistics
        totalOrders={data.summary.totalOrders}
        totalNetAmount={data.summary.totalNetAmount}
        totalCost={data.summary.totalCost}
        totalNetProfit={data.summary.totalNetProfit}
        totalWarehouseFees={data.summary.totalWarehouseFees}
      />

      <div className="space-y-2">
        {data.dailyReports.map((daily: DailyReport) => (
          <div key={daily.date} className="bg-white rounded-lg border shadow-sm">
            {/* หัวข้อวัน */}
            <div
              className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedDay(expandedDay === daily.date ? null : daily.date)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className=' leading-tight'>
                    <span className="text-base font-medium block">
                      {daily.date}
                    </span>
                    <span className="text-sm text-gray-500">
                      {daily.summary.totalOrders} รายการ
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">

                  <span className="text-gray-400 transition-transform duration-200 ease-in-out">
                    {expandedDay === daily.date ? <i className='tabler-chevron-up' /> : <i className='tabler-chevron-down' />}
                  </span>
                </div>
              </div>
            </div>

            {/* รายละเอียดออเดอร์ */}
            {expandedDay === daily.date && (
              <div className="border-t divide-y divide-gray-100">
                {daily.orders.map((order: OrderDetail) => {
                  const totalNetCost = (order.profitInfo?.totalCost || 0) +
                    (order.warehouseFees?.totalFees || 0);

                  return (
                    <div
                      key={order.orderId}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => onSelectOrder(order.orderId)}
                    >
                      <div className="flex justify-between items-start">
                        <div className=' leading-none'>
                          <p className="font-medium block">
                            {order.orderId}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.customerName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDateReport(order.createdAt)}
                          </p>

                        </div>


                        <div className="grid grid-cols-1 gap-0 text-sm text-right leading-tight">
                          <div className="items-center bg-primary.light rounded">
                            <span className="text-gray-600">ยอดขาย : </span>
                            <span className="text-primary font-medium">
                              {formatNumber(order.netTotal)}฿
                            </span>
                          </div>
                          <div className="items-center bg-error.light rounded">
                            <span className="text-gray-600">ต้นทุน : </span>
                            <span className="text-error font-medium">
                              {formatNumber(totalNetCost)}฿
                            </span>
                          </div>
                          <div className="items-center bg-success.light rounded">
                            <span className="text-gray-600">กำไร : </span>
                            <span className="text-success font-medium">
                              {formatNumber(order.profitInfo?.netProfit || 0)}฿
                            </span>
                          </div>
                        </div>


                      </div>


                    </div>
                  );
                })}

                {/* สรุปประจำวัน */}
                <div className="p-4 bg-info.light">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <span className="text-sm text-gray-600 block">ยอดขาย</span>
                      <span className="text-primary.main font-medium">
                        ฿{formatNumber(daily.summary.totalNetAmount)}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-gray-600 block">ต้นทุน</span>
                      <span className="text-error.main font-medium">
                        ฿{formatNumber(daily.summary.totalCost + daily.summary.totalWarehouseFees)}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-gray-600 block">กำไร</span>
                      <span className="text-success.main font-medium">
                        ฿{formatNumber(daily.summary.totalNetProfit)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default MobileOrderReport;
