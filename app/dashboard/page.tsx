'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import AnimatedStatCard from '@/components/AnimatedStatCard';
import ContractCard from '@/components/ContractCard';
import ActivityFeed from '@/components/ActivityFeed';
import SkeletonLoader from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';
import { useContracts } from '@/lib/hooks/useContracts';
import { useDashboardMetrics } from '@/lib/hooks/useDashboardMetrics';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { contracts, loading: contractsLoading } = useContracts(true);
  const { metrics, loading: metricsLoading } = useDashboardMetrics();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading...</p>
        </motion.div>
      </div>
    );
  }

  const recentContracts = contracts.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600 text-lg">
            Welcome back! Here's an overview of your supply chain activity.
          </p>
        </motion.div>

        {metricsLoading ? (
          <SkeletonLoader variant="stats" count={4} className="mb-8" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AnimatedStatCard
              label="Total Contracts"
              value={metrics.totalContracts}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 1 1 0 000-2H3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1 1 1 0 000-2h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h6a1 1 0 000-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              color="blue"
              delay={0}
            />
            <AnimatedStatCard
              label="Total Weight"
              value={Math.round(metrics.totalWeightKg)}
              unit="kg"
              icon={
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 1a1 1 0 000 2c5.57 0 10.15 5.314 10.15 11.892C13.15 16.686 8.57 22 3 22a1 1 0 100 2c7.732 0 14-5.373 14-12.108C17 6.314 10.732 1 3 1z" />
                </svg>
              }
              color="green"
              delay={0.1}
            />
            <AnimatedStatCard
              label="Avg Items/Box"
              value={Math.round(metrics.avgItemsPerBox)}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              }
              color="amber"
              delay={0.2}
            />
            <AnimatedStatCard
              label="Active Contracts"
              value={
                (metrics.contractsByStatus.preparing || 0) +
                (metrics.contractsByStatus.shipped || 0)
              }
              icon={
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.062v6.372a3.066 3.066 0 01-2.812 3.062 3.066 3.066 0 01-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 01-1.745-.723 3.066 3.066 0 01-2.812-3.062V6.517a3.066 3.066 0 012.812-3.062zm7.958 5.953a1 1 0 00-1.414-1.414L7 10.586 5.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              color="blue"
              delay={0.3}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white border border-slate-200 rounded-xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Recent Contracts
                </h2>
                <Link
                  href="/contracts"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  View All →
                </Link>
              </div>

              {contractsLoading ? (
                <SkeletonLoader variant="card" count={3} />
              ) : recentContracts.length === 0 ? (
                <EmptyState
                  icon={
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  }
                  title="No contracts yet"
                  description="Create your first contract to get started managing your shipments."
                  action={{
                    label: "Create Contract",
                    href: "/contracts/new",
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {recentContracts.map((contract, index) => (
                    <motion.div
                      key={contract.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    >
                      <ContractCard
                        contract={contract}
                        showActions={false}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white border border-slate-200 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Recent Activity
            </h2>
            <ActivityFeed limit={5} />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
