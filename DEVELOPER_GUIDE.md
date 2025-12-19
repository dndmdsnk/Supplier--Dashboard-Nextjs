# Developer Guide - Supplier Dashboard Application
# සංවර්ධක මාර්ගෝපදේශය - සැපයුම්කරු උපකරණ පුවරු යෙදුම

---

## Table of Contents / අන්තර්ගතය

1. [Architecture Overview / ගෘහනිර්මාණ දළ විශ්ලේෂණය](#architecture)
2. [Technology Stack / තාක්ෂණික තොගය](#technology)
3. [Database Structure / දත්ත සමුදා ව්‍යුහය](#database)
4. [Authentication System / සත්‍යාපන පද්ධතිය](#authentication)
5. [Key Features / ප්‍රධාන ලක්ෂණ](#features)
6. [Component Architecture / සංරචක ගෘහනිර්මාණය](#components)
7. [Data Flow / දත්ත ප්‍රවාහය](#data-flow)
8. [Development Setup / සංවර්ධන සැකසුම](#setup)
9. [Code Structure / කේත ව්‍යුහය](#code-structure)
10. [API Reference / API යොමුව](#api-reference)

---

<a name="architecture"></a>
## 1. Architecture Overview / ගෘහනිර්මාණ දළ විශ්ලේෂණය

### English

This is a **Next.js 16** application using the **App Router** pattern with **TypeScript**. The application follows a modern architecture with:

- **Frontend**: React 19 with Next.js App Router
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React Context API
- **Styling**: Tailwind CSS + DaisyUI
- **Animations**: Framer Motion
- **Charts**: Recharts library

**Key Architectural Patterns:**
- Server-side rendering (SSR) for initial page loads
- Client-side navigation for smooth transitions
- Row Level Security (RLS) for data protection
- Optimistic UI updates for better UX

### සිංහල

මෙය **Next.js 16** යෙදුමක් වන අතර **App Router** රටාව සහ **TypeScript** භාවිතා කරයි. යෙදුම නවීන ගෘහනිර්මාණයක් අනුගමනය කරයි:

- **ඉදිරිපස**: React 19 සමඟ Next.js App Router
- **පසුපස**: Supabase (PostgreSQL + Auth + Storage)
- **තත්ව කළමනාකරණය**: React Context API
- **මෝස්තරකරණය**: Tailwind CSS + DaisyUI
- **සජීවිකරණ**: Framer Motion
- **ප්‍රස්ථාර**: Recharts පුස්තකාලය

**ප්‍රධාන ගෘහනිර්මාණ රටා:**
- සේවාදායක පාර්ශ්ව විදැහුම්කරණය මූලික පිටු පැටවීම් සඳහා
- සුමට සංක්‍රමණ සඳහා ග්‍රාහක පාර්ශ්ව සංචාලනය
- දත්ත ආරක්ෂාව සඳහා පේළි මට්ටම් ආරක්ෂාව (RLS)
- වඩා හොඳ UX සඳහා ශුභවාදී UI යාවත්කාලීන

---

<a name="technology"></a>
## 2. Technology Stack / තාක්ෂණික තොගය

### English

**Frontend Technologies:**
```
- Next.js 16.0.8 (React Framework)
- React 19.2.1 (UI Library)
- TypeScript 5 (Type Safety)
- Tailwind CSS 4.1.17 (Styling)
- DaisyUI 5.5.11 (Component Library)
- Framer Motion 12.23.26 (Animations)
- Recharts 3.6.0 (Data Visualization)
```

**Backend Technologies:**
```
- Supabase (Backend as a Service)
  - PostgreSQL 17.6.1 (Database)
  - Supabase Auth (Authentication)
  - Supabase Storage (File Storage)
  - Row Level Security (Data Protection)
```

**Development Tools:**
```
- ESLint 9 (Code Quality)
- PostCSS (CSS Processing)
- npm (Package Manager)
```

### සිංහල

**ඉදිරිපස තාක්ෂණයන්:**
```
- Next.js 16.0.8 (React රාමුව)
- React 19.2.1 (UI පුස්තකාලය)
- TypeScript 5 (වර්ග ආරක්ෂාව)
- Tailwind CSS 4.1.17 (මෝස්තරකරණය)
- DaisyUI 5.5.11 (සංරචක පුස්තකාලය)
- Framer Motion 12.23.26 (සජීවිකරණ)
- Recharts 3.6.0 (දත්ත දෘශ්‍යකරණය)
```

**පසුපස තාක්ෂණයන්:**
```
- Supabase (සේවාවක් ලෙස පසුපස)
  - PostgreSQL 17.6.1 (දත්ත සමුදාව)
  - Supabase Auth (සත්‍යාපනය)
  - Supabase Storage (ගොනු ගබඩාව)
  - පේළි මට්ටම් ආරක්ෂාව (දත්ත ආරක්ෂාව)
```

**සංවර්ධන මෙවලම්:**
```
- ESLint 9 (කේත ගුණාත්මකභාවය)
- PostCSS (CSS සැකසීම)
- npm (පැකේජ කළමනාකරු)
```

---

<a name="database"></a>
## 3. Database Structure / දත්ත සමුදා ව්‍යුහය

### English

**Core Tables:**

#### 1. `contracts` Table
Stores all shipping contract information.

```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  total_quantity INTEGER NOT NULL,
  box_size TEXT NOT NULL,
  items_per_box INTEGER NOT NULL,
  total_weight_kg NUMERIC NOT NULL,
  qr_code TEXT,
  status TEXT CHECK (status IN ('draft', 'preparing', 'shipped', 'delivered', 'cancelled')),
  progress INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Fields Explained:**
- `id`: Unique contract identifier (UUID)
- `supplier_id`: Links to user who created contract
- `title`: Contract name/description
- `total_quantity`: Number of items
- `box_size`: Dimensions of shipping box
- `items_per_box`: How many items per box
- `total_weight_kg`: Total weight in kilograms
- `qr_code`: URL to QR code image in storage
- `status`: Current contract status (5 states)
- `progress`: Completion percentage (0-100)
- `metadata`: Additional JSON data
- `created_at`: Creation timestamp
- `updated_at`: Last modification timestamp

#### 2. `contract_issues` Table
Tracks quality and delivery issues.

```sql
CREATE TABLE contract_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('minor', 'major', 'critical')),
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Fields Explained:**
- `severity`: Issue importance (minor/major/critical)
- `resolved`: Whether issue is fixed
- Other fields follow standard pattern

#### 3. `audit_logs` Table
Records all system activities for accountability.

```sql
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Actions Tracked:**
- `create`: New resource created
- `update`: Resource modified
- `delete`: Resource removed
- `update_progress`: Contract progress changed
- `status_change`: Contract status changed

#### 4. `suppliers` Table
Stores supplier-specific profile information.

```sql
CREATE TABLE suppliers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  phone TEXT,
  address TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### සිංහල

**ප්‍රධාන වගු:**

#### 1. `contracts` වගුව
සියලුම නැව්ගත කිරීමේ කොන්ත්‍රාත් තොරතුරු ගබඩා කරයි.

**ක්ෂේත්‍ර පැහැදිලි කිරීම:**
- `id`: අද්විතීය කොන්ත්‍රාත් හඳුනාගැනීම (UUID)
- `supplier_id`: කොන්ත්‍රාතුව නිර්මාණය කළ පරිශීලකයා සමඟ සම්බන්ධ වේ
- `title`: කොන්ත්‍රාතු නම/විස්තරය
- `total_quantity`: අයිතම ගණන
- `box_size`: නැව්ගත කිරීමේ පෙට්ටියේ මානයන්
- `items_per_box`: පෙට්ටියකට අයිතම කීයක්
- `total_weight_kg`: කිලෝග්‍රෑම් වලින් මුළු බර
- `qr_code`: ගබඩාවේ QR කේත රූපයට URL
- `status`: වත්මන් කොන්ත්‍රාතු තත්වය (තත්වයන් 5ක්)
- `progress`: සම්පූර්ණ කිරීමේ ප්‍රතිශතය (0-100)
- `metadata`: අමතර JSON දත්ත
- `created_at`: නිර්මාණ කාල මුද්‍රාව
- `updated_at`: අවසාන වෙනස් කිරීමේ කාල මුද්‍රාව

#### 2. `contract_issues` වගුව
ගුණාත්මක සහ බෙදාහැරීමේ ගැටලු නිරීක්ෂණය කරයි.

**ක්ෂේත්‍ර පැහැදිලි කිරීම:**
- `severity`: ගැටලුවේ වැදගත්කම (සුළු/ප්‍රධාන/තීරණාත්මක)
- `resolved`: ගැටලුව විසඳා ඇත්ද යන්න
- අනෙකුත් ක්ෂේත්‍ර සම්මත රටාව අනුගමනය කරයි

#### 3. `audit_logs` වගුව
වගකීම සඳහා සියලුම පද්ධති ක්‍රියාකාරකම් වාර්තා කරයි.

**නිරීක්ෂණය කරන ලද ක්‍රියා:**
- `create`: නව සම්පත් නිර්මාණය කරන ලදී
- `update`: සම්පත් වෙනස් කරන ලදී
- `delete`: සම්පත් ඉවත් කරන ලදී
- `update_progress`: කොන්ත්‍රාතු ප්‍රගතිය වෙනස් විය
- `status_change`: කොන්ත්‍රාතු තත්වය වෙනස් විය

#### 4. `suppliers` වගුව
සැපයුම්කරු-විශේෂිත පැතිකඩ තොරතුරු ගබඩා කරයි.

---

<a name="authentication"></a>
## 4. Authentication System / සත්‍යාපන පද්ධතිය

### English

**How Authentication Works:**

1. **Registration Flow:**
```typescript
// File: contexts/AuthContext.tsx
const signUp = async (email: string, password: string, role: UserRole) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: role }
    }
  });
};
```

**What Happens:**
- User submits email + password
- Supabase creates account in `auth.users` table
- Database trigger automatically sets `role = 'supplier'`
- Another trigger creates record in `suppliers` table
- User is auto-confirmed (no email verification)

2. **Login Flow:**
```typescript
const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
};
```

**What Happens:**
- User submits credentials
- Supabase validates against database
- JWT token generated with user data
- Token stored in browser (localStorage/cookies)
- User redirected to dashboard

3. **Session Management:**
```typescript
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
    setRole(session?.user?.user_metadata?.role);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
      setRole(session?.user?.user_metadata?.role);
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

**What Happens:**
- App checks for existing session on load
- Subscribes to auth state changes
- Updates UI when user logs in/out
- Cleans up subscription on unmount

4. **Role-Based Access Control:**
```typescript
// Check if user is admin
const isAdmin = role === 'admin';

// Filter navigation based on role
const filteredLinks = navLinks.filter(link =>
  link.roles.includes(userRole)
);
```

**Roles:**
- `supplier`: Can manage own contracts
- `admin`: Can manage all contracts + issues

### සිංහල

**සත්‍යාපනය ක්‍රියා කරන ආකාරය:**

1. **ලියාපදිංචි ප්‍රවාහය:**

**සිදු වන්නේ කුමක්ද:**
- පරිශීලකයා විද්‍යුත් තැපැල් + මුරපදය ඉදිරිපත් කරයි
- Supabase `auth.users` වගුවේ ගිණුමක් නිර්මාණය කරයි
- දත්ත සමුදා ප්‍රේරකය ස්වයංක්‍රීයව `role = 'supplier'` සකසයි
- වෙනත් ප්‍රේරකයක් `suppliers` වගුවේ වාර්තාවක් නිර්මාණය කරයි
- පරිශීලකයා ස්වයංක්‍රීයව තහවුරු වේ (විද්‍යුත් තැපැල් සත්‍යාපනයක් නැත)

2. **පිවිසුම් ප්‍රවාහය:**

**සිදු වන්නේ කුමක්ද:**
- පරිශීලකයා අක්තපත්‍ර ඉදිරිපත් කරයි
- Supabase දත්ත සමුදාවට එරෙහිව සත්‍යාපනය කරයි
- පරිශීලක දත්ත සමඟ JWT ටෝකනය ජනනය කරන ලදී
- ටෝකනය බ්‍රවුසරයේ ගබඩා කර ඇත (localStorage/cookies)
- පරිශීලකයා උපකරණ පුවරුවට හරවා යවනු ලැබේ

3. **සැසි කළමනාකරණය:**

**සිදු වන්නේ කුමක්ද:**
- යෙදුම පැටවීමේදී පවතින සැසිය පරීක්ෂා කරයි
- සත්‍යාපන තත්ව වෙනස්කම් වෙත දායක වේ
- පරිශීලකයා ඇතුල් වූ විට/පිටත් වූ විට UI යාවත්කාලීන කරයි
- අන්මවුන්ට් කිරීමේදී දායකත්වය පිරිසිදු කරයි

4. **භූමිකාව පදනම් කරගත් ප්‍රවේශ පාලනය:**

**භූමිකාවන්:**
- `supplier`: තමන්ගේම කොන්ත්‍රාත් කළමනාකරණය කළ හැකිය
- `admin`: සියලුම කොන්ත්‍රාත් + ගැටලු කළමනාකරණය කළ හැකිය

---

<a name="features"></a>
## 5. Key Features / ප්‍රධාන ලක්ෂණ

### English

#### Feature 1: Contract Management

**Create Contract:**
```typescript
// File: app/contracts/new/page.tsx
const handleSubmit = async (formData: any, qrFile?: File) => {
  // 1. Insert contract to database
  const { data: contract } = await supabase
    .from('contracts')
    .insert([{ ...formData, supplier_id: user.id }])
    .select()
    .single();

  // 2. Upload QR code to storage
  if (qrFile) {
    const qrUrl = await uploadQRCode(qrFile, contract.id, user.id);

    // 3. Update contract with QR URL
    await supabase
      .from('contracts')
      .update({ qr_code: qrUrl })
      .eq('id', contract.id);
  }

  // 4. Log activity
  await supabase.from('audit_logs').insert([{
    user_id: user.id,
    action: 'create',
    resource: 'contract',
    resource_id: contract.id
  }]);
};
```

**What Happens:**
1. Form data validated on client
2. Contract record created in database
3. QR code file uploaded to Supabase Storage
4. Contract updated with QR code URL
5. Activity logged for audit trail
6. User redirected to contracts list

**Update Progress:**
```typescript
// File: components/ProgressStepper.tsx
const handleSave = async () => {
  // Update contract progress and status
  await supabase
    .from('contracts')
    .update({
      progress,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', contractId);

  // Log the update
  await supabase.from('audit_logs').insert([{
    action: 'update_progress',
    resource: 'contract',
    metadata: { progress, status }
  }]);
};
```

#### Feature 2: Analytics Dashboard

**Data Collection:**
```sql
-- Analytics Views in Database

-- View 1: Contract Metrics Summary
CREATE VIEW contract_metrics_summary AS
SELECT
  COUNT(*)::integer AS total_contracts,
  SUM(total_quantity) AS total_items_shipped,
  AVG(total_weight_kg) AS avg_weight_per_contract,
  AVG(progress) AS avg_progress_percentage
FROM contracts;

-- View 2: Monthly Trends
CREATE VIEW contracts_by_month AS
SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS contract_count,
  SUM(total_quantity) AS total_items
FROM contracts
GROUP BY DATE_TRUNC('month', created_at);
```

**Frontend Usage:**
```typescript
// File: lib/hooks/useAnalytics.ts
export function useAnalytics() {
  const fetchAnalytics = async () => {
    // Fetch all analytics data in parallel
    const [summaryRes, trendsRes, statusRes] = await Promise.all([
      supabase.from('contract_metrics_summary').select('*'),
      supabase.from('contracts_by_month').select('*'),
      supabase.from('contracts_by_status').select('*')
    ]);

    setSummary(summaryRes.data);
    setMonthlyTrends(trendsRes.data);
    setStatusDistribution(statusRes.data);
  };
}
```

**What Happens:**
1. Database views pre-calculate metrics
2. Frontend fetches all data in parallel
3. Charts render with Recharts library
4. Business insights auto-generated from data
5. Real-time updates on data changes

#### Feature 3: Issue Management

**Create Issue (Admin Only):**
```typescript
// File: app/contracts/[id]/page.tsx
const handleCreateIssue = async () => {
  await supabase
    .from('contract_issues')
    .insert([{
      contract_id: contractId,
      reported_by: user.id,
      title: issueTitle,
      description: issueDescription,
      severity: issueSeverity
    }]);
};
```

**Resolve Issue:**
```typescript
const handleToggleResolved = async (issueId: string, resolved: boolean) => {
  await supabase
    .from('contract_issues')
    .update({ resolved, updated_at: new Date().toISOString() })
    .eq('id', issueId);
};
```

#### Feature 4: QR Code Upload

**Upload Process:**
```typescript
// File: lib/storage.ts
export async function uploadQRCode(
  file: File,
  contractId: string,
  supplierId: string
): Promise<string | null> {
  // 1. Validate file (type, size)
  const validation = validateQRCodeFile(file);
  if (!validation.valid) return null;

  // 2. Generate file path
  const filePath = `${supplierId}/${contractId}/qr.${fileExt}`;

  // 3. Upload to Supabase Storage
  await supabase.storage
    .from('contract-qr-codes')
    .upload(filePath, file, { upsert: true });

  // 4. Get public URL
  const { data } = supabase.storage
    .from('contract-qr-codes')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
```

**Security:**
- Files stored in private bucket
- Path structure: `{supplier_id}/{contract_id}/qr.{ext}`
- RLS policies prevent unauthorized access
- Max file size: 2MB
- Allowed types: PNG, JPEG, SVG

### සිංහල

#### විශේෂාංගය 1: කොන්ත්‍රාතු කළමනාකරණය

**කොන්ත්‍රාතුව නිර්මාණය කරන්න:**

**සිදු වන්නේ කුමක්ද:**
1. ග්‍රාහකයා මත පෝරම දත්ත සත්‍යාපනය කරන ලදී
2. දත්ත සමුදාවේ කොන්ත්‍රාතු වාර්තාව නිර්මාණය කරන ලදී
3. QR කේත ගොනුව Supabase ගබඩාවට උඩුගත කරන ලදී
4. QR කේත URL සමඟ කොන්ත්‍රාතුව යාවත්කාලීන කරන ලදී
5. විගණන මාර්ගය සඳහා ක්‍රියාකාරකම් ලොග් කරන ලදී
6. පරිශීලකයා කොන්ත්‍රාතු ලැයිස්තුවට හරවා යවනු ලැබේ

**ප්‍රගතිය යාවත්කාලීන කරන්න:**

#### විශේෂාංගය 2: විශ්ලේෂණ උපකරණ පුවරුව

**දත්ත එකතු කිරීම:**

**සිදු වන්නේ කුමක්ද:**
1. දත්ත සමුදා දර්ශන මිනුම් පූර්ව ගණනය කරයි
2. ඉදිරිපස සියලුම දත්ත සමාන්තරව ලබා ගනී
3. Recharts පුස්තකාලය සමඟ ප්‍රස්ථාර විදැහුම් කරයි
4. දත්තවලින් ව්‍යාපාරික අවබෝධයන් ස්වයංක්‍රීයව ජනනය කරයි
5. දත්ත වෙනස්කම් මත තත්‍ය කාලීන යාවත්කාලීන

#### විශේෂාංගය 3: ගැටලු කළමනාකරණය

**ගැටලුවක් නිර්මාණය කරන්න (පරිපාලක පමණි):**

**ගැටලුව විසඳන්න:**

#### විශේෂාංගය 4: QR කේත උඩුගත කිරීම

**උඩුගත කිරීමේ ක්‍රියාවලිය:**

**ආරක්ෂාව:**
- ගොනු පුද්ගලික බාල්දියක ගබඩා කර ඇත
- මාර්ග ව්‍යුහය: `{supplier_id}/{contract_id}/qr.{ext}`
- RLS ප්‍රතිපත්ති අනවසර ප්‍රවේශය වළක්වයි
- උපරිම ගොනු ප්‍රමාණය: 2MB
- අවසර දී ඇති වර්ග: PNG, JPEG, SVG

---

<a name="components"></a>
## 6. Component Architecture / සංරචක ගෘහනිර්මාණය

### English

**Component Hierarchy:**

```
App (layout.tsx)
├── AuthProvider (Manages authentication state)
├── ThemeProvider (Manages dark/light mode)
├── LanguageProvider (Manages translations)
└── Page Components
    ├── Dashboard (/dashboard)
    │   ├── Navbar
    │   ├── AnimatedStatCard (×4 KPIs)
    │   ├── ContractCard (Recent contracts)
    │   └── ActivityFeed
    │
    ├── Contracts (/contracts)
    │   ├── Navbar
    │   ├── ContractCard (×N contracts)
    │   └── EmptyState (if no contracts)
    │
    ├── Contract Details (/contracts/[id])
    │   ├── Navbar
    │   ├── ProgressStepper
    │   └── IssuesList
    │
    ├── Analytics (/analytics)
    │   ├── Navbar
    │   ├── AnimatedStatCard (×5 KPIs)
    │   ├── BusinessInsights
    │   ├── MonthlyTrendChart
    │   ├── EfficiencyChart
    │   ├── StatusDistributionChart
    │   ├── IssueMetricsCard
    │   └── WeeklyActivityChart
    │
    └── Admin Issues (/admin/issues)
        ├── Navbar
        └── Issue Cards (×N issues)
```

**Key Components Explained:**

#### 1. Navbar Component
```typescript
// File: components/Navbar.tsx

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  // Filters navigation links based on user role
  const filteredLinks = navLinks.filter(link =>
    link.roles.includes(userRole)
  );

  return (
    // Responsive navigation bar with:
    // - Desktop menu with all links
    // - Mobile hamburger menu
    // - Theme toggle button
    // - Language selector dropdown
    // - Sign out button
  );
}
```

**Features:**
- Responsive (mobile + desktop)
- Role-based menu items
- Theme switcher
- Language selector
- Smooth animations

#### 2. ContractCard Component
```typescript
// File: components/ContractCard.tsx

export default function ContractCard({ contract, onDelete }) {
  // Displays contract information in a card format
  // Shows: title, status, progress, quantity, weight, box info

  return (
    <motion.div whileHover={{ y: -4 }}>
      {/* Card content */}
      {/* Progress circle */}
      {/* Action buttons */}
    </motion.div>
  );
}
```

**Features:**
- Animated on hover
- Progress visualization
- Status badge with colors
- Quick action buttons
- Responsive grid layout

#### 3. ProgressStepper Component
```typescript
// File: components/ProgressStepper.tsx

export default function ProgressStepper({
  currentProgress,
  currentStatus,
  onUpdate
}) {
  // Interactive progress updater
  // Shows 4 status steps: Draft → Preparing → Shipped → Delivered
  // Slider for fine-tuning progress percentage

  const statuses = [
    { value: 'draft', label: 'Draft', progress: 0 },
    { value: 'preparing', label: 'Preparing', progress: 25 },
    { value: 'shipped', label: 'Shipped', progress: 75 },
    { value: 'delivered', label: 'Delivered', progress: 100 },
  ];

  return (
    // Step indicators
    // Progress slider
    // Save button (only shows if changes made)
  );
}
```

**Features:**
- Visual step indicators
- Range slider for progress
- Only saves when changes detected
- Validates before updating

#### 4. Analytics Charts
```typescript
// File: components/charts/MonthlyTrendChart.tsx

export default function MonthlyTrendChart({ data, type }) {
  // Recharts Line or Bar chart
  // Shows contract volume trends over time

  return (
    <ResponsiveContainer>
      {type === 'line' ? (
        <LineChart data={data}>
          <Line dataKey="contract_count" stroke="#2563eb" />
          <Line dataKey="delivered_count" stroke="#10b981" />
        </LineChart>
      ) : (
        <BarChart data={data}>
          {/* Bar chart version */}
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}
```

**Chart Types:**
1. **MonthlyTrendChart**: Line/Bar chart for trends
2. **StatusDistributionChart**: Pie chart for status breakdown
3. **WeeklyActivityChart**: Bar chart for activity
4. **EfficiencyChart**: Multi-metric bar comparison
5. **IssueMetricsCard**: Custom card with progress bars

### සිංහල

**සංරචක ධුරාවලිය:**

```
යෙදුම (layout.tsx)
├── AuthProvider (සත්‍යාපන තත්වය කළමනාකරණය කරයි)
├── ThemeProvider (අඳුරු/ආලෝක මාදිලිය කළමනාකරණය කරයි)
├── LanguageProvider (පරිවර්තන කළමනාකරණය කරයි)
└── පිටු සංරචක
```

**ප්‍රධාන සංරචක පැහැදිලි කිරීම:**

#### 1. Navbar සංරචකය

**විශේෂාංග:**
- ප්‍රතිචාරාත්මක (ජංගම + ඩෙස්ක්ටොප්)
- භූමිකාව පදනම් කරගත් මෙනු අයිතම
- තේමා මාරුකාරකය
- භාෂා තෝරනය
- සුමට සජීවිකරණ

#### 2. ContractCard සංරචකය

**විශේෂාංග:**
- මුහුදට යාමේදී සජීවිකරණය
- ප්‍රගති දෘශ්‍යකරණය
- වර්ණ සහිත තත්ව ලාංඡනය
- ඉක්මන් ක්‍රියා බොත්තම්
- ප්‍රතිචාරාත්මක ජාල පිරිසැලසුම

#### 3. ProgressStepper සංරචකය

**විශේෂාංග:**
- දෘශ්‍ය පියවර දර්ශක
- ප්‍රගතිය සඳහා පරාස ස්ලයිඩරය
- වෙනස්කම් හඳුනාගත් විට පමණක් සුරකියි
- යාවත්කාලීන කිරීමට පෙර සත්‍යාපනය කරයි

#### 4. විශ්ලේෂණ ප්‍රස්ථාර

**ප්‍රස්ථාර වර්ග:**
1. **MonthlyTrendChart**: ප්‍රවණතා සඳහා රේඛා/තීරු ප්‍රස්ථාරය
2. **StatusDistributionChart**: තත්ව බිඳවැටීම සඳහා පයි ප්‍රස්ථාරය
3. **WeeklyActivityChart**: ක්‍රියාකාරකම් සඳහා තීරු ප්‍රස්ථාරය
4. **EfficiencyChart**: බහු-මිනුම් තීරු සැසඳීම
5. **IssueMetricsCard**: ප්‍රගති තීරු සහිත අභිරුචි කාඩ්පත

---

<a name="data-flow"></a>
## 7. Data Flow / දත්ත ප්‍රවාහය

### English

**Complete Data Flow Example: Creating a Contract**

```
1. USER ACTION
   └─> User fills form in app/contracts/new/page.tsx
       └─> Validates: title, quantity, weight, QR file

2. FORM SUBMISSION
   └─> handleSubmit() function called
       └─> Calls supabase.from('contracts').insert()

3. DATABASE LAYER
   └─> PostgreSQL receives INSERT query
       ├─> RLS checks: Is user authenticated?
       ├─> Validation: Check constraints (status, quantities)
       └─> Returns: New contract record with UUID

4. FILE UPLOAD
   └─> uploadQRCode() function called
       ├─> Validates file (type, size)
       ├─> Generates path: {supplier_id}/{contract_id}/qr.png
       ├─> Uploads to Supabase Storage bucket
       └─> Returns: Public URL

5. UPDATE CONTRACT
   └─> supabase.from('contracts').update()
       └─> Sets qr_code field to URL

6. AUDIT LOGGING
   └─> supabase.from('audit_logs').insert()
       └─> Records: user_id, action='create', resource='contract'

7. NAVIGATION
   └─> router.push('/contracts')
       └─> User sees updated list with new contract

8. UI UPDATE
   └─> useContracts hook refetches data
       └─> ContractCard components re-render
           └─> Framer Motion animations play
```

**Data Flow for Analytics:**

```
DATABASE VIEWS (Pre-calculated)
    ↓
    SELECT * FROM contract_metrics_summary
    SELECT * FROM contracts_by_month
    SELECT * FROM contracts_by_status
    ↓
REACT HOOK (lib/hooks/useAnalytics.ts)
    ↓
    Promise.all([
      fetch summary,
      fetch trends,
      fetch distribution
    ])
    ↓
REACT STATE
    ↓
    setSummary(data)
    setMonthlyTrends(data)
    setStatusDistribution(data)
    ↓
CHART COMPONENTS
    ↓
    <MonthlyTrendChart data={monthlyTrends} />
    <StatusDistributionChart data={statusDistribution} />
    ↓
RECHARTS RENDERING
    ↓
    User sees animated charts with business insights
```

### සිංහල

**සම්පූර්ණ දත්ත ප්‍රවාහ උදාහරණය: කොන්ත්‍රාතුවක් නිර්මාණය කිරීම**

```
1. පරිශීලක ක්‍රියාව
2. පෝරම ඉදිරිපත් කිරීම
3. දත්ත සමුදා ස්ථරය
4. ගොනු උඩුගත කිරීම
5. කොන්ත්‍රාතුව යාවත්කාලීන කරන්න
6. විගණන ලොග් කිරීම
7. සංචලනය
8. UI යාවත්කාලීනය
```

---

<a name="setup"></a>
## 8. Development Setup / සංවර්ධන සැකසුම

### English

**Prerequisites:**
```
- Node.js 20+ installed
- npm or yarn package manager
- Supabase account (free tier works)
- Code editor (VS Code recommended)
- Git (optional but recommended)
```

**Step-by-Step Setup:**

```bash
# 1. Clone or download the project
git clone <repository-url>
cd project-folder

# 2. Install dependencies
npm install

# 3. Create .env.local file in root directory
touch .env.local

# 4. Add Supabase credentials to .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 5. Run database migrations
# Go to Supabase Dashboard → SQL Editor
# Run each migration file in supabase/migrations/ folder

# 6. Start development server
npm run dev

# 7. Open browser
# Navigate to http://localhost:3000
```

**Get Supabase Credentials:**

1. Go to https://supabase.com
2. Create account (free)
3. Create new project
4. Wait 2-3 minutes for setup
5. Go to Project Settings → API
6. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Build for Production:**

```bash
# Create optimized production build
npm run build

# Test production build locally
npm run start
```

### සිංහල

**පූර්ව අවශ්‍යතා:**
```
- Node.js 20+ ස්ථාපනය කර ඇත
- npm හෝ yarn පැකේජ කළමනාකරු
- Supabase ගිණුමක් (නොමිලේ ස්ථරය ක්‍රියා කරයි)
- කේත සංස්කාරකය (VS Code නිර්දේශ කරනු ලැබේ)
- Git (විකල්ප නමුත් නිර්දේශිතයි)
```

---

<a name="code-structure"></a>
## 9. Code Structure / කේත ව්‍යුහය

### English

```
project-root/
│
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home/redirect page
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Dashboard page
│   ├── contracts/                # Contract pages
│   ├── analytics/                # Analytics dashboard
│   ├── admin/                    # Admin-only pages
│   └── profile/                  # User profile
│
├── components/                   # Reusable React components
│   ├── Navbar.tsx
│   ├── ContractCard.tsx
│   ├── ContractForm.tsx
│   ├── ProgressStepper.tsx
│   └── charts/                   # Chart components
│
├── contexts/                     # React Context providers
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── LanguageContext.tsx
│
├── lib/                          # Utility libraries
│   ├── supabaseClient.ts
│   ├── types.ts
│   ├── storage.ts
│   └── hooks/                    # Custom React hooks
│
├── supabase/                     # Supabase configuration
│   └── migrations/               # Database migrations
│
└── package.json                  # Dependencies
```

### සිංහල

**ව්‍යාපෘති ව්‍යුහය:**

සියලුම ප්‍රධාන ෆෝල්ඩර සහ ගොනු ඉංග්‍රීසි අංශයේ පැහැදිලි කර ඇත.

---

<a name="api-reference"></a>
## 10. API Reference / API යොමුව

### English

**Supabase Client Functions:**

#### Authentication

```typescript
// Sign up new user
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: { data: { role: 'supplier' } }
});

// Sign in existing user
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Sign out current user
await supabase.auth.signOut();

// Get current session
await supabase.auth.getSession();
```

#### Database Queries

```typescript
// SELECT: Get all contracts
await supabase.from('contracts').select('*');

// INSERT: Create new contract
await supabase.from('contracts').insert([{ title: 'New Contract' }]);

// UPDATE: Modify contract
await supabase.from('contracts').update({ progress: 50 }).eq('id', contractId);

// DELETE: Remove contract
await supabase.from('contracts').delete().eq('id', contractId);
```

#### Storage

```typescript
// Upload file
await supabase.storage.from('contract-qr-codes').upload('path/file.png', fileData);

// Get public URL
supabase.storage.from('contract-qr-codes').getPublicUrl('path/file.png');

// Delete file
await supabase.storage.from('contract-qr-codes').remove(['path/file.png']);
```

### සිංහල

**Supabase ග්‍රාහක ශ්‍රිත:**

සියලුම API ශ්‍රිත ඉංග්‍රීසි අංශයේ ලේඛනගත කර ඇත.

---

## Conclusion / නිගමනය

### English

This developer guide covers the fundamental architecture, components, and workflows of the Supplier Dashboard application. The application demonstrates modern web development practices with type-safe development, server-side rendering, real-time database operations, and secure authentication.

For questions or contributions, please refer to the project repository or contact the development team.

### සිංහල

මෙම සංවර්ධක මාර්ගෝපදේශය සැපයුම්කරු උපකරණ පුවරු යෙදුමේ මූලික ගෘහනිර්මාණය, සංරචක සහ වැඩ ප්‍රවාහ ආවරණය කරයි. යෙදුම වර්ග-ආරක්ෂිත සංවර්ධනය, සේවාදායක පාර්ශ්ව විදැහුම්කරණය, තත්‍ය කාලීන දත්ත සමුදා මෙහෙයුම් සහ ආරක්ෂිත සත්‍යාපනය සමඟ නවීන වෙබ් සංවර්ධන භාවිතයන් නිරූපණය කරයි.

ප්‍රශ්න හෝ දායකත්වයන් සඳහා, කරුණාකර ව්‍යාපෘති ගබඩාව වෙත යොමු වන්න හෝ සංවර්ධන කණ්ඩායම අමතන්න.

---

**Version:** 1.0.0
**Last Updated:** December 2024
**Author:** Development Team

---

**END OF DEVELOPER GUIDE**
