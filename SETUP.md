# Supplier Dashboard - Setup Guide

A modern, responsive supplier dashboard for managing shipping contracts with role-based access control.

## Features

- **Authentication**: Email/password authentication with role-based access (Supplier/Admin)
- **Contracts Management**: Create, view, update, and delete shipping contracts
- **Progress Tracking**: Update contract progress and status in real-time
- **Issues Management**: Admins can report issues on contracts, suppliers can view them
- **QR Code Upload**: Upload and store QR codes for contracts
- **Analytics Dashboard**: View metrics and statistics
- **Responsive Design**: Works on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, DaisyUI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Database**: PostgreSQL with Row Level Security (RLS)

## Environment Setup

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

The application uses three main tables:

### contracts
- Stores shipping contract information
- Includes quantity, weight, box dimensions, QR codes
- Progress tracking (0-100%)
- Status: draft, preparing, shipped, delivered, cancelled

### contract_issues
- Issues reported by admins
- Severity levels: minor, major, critical
- Resolved status tracking

### audit_logs
- Activity tracking for important actions

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## User Roles

### Supplier
- Create and manage their own contracts
- Upload QR codes
- Update progress and status
- View issues on their contracts

### Admin
- View all contracts
- Report issues on any contract
- Manage and resolve issues
- Full dashboard access

## Pages

- `/auth` - Login and signup
- `/dashboard` - Analytics and overview
- `/contracts` - List all contracts with filters
- `/contracts/new` - Create new contract
- `/contracts/[id]` - Contract details with progress tracking
- `/admin/issues` - Admin issue management
- `/profile` - User profile

## Key Components

- **Navbar**: Responsive navigation with role-based menu items
- **ContractCard**: Compact contract display with quick actions
- **ContractForm**: Full contract creation/editing form with validation
- **ProgressStepper**: Interactive progress and status updater
- **IssuesList**: Display and manage contract issues
- **AnalyticsPanel**: Dashboard metrics and charts

## Security

- Row Level Security (RLS) enforces data access control
- Suppliers can only access their own contracts
- Admins have full access to all contracts and issues
- Storage bucket policies protect QR code uploads

## Building for Production

```bash
npm run build
```

## Color Theme

- Background: White (#ffffff)
- Primary: Red (#ef4444)
- Primary Dark: Dark Red (#b91c1c)
- Accent: Black (#000000)
- Muted: Gray (#6b7280)
