import {
  BrowserRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import type { AppArea } from './api/api';
import LoginPage from './pages/LoginPage';
import TableSelection from './pages/TableSelection';
import OrderView from './pages/OrderView';
import CheckoutView from './pages/CheckoutView';
import ErpDashboardPage from './pages/ErpDashboardPage';
import ErpProductsPage from './pages/ErpProductsPage';
import ErpSalesPage from './pages/ErpSalesPage';
import ErpReportsPage from './pages/ErpReportsPage';
import AdminBranchesPage from './pages/AdminBranchesPage';
import AdminBankAccountsPage from './pages/AdminBankAccountsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
      <div className="glass-panel rounded-3xl border border-white/10 px-8 py-6 text-sm font-semibold tracking-[0.2em] uppercase text-slate-400">
        Loading workspace
      </div>
    </div>
  );
}

function ProtectedRoute() {
  const { loading, user } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function AreaRoute({ area }: { area: AppArea }) {
  const { canAccess, defaultRoute } = useAuth();

  if (!canAccess(area)) {
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
}

function HomeRedirect() {
  const { defaultRoute } = useAuth();
  return <Navigate to={defaultRoute} replace />;
}

function ManagementShell() {
  const { user, logout, canAccess } = useAuth();
  const location = useLocation();

  const navItems = [
    canAccess('erp')
      ? { to: '/erp/dashboard', label: 'Dashboard', icon: 'dashboard' }
      : null,
    canAccess('erp')
      ? { to: '/erp/products', label: 'Products', icon: 'inventory_2' }
      : null,
    canAccess('erp')
      ? { to: '/erp/sales', label: 'Sales', icon: 'receipt_long' }
      : null,
    canAccess('erp')
      ? { to: '/erp/reports', label: 'Reports', icon: 'monitoring' }
      : null,
    canAccess('admin')
      ? { to: '/admin/branches', label: 'Branches', icon: 'storefront' }
      : null,
    canAccess('admin')
      ? { to: '/admin/bank-accounts', label: 'Banking', icon: 'account_balance' }
      : null,
    canAccess('admin')
      ? { to: '/admin/settings', label: 'Settings', icon: 'settings' }
      : null,
  ].filter(Boolean) as Array<{ to: string; label: string; icon: string }>;

  return (
    <div className="management-grid bg-slate-950 text-slate-100">
      <aside className="glass-panel border-r border-white/10 px-6 py-8">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-2xl">bolt</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Nexus</p>
            <h1 className="text-xl font-black tracking-tight">Business Cloud</h1>
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Workspace</p>
          <h2 className="mt-2 text-lg font-bold">{user?.workspace.name}</h2>
          <p className="text-sm text-slate-400">{user?.fullName}</p>
          <p className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            {user?.role}
          </p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {canAccess('pos') && (
          <NavLink
            to="/pos/floor"
            className="mt-8 flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200"
          >
            <span className="material-symbols-outlined">table_restaurant</span>
            Open POS
          </NavLink>
        )}

        <button
          onClick={logout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
        >
          <span className="material-symbols-outlined">logout</span>
          Sign out
        </button>
      </aside>

      <main className="min-w-0 p-4 md:p-8">
        <div className="glass-panel min-h-[calc(100vh-2rem)] rounded-[28px] border border-white/10">
          <header className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                {location.pathname.startsWith('/erp')
                  ? 'ERP workspace'
                  : 'Administration workspace'}
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">
                {location.pathname.startsWith('/erp')
                  ? 'Operations cockpit'
                  : 'Control center'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Branch
                </p>
                <p className="font-semibold text-slate-200">
                  {user?.branch?.name ?? 'Cross-branch'}
                </p>
              </div>
            </div>
          </header>
          <div className="p-6 md:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomeRedirect />} />

          <Route element={<ManagementShell />}>
            <Route element={<AreaRoute area="erp" />}>
              <Route path="/erp/dashboard" element={<ErpDashboardPage />} />
              <Route path="/erp/products" element={<ErpProductsPage />} />
              <Route path="/erp/sales" element={<ErpSalesPage />} />
              <Route path="/erp/reports" element={<ErpReportsPage />} />
            </Route>

            <Route element={<AreaRoute area="admin" />}>
              <Route path="/admin/branches" element={<AdminBranchesPage />} />
              <Route path="/admin/bank-accounts" element={<AdminBankAccountsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>

          <Route element={<AreaRoute area="pos" />}>
            <Route path="/pos/floor" element={<TableSelection />} />
            <Route path="/pos/table/:tableId" element={<OrderView />} />
            <Route path="/pos/checkout/:orderId" element={<CheckoutView />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
