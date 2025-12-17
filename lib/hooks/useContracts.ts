import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Contract } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export function useContracts(ownOnly: boolean = false) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  const fetchContracts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (ownOnly && !isAdmin && user) {
        query = query.eq('supplier_id', user.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setContracts(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contracts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContracts();
    }
  }, [user, ownOnly]);

  return { contracts, loading, error, refetch: fetchContracts };
}
