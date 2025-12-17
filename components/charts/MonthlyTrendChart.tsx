'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthlyTrend } from '@/lib/hooks/useAnalytics';
import { motion } from 'framer-motion';

interface MonthlyTrendChartProps {
  data: MonthlyTrend[];
  type?: 'line' | 'bar';
}

export default function MonthlyTrendChart({ data, type = 'line' }: MonthlyTrendChartProps) {
  const reversedData = [...data].reverse();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-lg">
          <p className="font-semibold text-slate-900 mb-2">{payload[0].payload.month_label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600">
              Contracts: <span className="font-bold">{payload[0].value}</span>
            </p>
            <p className="text-green-600">
              Delivered: <span className="font-bold">{payload[0].payload.delivered_count}</span>
            </p>
            <p className="text-slate-600">
              Items: <span className="font-bold">{payload[0].payload.total_items.toLocaleString()}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white border border-slate-200 rounded-xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Monthly Contract Trends</h3>
        <p className="text-sm text-slate-600">Track contract volume and delivery performance over time</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {type === 'line' ? (
          <LineChart data={reversedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="month_label"
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="contract_count"
              stroke="#2563eb"
              strokeWidth={2}
              name="Total Contracts"
              dot={{ fill: '#2563eb', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="delivered_count"
              stroke="#10b981"
              strokeWidth={2}
              name="Delivered"
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        ) : (
          <BarChart data={reversedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="month_label"
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="rect"
            />
            <Bar dataKey="contract_count" fill="#2563eb" name="Total Contracts" />
            <Bar dataKey="delivered_count" fill="#10b981" name="Delivered" />
          </BarChart>
        )}
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">Insight:</span> {
            reversedData.length >= 2 ? (
              reversedData[reversedData.length - 1].contract_count > reversedData[reversedData.length - 2].contract_count
                ? `Contracts increased by ${Math.round(((reversedData[reversedData.length - 1].contract_count - reversedData[reversedData.length - 2].contract_count) / reversedData[reversedData.length - 2].contract_count) * 100)}% this month`
                : reversedData[reversedData.length - 1].contract_count < reversedData[reversedData.length - 2].contract_count
                ? `Contracts decreased by ${Math.round(((reversedData[reversedData.length - 2].contract_count - reversedData[reversedData.length - 1].contract_count) / reversedData[reversedData.length - 2].contract_count) * 100)}% this month`
                : 'Contract volume remained stable this month'
            ) : 'Insufficient data for trend analysis'
          }
        </p>
      </div>
    </motion.div>
  );
}
