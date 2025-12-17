/*
  # Supplier Dashboard - Database Schema

  ## Overview
  This migration creates the core tables for the Supplier Dashboard application where suppliers
  can upload shipping contracts and admins can manage issues.

  ## 1. New Tables

  ### `contracts`
  Main table for shipping contracts uploaded by suppliers.
  - `id` (uuid, primary key) - Unique identifier
  - `supplier_id` (uuid) - References auth.users, the supplier who created this contract
  - `title` (text) - Contract title/description
  - `total_quantity` (integer) - Total number of items
  - `box_size` (text) - Dimensions of shipping boxes
  - `items_per_box` (integer) - Number of items per box
  - `total_weight_kg` (numeric) - Total weight in kilograms
  - `qr_code_url` (text) - URL to QR code image in storage
  - `status` (text) - Current status: draft, preparing, shipped, delivered, cancelled
  - `progress` (integer) - Progress percentage (0-100)
  - `metadata` (jsonb) - Flexible field for SKUs, colors, sizes
  - `created_at` (timestamptz) - Timestamp of creation
  - `updated_at` (timestamptz) - Timestamp of last update

  ### `contract_issues`
  Issues reported by admins on contracts.
  - `id` (uuid, primary key) - Unique identifier
  - `contract_id` (uuid) - References contracts table
  - `reported_by` (uuid) - Admin who reported the issue
  - `title` (text) - Issue title
  - `description` (text) - Detailed description
  - `severity` (text) - minor, major, or critical
  - `resolved` (boolean) - Whether issue is resolved
  - `created_at` (timestamptz) - Timestamp of creation
  - `updated_at` (timestamptz) - Timestamp of last update

  ### `audit_logs`
  Audit trail for important actions.
  - `id` (bigserial, primary key) - Unique identifier
  - `user_id` (uuid) - User who performed action
  - `action` (text) - Action performed
  - `resource` (text) - Resource type
  - `resource_id` (text) - Resource identifier
  - `metadata` (jsonb) - Additional context
  - `created_at` (timestamptz) - Timestamp

  ## 2. Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with the following policies:

  #### Contracts Table:
  - Suppliers can view only their own contracts
  - Suppliers can create contracts for themselves
  - Suppliers can update only their own contracts
  - Suppliers can delete only their own contracts
  - Admins can view all contracts
  - Admins can update any contract

  #### Contract Issues Table:
  - Suppliers can view issues on their own contracts
  - Admins can create issues
  - Admins can update any issue
  - Admins can view all issues

  #### Audit Logs Table:
  - Only admins can view audit logs
  - System can insert audit logs

  ## 3. Notes
  - User roles (supplier/admin) are determined by the `role` field in auth.users metadata
  - All timestamps use timestamptz for timezone support
  - Indexes added for common query patterns (supplier_id, status, created_at)
  - Foreign keys use ON DELETE CASCADE for contract_issues
*/

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  total_quantity integer NOT NULL CHECK (total_quantity > 0),
  box_size text NOT NULL,
  items_per_box integer NOT NULL CHECK (items_per_box > 0),
  total_weight_kg numeric(8,2) NOT NULL CHECK (total_weight_kg > 0),
  qr_code_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'preparing', 'shipped', 'delivered', 'cancelled')),
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for contracts table
CREATE INDEX IF NOT EXISTS contracts_supplier_id_idx ON contracts(supplier_id);
CREATE INDEX IF NOT EXISTS contracts_status_idx ON contracts(status);
CREATE INDEX IF NOT EXISTS contracts_created_at_idx ON contracts(created_at DESC);

-- Create contract_issues table
CREATE TABLE IF NOT EXISTS contract_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
  reported_by uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  description text,
  severity text DEFAULT 'minor' CHECK (severity IN ('minor', 'major', 'critical')),
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for contract_issues table
CREATE INDEX IF NOT EXISTS contract_issues_contract_id_idx ON contract_issues(contract_id);
CREATE INDEX IF NOT EXISTS contract_issues_resolved_idx ON contract_issues(resolved);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id bigserial PRIMARY KEY,
  user_id uuid,
  action text NOT NULL,
  resource text NOT NULL,
  resource_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create index for audit_logs table
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);

-- Enable Row Level Security
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Contracts RLS Policies

-- Suppliers can view their own contracts, admins can view all
CREATE POLICY "Users can view own contracts or all if admin"
  ON contracts FOR SELECT
  TO authenticated
  USING (
    auth.uid() = supplier_id OR is_admin()
  );

-- Suppliers can create contracts for themselves
CREATE POLICY "Suppliers can create own contracts"
  ON contracts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = supplier_id);

-- Suppliers can update their own contracts, admins can update any
CREATE POLICY "Users can update own contracts or all if admin"
  ON contracts FOR UPDATE
  TO authenticated
  USING (auth.uid() = supplier_id OR is_admin())
  WITH CHECK (auth.uid() = supplier_id OR is_admin());

-- Suppliers can delete their own contracts, admins can delete any
CREATE POLICY "Users can delete own contracts or all if admin"
  ON contracts FOR DELETE
  TO authenticated
  USING (auth.uid() = supplier_id OR is_admin());

-- Contract Issues RLS Policies

-- Suppliers can view issues on their contracts, admins can view all
CREATE POLICY "Users can view issues on own contracts or all if admin"
  ON contract_issues FOR SELECT
  TO authenticated
  USING (
    is_admin() OR 
    EXISTS (
      SELECT 1 FROM contracts 
      WHERE contracts.id = contract_issues.contract_id 
      AND contracts.supplier_id = auth.uid()
    )
  );

-- Only admins can create issues
CREATE POLICY "Admins can create issues"
  ON contract_issues FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Only admins can update issues
CREATE POLICY "Admins can update issues"
  ON contract_issues FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Only admins can delete issues
CREATE POLICY "Admins can delete issues"
  ON contract_issues FOR DELETE
  TO authenticated
  USING (is_admin());

-- Audit Logs RLS Policies

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (is_admin());

-- All authenticated users can insert audit logs (for system logging)
CREATE POLICY "Authenticated users can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts;
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contract_issues_updated_at ON contract_issues;
CREATE TRIGGER update_contract_issues_updated_at
  BEFORE UPDATE ON contract_issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();