'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'text' | 'avatar' | 'stats';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({
  variant = 'card',
  count = 1,
  className = '',
}: SkeletonLoaderProps) {
  const skeletons = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {skeletons.map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-200 rounded-xl p-6"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <div className="animate-shimmer h-6 bg-slate-200 rounded w-3/4" />
                  <div className="animate-shimmer h-4 bg-slate-100 rounded w-1/2" />
                </div>
                <div className="animate-shimmer h-16 w-16 bg-slate-200 rounded-full flex-shrink-0" />
              </div>
              <div className="space-y-2">
                <div className="animate-shimmer h-4 bg-slate-100 rounded" />
                <div className="animate-shimmer h-4 bg-slate-100 rounded w-5/6" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <div className="animate-shimmer h-10 bg-slate-200 rounded flex-1" />
                <div className="animate-shimmer h-10 bg-slate-100 rounded flex-1" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {skeletons.map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-4"
          >
            <div className="animate-shimmer h-12 w-12 bg-slate-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="animate-shimmer h-4 bg-slate-200 rounded w-3/4" />
              <div className="animate-shimmer h-3 bg-slate-100 rounded w-1/2" />
            </div>
            <div className="animate-shimmer h-8 w-16 bg-slate-100 rounded flex-shrink-0" />
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`space-y-3 ${className}`}>
        {skeletons.map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-2"
          >
            <div className="animate-shimmer h-4 bg-slate-200 rounded w-full" />
            <div className="animate-shimmer h-4 bg-slate-100 rounded w-5/6" />
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={`flex gap-3 ${className}`}>
        {skeletons.map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="animate-shimmer h-10 w-10 bg-slate-200 rounded-full flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  if (variant === 'stats') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {skeletons.map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-200 rounded-xl p-6"
          >
            <div className="space-y-3">
              <div className="animate-shimmer h-4 bg-slate-100 rounded w-2/3" />
              <div className="flex items-center justify-between">
                <div className="animate-shimmer h-8 bg-slate-200 rounded w-1/3" />
                <div className="animate-shimmer h-12 w-12 bg-slate-100 rounded-lg" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return null;
}
