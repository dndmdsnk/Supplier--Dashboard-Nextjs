'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import EmptyState from './EmptyState';
import SkeletonLoader from './SkeletonLoader';

interface ActivityLog {
  id: number;
  user_id: string | null;
  resource_id: string | null;
  action: string;
  resource: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  create: <span>✅</span>,
  update: <span>✏️</span>,
  delete: <span>🗑️</span>,
  update_progress: <span>🔄</span>,
  status_change: <span>📊</span>,
};

const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  update: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  delete: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  update_progress: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  status_change: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
};

interface ActivityFeedProps {
  limit?: number;
  contractId?: string;
}

export default function ActivityFeed({ limit = 10, contractId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (contractId) {
          query = query.eq('resource_id', contractId);
        }

        const { data, error: fetchError, status } = await query;

        if (fetchError) {
          if (status === 403) {
            setError('You do not have permission to view these activities.');
          } else {
            setError('Failed to fetch activities. Please try again.');
          }
          setActivities([]);
          return;
        }

        setActivities(data ?? []);
      } catch (err) {
        console.error('Unexpected fetch error:', err);
        setError('An unexpected error occurred.');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user, limit, contractId]);

  if (loading) return <SkeletonLoader variant="list" count={3} />;

  if (error)
    return (
      <div className="p-4 text-red-600 text-sm font-medium bg-red-100 dark:bg-red-900 dark:text-red-200 rounded">
        {error}
      </div>
    );

  if (!activities.length)
    return (
      <EmptyState
        icon={<span>📭</span>}
        title="No activity yet"
        description="Activities will appear here as you make changes to your contracts."
      />
    );

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="flex gap-4 pb-4 last:pb-0 border-b last:border-b-0 border-slate-800 dark:border-slate-700"
        >
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              actionColors[activity.action] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-700'
            }`}
          >
            {actionIcons[activity.action] || <span>ℹ️</span>}
          </div>

          <div className="flex-grow min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-700">
              {activity.action.replace(/_/g, ' ')} {activity.resource}
              {activity.metadata?.title && ` - ${activity.metadata.title}`}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {new Date(activity.created_at).toLocaleDateString()} at{' '}
              {new Date(activity.created_at).toLocaleTimeString()}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
