'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedStatCardProps {
  label: string;
  value: number | string;
  unit?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'red';
  delay?: number;
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  amber: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-600',
};

export default function AnimatedStatCard({
  label,
  value,
  unit,
  icon,
  color,
  delay = 0,
}: AnimatedStatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof value !== 'number') return;

    const duration = 2;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, (duration * 1000) / steps);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, boxShadow: '0 20px 25px rgba(0,0,0,0.1)' }}
      className="bg-white border border-slate-200 rounded-xl p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-slate-900">
              {typeof value === 'number'
                ? displayValue.toLocaleString()
                : value}
            </p>
            {unit && (
              <span className="text-lg text-slate-500 font-medium">{unit}</span>
            )}
          </div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay }}
          className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
            colorClasses[color]
          }`}
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  );
}
