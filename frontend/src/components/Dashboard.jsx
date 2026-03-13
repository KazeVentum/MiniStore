import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getVentasRecientes, getProductosTop } from '../services/api';
import { Card, CardContent } from './ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Package, Clock, TrendingUp, ArrowUpRight, ShoppingCart } from 'lucide-react';
import { Select } from './ui/select';
import { formatCurrency, cn } from '../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// StatCard — internal presentational component
//
// React concept: "Presentational" vs "Container" components.
// - StatCard only receives data via props and renders UI. It has no side effects.
// - Dashboard is the container: it fetches data and passes it down.
//
// Props:
//   title     — label shown above the value
//   value     — main metric to display
//   subValue  — secondary label below the value
//   icon      — Lucide icon component (passed as a prop, called as <Icon />)
//   color     — Tailwind bg color class for the icon background
//   trend     — optional badge text (e.g. "Today")
//   onClick   — optional click handler (makes the card a navigation target)
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, subValue, icon: Icon, color, trend, onClick }) => (
  <Card
    className={cn(
      'relative overflow-hidden transition-all duration-200 hover:shadow-md',
      onClick && 'cursor-pointer hover:-translate-y-0.5'
    )}
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        {/* Icon badge — background color comes from the `color` prop */}
        <div className={cn('p-2.5 rounded-xl', color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>

        {/* Trend badge — only rendered when a `trend` string is provided */}
        {trend && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider">
            <ArrowUpRight className="h-3 w-3" /> {trend}
          </span>
        )}
      </div>

      <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1">{title}</p>
      <h2 className="text-2xl font-bold text-text-primary dark:text-white">{value}</h2>
      {subValue && <p className="text-xs text-text-muted mt-1">{subValue}</p>}
    </CardContent>
  </Card>
);

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard — main container component
//
// React concepts demonstrated here:
//
// 1. useState  — declares reactive local state variables
// 2. useEffect — runs side effects (API calls) after render
//    - [] dependency = run once on mount
//    - [periodo] dependency = re-run whenever `periodo` changes
// 3. Promise.all — fetch multiple endpoints in parallel, then update state
// 4. Derived data — `chartData` is computed from `ventasRecientes` state,
//    no extra state variable needed
// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();

  // -- State declarations --
  const [stats, setStats] = useState({
    ventasHoy: 0,
    pedidosHoy: 0,
    pedidosPendientes: 0,
    totalProductos: 0,
    totalHistorico: 0,
  });
  const [ventasRecientes, setVentasRecientes] = useState([]);
  const [productosTop, setProductosTop]       = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [periodo, setPeriodo]                 = useState('7'); // '7' | '15' | '30'

  // Effect 1: fetch stats + top products once on mount.
  // Promise.all runs both requests in parallel.
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [statsData, topData] = await Promise.all([
          getDashboardStats(),
          getProductosTop(),
        ]);
        setStats(statsData);
        setProductosTop(topData);
      } catch (error) {
        console.error('Dashboard: error fetching initial data', error);
      }
    };
    fetchInitialData();
  }, []); // empty array → run once after first render

  // Effect 2: fetch sales chart data whenever `periodo` changes.
  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const data = await getVentasRecientes(periodo);
        setVentasRecientes(data);
      } catch (error) {
        console.error('Dashboard: error fetching sales data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVentas();
  }, [periodo]); // re-runs every time `periodo` changes

  // -- Derived data --
  // We aggregate individual orders by date to get one data point per day.
  // This is pure computation — no state, no side effects.
  const chartData = Object.values(
    ventasRecientes.reduce((acc, order) => {
      const date = new Date(order.fecha_pedido).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = { fecha_pedido: date, total: 0 };
      acc[date].total += parseFloat(order.total);
      return acc;
    }, {})
  ).sort((a, b) => new Date(a.fecha_pedido) - new Date(b.fecha_pedido));

  // Loading state — rendered while the first data fetch is in progress
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 spinner animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">

      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-text-muted mt-1">Store performance overview</p>
        </div>

        <button
          onClick={() => navigate('/orders/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-default hover:bg-brand-hover text-white font-semibold rounded-xl shadow-sm transition-all duration-200 active:scale-95 text-sm"
        >
          <ShoppingCart className="h-4 w-4" />
          New Order
        </button>
      </div>

      {/* ── KPI grid ── */}
      {/*
        React concept: rendering a list of components with .map()
        Each StatCard is configured purely through props — no internal state.
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="All-time Revenue"
          value={formatCurrency(stats.totalHistorico)}
          subValue="Total billed"
          icon={TrendingUp}
          color="bg-indigo-500"
        />
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats.ventasHoy)}
          subValue={`${stats.pedidosHoy} orders today`}
          icon={DollarSign}
          color="bg-emerald-500"
          trend="Today"
        />
        <StatCard
          title="Pending"
          value={stats.pedidosPendientes}
          subValue="Awaiting processing"
          icon={Clock}
          color="bg-amber-500"
          onClick={() => navigate('/orders')}
        />
        <StatCard
          title="Products"
          value={stats.totalProductos}
          subValue="In catalog"
          icon={Package}
          color="bg-violet-500"
          onClick={() => navigate('/products')}
        />
        <StatCard
          title={`Last ${periodo}d Sales`}
          value={formatCurrency(
            ventasRecientes.reduce((acc, curr) => acc + parseFloat(curr.total), 0)
          )}
          subValue={`Last ${periodo} days`}
          icon={ShoppingBag}
          color="bg-sky-500"
        />
      </div>

      {/* ── Analytics section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sales area chart */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-text-primary dark:text-white">
              Sales Performance
            </h2>
            {/*
              React concept: controlled component.
              The <Select> value is bound to `periodo` state.
              onChange calls setPeriodo, which triggers the useEffect above
              and re-fetches data for the new period.
            */}
            <div className="w-36">
              <Select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="h-8 text-xs"
              >
                <option value="7">Last 7 days</option>
                <option value="15">Last 15 days</option>
                <option value="30">Last 30 days</option>
              </Select>
            </div>
          </div>

          <Card className="p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  {/* SVG gradient fill under the area line */}
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis
                  dataKey="fecha_pedido"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  dy={8}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [formatCurrency(value), 'Total']}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString('en-US', {
                      timeZone: 'UTC',
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })
                  }
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Top products ranking */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-text-primary dark:text-white">
            Top Products
          </h2>
          <Card className="p-6">
            {productosTop.length > 0 ? (
              <ul className="space-y-4">
                {productosTop.map((product, index) => (
                  <li key={index} className="flex items-center gap-4">
                    {/* Rank badge — different background per position */}
                    <span className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0',
                      index === 0 ? 'bg-amber-400 text-amber-900' :
                      index === 1 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' :
                                    'bg-orange-200 text-orange-800'
                    )}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary dark:text-white truncate">
                        {product.nombre_producto}
                      </p>
                      <p className="text-xs text-text-muted">{product.total_vendido} sold</p>
                    </div>
                    <span className="text-xs font-bold text-brand-default dark:text-dark-accent">
                      #{index + 1}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-text-muted text-sm py-8">No data available yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
