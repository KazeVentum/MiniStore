import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

// -- Page components --
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Orders from './components/Orders';
import NewOrder from './components/NewOrder';
import Customers from './components/Customers';
import SalesSummary from './components/SalesSummary';

import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Menu } from 'lucide-react';
import ThemeToggle from './components/ui/theme-toggle';
import { cn } from './lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// NavLink
//
// React concept: Component composition — a small, reusable component that
// receives props (to, icon, children) and builds consistent nav items.
//
// useLocation is a React Router hook that returns the current URL object.
// We compare pathname to decide whether this link is "active".
// ─────────────────────────────────────────────────────────────────────────────
const NavLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200',
        isActive ? 'nav-active' : 'nav-inactive'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {children}
    </Link>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AppContent
//
// React concept: This component exists only because useLocation() must be
// called inside the <Router> context. We split "App" into two layers:
//   - App          → provides the Router context
//   - AppContent   → consumes the Router context via hooks
// ─────────────────────────────────────────────────────────────────────────────
const AppContent = () => {
  return (
    <div className="min-h-screen bg-surface-page dark:bg-dark-bg text-text-primary dark:text-slate-100 font-sans">
      <div className="flex h-screen overflow-hidden">

        {/* ── Sidebar (desktop only) ── */}
        <aside className="w-64 hidden md:flex flex-col bg-surface-card dark:bg-dark-surface border-r border-surface-border dark:border-dark-border shrink-0">

          {/* Logo */}
          <div className="px-6 py-6 border-b border-surface-border dark:border-dark-border">
            <h1 className="text-xl font-bold text-gradient tracking-tight">
              BisouStore
            </h1>
            <p className="text-xs text-text-muted mt-0.5">Jewelry E-commerce</p>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 p-4 space-y-1">
            <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>
            <NavLink to="/orders" icon={ShoppingCart}>Orders</NavLink>
            <NavLink to="/summary" icon={BarChart3}>Sales Summary</NavLink>
            <NavLink to="/customers" icon={Users}>Customers</NavLink>
            <NavLink to="/products" icon={Package}>Products</NavLink>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-surface-border dark:border-dark-border">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs text-text-muted">v2.1.0 — academic</span>
              <ThemeToggle />
            </div>
          </div>
        </aside>

        {/* ── Main content area ── */}
        <main className="flex-1 overflow-y-auto">

          {/* Mobile top bar (visible only on small screens) */}
          <div className="md:hidden flex justify-between items-center px-4 py-3 bg-surface-card dark:bg-dark-surface border-b border-surface-border dark:border-dark-border">
            <h1 className="text-lg font-bold text-gradient">BisouStore</h1>
            <div className="flex gap-2">
              <ThemeToggle />
              <button className="p-2 rounded-lg hover:bg-surface-muted dark:hover:bg-white/10 transition-colors">
                <Menu className="h-5 w-5 text-text-secondary" />
              </button>
            </div>
          </div>

          {/* Page content */}
          <div className="p-6 md:p-8 max-w-screen-2xl mx-auto animate-fade-in">
            {/*
              React concept: <Routes> renders only the first <Route> that
              matches the current URL. Each <Route> maps a path to a component.
            */}
            <Routes>
              <Route path="/"                       element={<Dashboard />} />
              <Route path="/products"               element={<Products />} />
              <Route path="/orders"                 element={<Orders />} />
              <Route path="/orders/new"             element={<NewOrder />} />
              <Route path="/orders/edit/:id"        element={<NewOrder />} />
              <Route path="/summary"                element={<SalesSummary />} />
              <Route path="/customers"              element={<Customers />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// App — root component
//
// React concept: <Router> (BrowserRouter) is a context provider. It makes
// routing state (current URL, history) available to all nested components
// via React context, accessed through hooks like useLocation, useNavigate,
// useParams.
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
