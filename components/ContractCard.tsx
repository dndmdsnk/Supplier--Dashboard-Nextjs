'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Contract } from '@/lib/types';

interface ContractCardProps {
  contract: Contract;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  delay?: number;
}

export default function ContractCard({
  contract,
  onDelete,
  showActions = true,
  delay = 0,
}: ContractCardProps) {
  const statusColors = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    preparing: 'bg-blue-100 text-blue-700 border-blue-200',
    shipped: 'bg-amber-100 text-amber-700 border-amber-200',
    delivered: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };

  const progressColor = contract.progress < 50 ? 'text-red-500' : 'text-green-500';

  const getProgressIcon = () => {
    if (contract.progress === 100) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={showActions ? { y: -4 } : {}}
      className="bg-white border border-slate-200 rounded-xl p-6 transition-shadow hover:shadow-md"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 mb-2 truncate">
            {contract.title}
          </h3>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.1 }}
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
              statusColors[contract.status]
            }`}
          >
            {contract.status.charAt(0).toUpperCase() +
              contract.status.slice(1)}
          </motion.span>
        </div>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="flex flex-col items-center flex-shrink-0 ml-4"
        >
          <div
            className={`w-16 h-16 rounded-full border-4 flex items-center justify-center relative ${
              progressColor === 'text-green-500'
                ? 'border-green-500'
                : 'border-red-500'
            }`}
          >
            <div className="absolute inset-0 rounded-full flex items-center justify-center flex-col">
              {getProgressIcon() ? (
                getProgressIcon()
              ) : (
                <>
                  <span className="text-xs font-bold text-slate-600">
                    {contract.progress}%
                  </span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4 py-4 border-y border-slate-100">
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">
            Quantity
          </p>
          <p className="font-semibold text-slate-900">
            {contract.total_quantity.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">
            Weight
          </p>
          <p className="font-semibold text-slate-900">
            {contract.total_weight_kg} kg
          </p>
        </div>
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">
            Box Size
          </p>
          <p className="font-semibold text-slate-900">{contract.box_size}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">
            Items/Box
          </p>
          <p className="font-semibold text-slate-900">{contract.items_per_box}</p>
        </div>
      </div>

      {showActions && (
        <div className="flex gap-2 pt-4">
          <Link href={`/contracts/${contract.id}`} className="flex-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              View
            </motion.button>
          </Link>
          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDelete(contract.id)}
              className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Delete
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
}
