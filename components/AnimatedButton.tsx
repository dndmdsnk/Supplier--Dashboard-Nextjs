'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface AnimatedButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
  > {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export default function AnimatedButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const baseClasses =
    'font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-2 relative';

  const variantClasses = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400',
    secondary:
      'bg-slate-200 text-slate-900 hover:bg-slate-300 disabled:bg-gray-300',
    outline:
      'border border-slate-300 text-slate-900 hover:bg-slate-50 disabled:border-gray-300 disabled:text-gray-400',
    ghost:
      'text-slate-700 hover:bg-slate-100 disabled:text-gray-400 disabled:hover:bg-transparent',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileHover={!loading && !disabled ? { scale: 1.02 } : {}}
      whileTap={!loading && !disabled ? { scale: 0.98 } : {}}
      disabled={loading || disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...(props as any)}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      )}
      {children}
    </motion.button>
  );
}
