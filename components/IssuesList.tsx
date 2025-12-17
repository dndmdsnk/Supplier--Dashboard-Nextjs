'use client';

import { ContractIssue } from '@/lib/types';
import { useState } from 'react';

interface IssuesListProps {
  issues: ContractIssue[];
  onToggleResolved?: (issueId: string, resolved: boolean) => Promise<void>;
  canEdit?: boolean;
}

export default function IssuesList({
  issues,
  onToggleResolved,
  canEdit = false,
}: IssuesListProps) {
  const [filter, setFilter] = useState<'all' | 'minor' | 'major' | 'critical'>('all');

  const severityColors = {
    minor: 'bg-blue-100 text-blue-800 border-blue-300',
    major: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    critical: 'bg-red-100 text-red-800 border-red-300',
  };

  const filteredIssues =
    filter === 'all' ? issues : issues.filter((issue) => issue.severity === filter);

  if (issues.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <p className="text-gray-500">No issues reported yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-black">Issues</h3>
        <div className="flex gap-2">
          {['all', 'minor', 'major', 'critical'].map((severity) => (
            <button
              key={severity}
              onClick={() => setFilter(severity as typeof filter)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === severity
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {severity.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className={`border rounded-lg p-4 ${
              issue.resolved ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className={`font-semibold ${
                      issue.resolved ? 'text-gray-500 line-through' : 'text-black'
                    }`}
                  >
                    {issue.title}
                  </h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                      severityColors[issue.severity]
                    }`}
                  >
                    {issue.severity.toUpperCase()}
                  </span>
                </div>
                {issue.description && (
                  <p
                    className={`text-sm ${
                      issue.resolved ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {issue.description}
                  </p>
                )}
              </div>
              {canEdit && onToggleResolved && (
                <button
                  onClick={() => onToggleResolved(issue.id, !issue.resolved)}
                  className={`ml-4 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    issue.resolved
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {issue.resolved ? 'Reopen' : 'Resolve'}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {new Date(issue.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
