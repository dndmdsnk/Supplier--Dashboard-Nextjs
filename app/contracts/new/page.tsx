'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ContractForm from '@/components/ContractForm';
import { supabase } from '@/lib/supabaseClient';
import { uploadQRCode } from '@/lib/storage';

export default function NewContractPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (formData: any, qrFile?: File) => {
    if (!user) return;

    try {
      const contractData = {
        ...formData,
        supplier_id: user.id,
        qr_code: null,
      };

      const { data: contract, error: insertError } = await supabase
        .from('contracts')
        .insert([contractData])
        .select()
        .single();

      if (insertError) throw insertError;

      if (qrFile && contract) {
        const qrUrl = await uploadQRCode(qrFile, contract.id, user.id);
        if (qrUrl) {
          await supabase
            .from('contracts')
            .update({ qr_code: qrUrl })
            .eq('id', contract.id);
        }
      }

      await supabase.from('audit_logs').insert([
        {
          user_id: user.id,
          action: 'create',
          resource: 'contract',
          resource_id: contract.id,
          metadata: { title: formData.title },
        },
      ]);

      router.push('/contracts');
    } catch (error) {
      console.error('Failed to create contract:', error);
      alert('Failed to create contract. Please try again.');
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/contracts')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Contracts
          </button>

          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Create New Contract
          </h1>
          <p className="text-slate-600 text-lg">
            Set up a new shipping contract with detailed specifications
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white border border-slate-200 rounded-xl p-8"
        >
          <ContractForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/contracts')}
          />
        </motion.div>
      </main>
    </div>
  );
}
