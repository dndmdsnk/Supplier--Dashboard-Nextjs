'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProgressStepper from '@/components/ProgressStepper';
import IssuesList from '@/components/IssuesList';
import { supabase } from '@/lib/supabaseClient';
import { Contract, ContractIssue } from '@/lib/types';

export default function ContractDetailPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [issues, setIssues] = useState<ContractIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueSeverity, setIssueSeverity] = useState<'minor' | 'major' | 'critical'>('minor');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && contractId) {
      fetchContract();
      fetchIssues();
    }
  }, [user, contractId]);

  const fetchContract = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (error) throw error;
      setContract(data);
    } catch (error) {
      console.error('Failed to fetch contract:', error);
      alert('Failed to load contract');
      router.push('/contracts');
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_issues')
        .select('*')
        .eq('contract_id', contractId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    }
  };

  const handleUpdateProgress = async (progress: number, status: string) => {
    if (!contract) return;

    try {
      const { error } = await supabase
        .from('contracts')
        .update({ progress, status, updated_at: new Date().toISOString() })
        .eq('id', contract.id);

      if (error) throw error;

      setContract({ ...contract, progress, status: status as Contract['status'] });

      await supabase.from('audit_logs').insert([
        {
          user_id: user?.id,
          action: 'update_progress',
          resource: 'contract',
          resource_id: contract.id,
          metadata: { progress, status },
        },
      ]);
    } catch (error) {
      console.error('Failed to update progress:', error);
      throw error;
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !contract) return;

    try {
      const { data, error } = await supabase
        .from('contract_issues')
        .insert([
          {
            contract_id: contract.id,
            reported_by: user.id,
            title: issueTitle,
            description: issueDescription,
            severity: issueSeverity,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setIssues([data, ...issues]);
      setShowIssueForm(false);
      setIssueTitle('');
      setIssueDescription('');
      setIssueSeverity('minor');
    } catch (error) {
      console.error('Failed to create issue:', error);
      alert('Failed to create issue');
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

  if (authLoading || loading || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    preparing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-yellow-100 text-yellow-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/contracts')}
            className="text-red-500 hover:text-red-600 font-medium mb-4"
          >
            ← Back to Contracts
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">{contract.title}</h1>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  statusColors[contract.status]
                }`}
              >
                {contract.status.toUpperCase()}
              </span>
            </div>
            {contract.qr_code && (
              <img
                src={contract.qr_code}
                alt="QR Code"
                className="w-24 h-24 border border-gray-200 rounded-lg"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-black mb-4">Contract Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">Total Quantity</span>
                  <p className="font-semibold text-lg text-black">
                    {contract.total_quantity.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Weight</span>
                  <p className="font-semibold text-lg text-black">
                    {contract.total_weight_kg} kg
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Box Size</span>
                  <p className="font-semibold text-lg text-black">{contract.box_size}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Items per Box</span>
                  <p className="font-semibold text-lg text-black">
                    {contract.items_per_box}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Created</span>
                  <p className="font-semibold text-black">
                    {new Date(contract.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Last Updated</span>
                  <p className="font-semibold text-black">
                    {new Date(contract.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              {isAdmin && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowIssueForm(!showIssueForm)}
                    className="w-full px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    {showIssueForm ? 'Cancel' : '+ Report Issue'}
                  </button>

                  {showIssueForm && (
                    <form
                      onSubmit={handleCreateIssue}
                      className="mt-4 bg-white border border-gray-200 rounded-xl p-6"
                    >
                      <h3 className="text-lg font-bold text-black mb-4">New Issue</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            value={issueTitle}
                            onChange={(e) => setIssueTitle(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={issueDescription}
                            onChange={(e) => setIssueDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Severity
                          </label>
                          <select
                            value={issueSeverity}
                            onChange={(e) =>
                              setIssueSeverity(e.target.value as typeof issueSeverity)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          >
                            <option value="minor">Minor</option>
                            <option value="major">Major</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          className="w-full px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                        >
                          Create Issue
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              <IssuesList
                issues={issues}
                onToggleResolved={isAdmin ? handleToggleResolved : undefined}
                canEdit={isAdmin}
              />
            </div>
          </div>

          <div>
            <ProgressStepper
              currentProgress={contract.progress}
              currentStatus={contract.status}
              onUpdate={handleUpdateProgress}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
