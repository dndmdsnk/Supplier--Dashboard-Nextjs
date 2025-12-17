'use client';

import { useState } from 'react';
import { Contract } from '@/lib/types';
import { validateQRCodeFile } from '@/lib/storage';

interface ContractFormData {
  title: string;
  total_quantity: number;
  box_size: string;
  items_per_box: number;
  total_weight_kg: number;
  status: string;
  metadata: {
    skus?: Array<{ sku: string; qty: number }>;
  };
}

interface ContractFormProps {
  initialData?: Partial<Contract>;
  onSubmit: (data: ContractFormData, qrFile?: File) => Promise<void>;
  onCancel?: () => void;
}

export default function ContractForm({
  initialData,
  onSubmit,
  onCancel,
}: ContractFormProps) {
  const [formData, setFormData] = useState<ContractFormData>({
    title: initialData?.title || '',
    total_quantity: initialData?.total_quantity || 0,
    box_size: initialData?.box_size || '',
    items_per_box: initialData?.items_per_box || 0,
    total_weight_kg: initialData?.total_weight_kg || 0,
    status: initialData?.status || 'draft',
    metadata: initialData?.metadata || {},
  });

  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(
    initialData?.qr_code || null
  );
  const [qrFileError, setQrFileError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['total_quantity', 'items_per_box', 'total_weight_kg'].includes(name)
        ? parseFloat(value) || 0
        : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setQrFileError('');

    if (file) {
      const validation = validateQRCodeFile(file);

      if (!validation.valid) {
        setQrFileError(validation.error || 'Invalid file');
        setQrFile(null);
        setQrPreview(null);
        e.target.value = '';
        return;
      }

      setQrFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title || formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (formData.total_quantity < 1) {
      newErrors.total_quantity = 'Quantity must be at least 1';
    }
    if (!formData.box_size) {
      newErrors.box_size = 'Box size is required';
    }
    if (formData.items_per_box < 1) {
      newErrors.items_per_box = 'Items per box must be at least 1';
    }
    if (formData.total_weight_kg <= 0) {
      newErrors.total_weight_kg = 'Weight must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData, qrFile || undefined);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contract Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., April 2026 T-Shirts"
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Quantity *
          </label>
          <input
            type="number"
            name="total_quantity"
            value={formData.total_quantity}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
              errors.total_quantity ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="12000"
            min="1"
          />
          {errors.total_quantity && (
            <p className="text-red-500 text-xs mt-1">{errors.total_quantity}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Items per Box *
          </label>
          <input
            type="number"
            name="items_per_box"
            value={formData.items_per_box}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
              errors.items_per_box ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="50"
            min="1"
          />
          {errors.items_per_box && (
            <p className="text-red-500 text-xs mt-1">{errors.items_per_box}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Box Size *
          </label>
          <input
            type="text"
            name="box_size"
            value={formData.box_size}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
              errors.box_size ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="60x40x40 cm"
          />
          {errors.box_size && <p className="text-red-500 text-xs mt-1">{errors.box_size}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Weight (kg) *
          </label>
          <input
            type="number"
            name="total_weight_kg"
            value={formData.total_weight_kg}
            onChange={handleChange}
            step="0.01"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
              errors.total_weight_kg ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="850.50"
            min="0.01"
          />
          {errors.total_weight_kg && (
            <p className="text-red-500 text-xs mt-1">{errors.total_weight_kg}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option value="draft">Draft</option>
          <option value="preparing">Preparing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          QR Code *
        </label>
        <div className="space-y-2">
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={handleFileChange}
            disabled={submitting}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              qrFileError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <p className="text-xs text-gray-500">
            Allowed: PNG, JPEG, SVG. Max size: 2MB
          </p>
          {qrFileError && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293z" clipRule="evenodd" />
              </svg>
              {qrFileError}
            </p>
          )}
          {qrPreview && (
            <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <img
                src={qrPreview}
                alt="QR Code Preview"
                className="w-40 h-40 object-contain border-2 border-gray-300 rounded-lg bg-white mx-auto"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:bg-gray-300"
        >
          {submitting ? 'Saving...' : initialData ? 'Update Contract' : 'Create Contract'}
        </button>
      </div>
    </form>
  );
}
