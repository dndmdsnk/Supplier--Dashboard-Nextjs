export type UserRole = 'supplier' | 'admin';

export interface Contract {
  id: string;
  supplier_id: string;
  title: string;
  total_quantity: number;
  box_size: string;
  items_per_box: number;
  total_weight_kg: number;
  qr_code?: string;
  status: 'draft' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  progress: number;
  metadata: {
    skus?: Array<{ sku: string; qty: number }>;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}

export interface ContractIssue {
  id: string;
  contract_id: string;
  reported_by: string;
  title: string;
  description?: string;
  severity: 'minor' | 'major' | 'critical';
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: string;
  action: string;
  resource: string;
  resource_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DashboardMetrics {
  totalContracts: number;
  contractsByStatus: Record<string, number>;
  totalWeightKg: number;
  avgItemsPerBox: number;
  contractsOverTime: Array<{ date: string; count: number }>;
}
