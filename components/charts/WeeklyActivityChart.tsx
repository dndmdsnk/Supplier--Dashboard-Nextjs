'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WeeklyActivity } from '@/lib/hooks/useAnalytics';
import { motion } from 'framer-motion';

interface WeeklyActivityChartProps {
  data: WeeklyActivity[];
}

export default function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  const reversedData = [...data].reverse();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-lg">
          <p className="font-semibold text-slate-900 mb-2">Week of {payload[0].payload.week_label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600">
              Activities: <span className="font-bold">{payload[0].value}</span>
            </p>
            <p className="text-green-600">
              Active Users: <span className="font-bold">{payload[0].payload.active_users}</span>
            </p>
            <p className="text-amber-600">
              Contracts Updated: <span className="font-bold">{payload[0].payload.affected_contracts}</span>
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
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white border border-slate-200 rounded-xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Weekly Activity Trends</h3>
        <p className="text-sm text-slate-600">User activity and engagement over the past 12 weeks</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={reversedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="week_label"
            stroke="#64748b"
            style={{ fontSize: '11px' }}
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
          <Bar
            dataKey="activity_count"
            fill="#2563eb"
            name="Total Activities"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">Insight:</span> {
            reversedData.length >= 2 ? (
              reversedData[reversedData.length - 1].activity_count > reversedData[reversedData.length - 2].activity_count
                ? `Activity increased by ${Math.round(((reversedData[reversedData.length - 1].activity_count - reversedData[reversedData.length - 2].activity_count) / reversedData[reversedData.length - 2].activity_count) * 100)}% this week - high engagement`
                : reversedData[reversedData.length - 1].activity_count < reversedData[reversedData.length - 2].activity_count
                ? `Activity decreased by ${Math.round(((reversedData[reversedData.length - 2].activity_count - reversedData[reversedData.length - 1].activity_count) / reversedData[reversedData.length - 2].activity_count) * 100)}% this week - monitor engagement`
                : 'Activity levels consistent week-over-week'
            ) : 'Building activity history...'
          }
        </p>
      </div>
    </motion.div>
  );
}
