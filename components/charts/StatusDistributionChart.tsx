'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { StatusDistribution } from '@/lib/hooks/useAnalytics';
import { motion } from 'framer-motion';

interface StatusDistributionChartProps {
  data: StatusDistribution[];
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8',
  preparing: '#2563eb',
  shipped: '#f59e0b',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

export default function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const chartData = data.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    percentage: item.percentage,
    items: item.total_items,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-lg">
          <p className="font-semibold text-slate-900 mb-2">{payload[0].name}</p>
          <div className="space-y-1 text-sm">
            <p className="text-slate-600">
              Contracts: <span className="font-bold">{payload[0].value}</span>
            </p>
            <p className="text-slate-600">
              Percentage: <span className="font-bold">{payload[0].payload.percentage}%</span>
            </p>
            <p className="text-slate-600">
              Total Items: <span className="font-bold">{payload[0].payload.items.toLocaleString()}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white border border-slate-200 rounded-xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Contract Status Distribution</h3>
        <p className="text-sm text-slate-600">Current breakdown of all contracts by status</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[data[index].status] || '#64748b'}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
        {data.map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: STATUS_COLORS[item.status] }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 capitalize truncate">
                {item.status}
              </p>
              <p className="text-xs text-slate-500">
                {item.count} ({item.percentage}%)
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">Insight:</span> {
            data.find(d => d.status === 'delivered')?.percentage || 0 > 50
              ? 'Strong delivery performance - over half of contracts completed'
              : data.find(d => d.status === 'cancelled')?.percentage || 0 > 20
              ? 'High cancellation rate detected - review supplier processes'
              : 'Most contracts in progress - monitor timelines closely'
          }
        </p>
      </div>
    </motion.div>
  );
}
