'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface InsightCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  type: 'success' | 'warning' | 'info' | 'danger';
  delay?: number;
}

export default function InsightCard({ title, description, icon, type, delay = 0 }: InsightCardProps) {
  const colors = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'bg-green-100 text-green-600',
      text: 'text-green-900',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'bg-amber-100 text-amber-600',
      text: 'text-amber-900',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'bg-blue-100 text-blue-600',
      text: 'text-blue-900',
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'bg-red-100 text-red-600',
      text: 'text-red-900',
    },
  };

  const style = colors[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`${style.bg} ${style.border} border rounded-lg p-4 flex gap-4`}
    >
      <div className={`${style.icon} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-semibold ${style.text} mb-1`}>{title}</h4>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </motion.div>
  );
}
