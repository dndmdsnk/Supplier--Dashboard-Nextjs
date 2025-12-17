'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface EfficiencyChartProps {
  totalItems: number;
  totalWeight: number;
  avgItemsPerBox: number;
  avgWeightPerContract: number;
}

export default function EfficiencyChart({
  totalItems,
  totalWeight,
  avgItemsPerBox,
  avgWeightPerContract
}: EfficiencyChartProps) {
  const data = [
    {
      category: 'Volume',
      Items: totalItems,
      Weight: totalWeight,
    },
    {
      category: 'Averages',
      'Items/Box': avgItemsPerBox,
      'Weight/Contract': avgWeightPerContract,
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-lg">
          <p className="font-semibold text-slate-900 mb-2">{payload[0].payload.category}</p>
          <div className="space-y-1 text-sm">
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }}>
                {entry.name}: <span className="font-bold">{entry.value.toLocaleString()}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const getEfficiencyInsight = () => {
    const itemsPerKg = totalWeight > 0 ? (totalItems / totalWeight).toFixed(2) : 0;

    if (Number(itemsPerKg) > 10) {
      return `High packing efficiency: ${itemsPerKg} items per kg suggests lightweight, well-optimized packaging.`;
    } else if (Number(itemsPerKg) > 5) {
      return `Balanced packing ratio: ${itemsPerKg} items per kg indicates standard packaging efficiency.`;
    } else if (Number(itemsPerKg) > 0) {
      return `Heavy items detected: ${itemsPerKg} items per kg may indicate opportunities for packaging optimization.`;
    }
    return 'Insufficient data for efficiency analysis.';
  };

  const getBoxOptimizationInsight = () => {
    if (avgItemsPerBox > 100) {
      return 'Large box capacity allows for bulk shipping, reducing per-unit shipping costs.';
    } else if (avgItemsPerBox > 50) {
      return 'Moderate box capacity provides balance between protection and efficiency.';
    } else if (avgItemsPerBox > 0) {
      return 'Small box packing may increase handling costs but ensures better item protection.';
    }
    return 'No packing data available.';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white border border-slate-200 rounded-xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Operational Efficiency Analysis</h3>
        <p className="text-sm text-slate-600">Compare volume metrics and identify optimization opportunities</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="category"
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
          <Bar dataKey="Items" fill="#2563eb" name="Total Items" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Weight" fill="#10b981" name="Total Weight (kg)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Items/Box" fill="#f59e0b" name="Avg Items per Box" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Weight/Contract" fill="#8b5cf6" name="Avg Weight per Contract (kg)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-900 mb-1">Packing Efficiency</p>
          <p className="text-xs text-blue-700">{getEfficiencyInsight()}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs font-medium text-amber-900 mb-1">Box Optimization</p>
          <p className="text-xs text-amber-700">{getBoxOptimizationInsight()}</p>
        </div>
      </div>
    </motion.div>
  );
}
