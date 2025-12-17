import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DashboardMetrics } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalContracts: 0,
    contractsByStatus: {},
    totalWeightKg: 0,
    avgItemsPerBox: 0,
    contractsOverTime: [],
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchMetrics = async () => {
      try {
        setLoading(true);

        const { data: contracts, error } = await supabase
          .from('contracts')
          .select('*');

        if (error) throw error;

        const totalContracts = contracts?.length || 0;
        const contractsByStatus = contracts?.reduce((acc, contract) => {
          acc[contract.status] = (acc[contract.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        const totalWeightKg = contracts?.reduce(
          (sum, contract) => sum + parseFloat(contract.total_weight_kg?.toString() || '0'),
          0
        ) || 0;

        const avgItemsPerBox = contracts?.length
          ? contracts.reduce((sum, contract) => sum + contract.items_per_box, 0) /
            contracts.length
          : 0;

        setMetrics({
          totalContracts,
          contractsByStatus,
          totalWeightKg,
          avgItemsPerBox,
          contractsOverTime: [],
        });
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user]);

  return { metrics, loading };
}
