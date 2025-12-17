'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabaseClient';
import { ContractIssue } from '@/lib/types';
import Link from 'next/link';

export default function AdminIssuesPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<
    (ContractIssue & { contract_title?: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchIssues();
    }
  }, [user, isAdmin]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const { data: issuesData, error } = await supabase
        .from('contract_issues')
        .select('*, contracts(title)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedIssues = issuesData?.map((issue: any) => ({
        ...issue,
        contract_title: issue.contracts?.title,
      })) || [];

      setIssues(formattedIssues);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResolved = async (issueId: string, resolved: boolean) => {
    try {
      const { error } = await supabase
        .from('contract_issues')
        .update({ resolved, updated_at: new Date().toISOString() })
        .eq('id', issueId);

      if (error) throw error;

      setIssues(
        issues.map((issue) =>
          issue.id === issueId ? { ...issue, resolved } : issue
        )
      );
    } catch (error) {
      console.error('Failed to update issue:', error);
      alert('Failed to update issue');
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (!confirm('Are you sure you want to delete this issue?')) return;

    try {
      const { error } = await supabase
        .from('contract_issues')
        .delete()
        .eq('id', issueId);

      if (error) throw error;

      setIssues(issues.filter((issue) => issue.id !== issueId));
    } catch (error) {
      console.error('Failed to delete issue:', error);
      alert('Failed to delete issue');
    }
  };

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'all') return true;
    if (filter === 'unresolved') return !issue.resolved;
    if (filter === 'resolved') return issue.resolved;
    return true;
  });

  const severityColors = {
    minor: 'bg-blue-100 text-blue-800 border-blue-300',
    major: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    critical: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Manage Issues</h1>
          <p className="text-gray-600">
            View and manage all issues across all contracts
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({issues.length})
            </button>
            <button
              onClick={() => setFilter('unresolved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'unresolved'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unresolved ({issues.filter((i) => !i.resolved).length})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'resolved'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Resolved ({issues.filter((i) => i.resolved).length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <p className="text-gray-500">No issues found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className={`bg-white border rounded-xl p-6 ${
                  issue.resolved ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3
                        className={`text-lg font-bold ${
                          issue.resolved ? 'text-gray-500 line-through' : 'text-black'
                        }`}
                      >
                        {issue.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                          severityColors[issue.severity]
                        }`}
                      >
                        {issue.severity.toUpperCase()}
                      </span>
                      {issue.resolved && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          RESOLVED
                        </span>
                      )}
                    </div>
                    {issue.description && (
                      <p
                        className={`text-sm mb-2 ${
                          issue.resolved ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {issue.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Contract:{' '}
                        <Link
                          href={`/contracts/${issue.contract_id}`}
                          className="text-red-500 hover:text-red-600 font-medium"
                        >
                          {issue.contract_title || 'Unknown'}
                        </Link>
                      </span>
                      <span>
                        {new Date(issue.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleToggleResolved(issue.id, !issue.resolved)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        issue.resolved
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {issue.resolved ? 'Reopen' : 'Resolve'}
                    </button>
                    <button
                      onClick={() => handleDeleteIssue(issue.id)}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
