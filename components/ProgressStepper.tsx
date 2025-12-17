'use client';

import { useState } from 'react';

interface ProgressStepperProps {
  currentProgress: number;
  currentStatus: string;
  onUpdate: (progress: number, status: string) => Promise<void>;
  disabled?: boolean;
}

const statuses = [
  { value: 'draft', label: 'Draft', progress: 0 },
  { value: 'preparing', label: 'Preparing', progress: 25 },
  { value: 'shipped', label: 'Shipped', progress: 75 },
  { value: 'delivered', label: 'Delivered', progress: 100 },
];

export default function ProgressStepper({
  currentProgress,
  currentStatus,
  onUpdate,
  disabled = false,
}: ProgressStepperProps) {
  const [progress, setProgress] = useState(currentProgress);
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);

  const handleStatusClick = async (newStatus: string, defaultProgress: number) => {
    if (disabled || updating) return;
    setStatus(newStatus);
    setProgress(defaultProgress);
  };

  const handleProgressChange = (value: number) => {
    if (disabled) return;
    setProgress(value);
  };

  const handleSave = async () => {
    if (disabled || updating) return;
    setUpdating(true);
    try {
      await onUpdate(progress, status);
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setUpdating(false);
    }
  };

  const hasChanges = progress !== currentProgress || status !== currentStatus;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-bold text-black mb-6">Update Progress</h3>

      <div className="mb-6">
        <div className="flex justify-between mb-3">
          {statuses.map((s, index) => {
            const isActive = s.value === status;
            const isPast =
              statuses.findIndex((st) => st.value === status) >
              statuses.findIndex((st) => st.value === s.value);

            return (
              <button
                key={s.value}
                onClick={() => handleStatusClick(s.value, s.progress)}
                disabled={disabled || updating}
                className={`flex-1 relative ${
                  index < statuses.length - 1 ? 'mr-2' : ''
                }`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      isActive
                        ? 'bg-red-500 text-white'
                        : isPast
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isPast ? '✓' : index + 1}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isActive ? 'text-black' : 'text-gray-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Progress: {progress}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => handleProgressChange(parseInt(e.target.value))}
          disabled={disabled || updating}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
        />
      </div>

      {hasChanges && (
        <button
          onClick={handleSave}
          disabled={disabled || updating}
          className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:bg-gray-300"
        >
          {updating ? 'Saving...' : 'Save Changes'}
        </button>
      )}
    </div>
  );
}
