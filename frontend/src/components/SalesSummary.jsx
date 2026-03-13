import React, { useEffect, useState } from 'react';
import { getVentasMensuales } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatCurrency, cn } from '../lib/utils';
import { Calendar, DollarSign, CreditCard, ChevronLeft, ChevronRight, ShoppingBag, PieChart, TrendingUp } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// SalesSummary
//
// React concepts demonstrated:
//
// 1. Date as state — `currentDate` is a JavaScript Date stored in state.
//    When we call setCurrentDate with a new Date, React re-renders and the
//    useEffect dependency [currentDate] triggers a fresh API call.
//
// 2. Derived values from state — `totalSales`, `orderCount`, `average` are
//    all computed from `data.resumen` during render. No need to store them
//    in state separately.
//
// 3. Effect cleanup is not needed here because getVentasMensuales resolves
//    before any user navigation, but in production you would use an AbortController.
// ─────────────────────────────────────────────────────────────────────────────
const SalesSummary = () => {
  const [loading, setLoading]   = useState(true);
  const [data, setData]         = useState({ resumen: [], pedidos: [], meta: {} });
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch monthly data whenever currentDate changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const mes  = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const anio = currentDate.getFullYear().toString();
        const result = await getVentasMensuales(mes, anio);
        setData(result || { resumen: [], pedidos: [], meta: {} });
      } catch (error) {
        console.error('SalesSummary: error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentDate]); // re-runs when currentDate changes

  // Navigate months by mutating a copy of currentDate
  const changeMonth = (offset) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + offset);
    setCurrentDate(next);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Derived values — computed from data, no extra state required
  const totalSales  = (data.resumen || []).reduce((sum, item) => sum + parseFloat(item.total_monto || 0), 0);
  const orderCount  = (data.pedidos || []).length;
  const avgPerOrder = totalSales / (orderCount || 1);

  return (
    <div className="space-y-8 pb-12">

      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-brand-light dark:bg-brand-default/10 text-brand-default">
              <TrendingUp className="h-6 w-6" />
            </span>
            Sales Summary
          </h1>
          <p className="text-sm text-text-muted mt-1">Monthly revenue and order analytics</p>
        </div>

        {/* Month navigator — two buttons update `currentDate` which triggers the useEffect */}
        <div className="flex items-center gap-1 bg-surface-card dark:bg-dark-surface border border-surface-border dark:border-dark-border rounded-xl p-1 shadow-sm">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-surface-muted dark:hover:bg-dark-border rounded-lg transition-colors text-text-muted hover:text-text-primary dark:hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="px-4 py-1 text-center min-w-[160px]">
            <span className="block text-[10px] font-semibold text-text-muted uppercase tracking-widest">Selected period</span>
            <span className="text-sm font-bold text-text-primary dark:text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
          </div>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-surface-muted dark:hover:bg-dark-border rounded-lg transition-colors text-text-muted hover:text-text-primary dark:hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── KPI card ── */}
      <Card>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

            {/* Main revenue figures */}
            <div className="space-y-5">
              <div>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">
                  Total Monthly Revenue
                </span>
                <h2 className="text-5xl font-bold text-text-primary dark:text-white mt-1">
                  {formatCurrency(totalSales)}
                </h2>
              </div>
              <div className="flex gap-8">
                <div>
                  <span className="block text-xs text-text-muted uppercase tracking-widest">Orders</span>
                  <span className="text-2xl font-bold text-text-primary dark:text-white">{orderCount}</span>
                </div>
                <div className="border-l border-surface-border dark:border-dark-border pl-8">
                  <span className="block text-xs text-text-muted uppercase tracking-widest">Avg per Order</span>
                  <span className="text-2xl font-bold text-text-primary dark:text-white">{formatCurrency(avgPerOrder)}</span>
                </div>
              </div>
            </div>

            {/* Breakdown by payment method */}
            <div className="grid grid-cols-2 gap-3">
              {(data.resumen || []).map((method, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-surface-muted dark:bg-dark-bg/40 rounded-xl border border-surface-border dark:border-dark-border"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-1.5 rounded-lg bg-brand-default text-white">
                      {method.metodo_pago === 'Efectivo'
                        ? <DollarSign className="h-3.5 w-3.5" />
                        : <CreditCard className="h-3.5 w-3.5" />
                      }
                    </div>
                    <span className="text-[10px] text-text-muted">{method.cantidad_pedidos} ops</span>
                  </div>
                  <span className="block text-xs text-text-muted mb-1">{method.metodo_pago}</span>
                  <span className="font-bold text-text-primary dark:text-white text-sm">
                    {formatCurrency(method.total_monto)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Operations log ── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <span className="p-1.5 rounded-lg bg-brand-light dark:bg-brand-default/10 text-brand-default">
                <ShoppingBag className="h-4 w-4" />
              </span>
              Operations Log
            </CardTitle>
            <span className="text-xs text-text-muted">Detailed list</span>
          </div>
        </CardHeader>
        <CardContent className="p-4">

          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
            <div className="col-span-2">Date</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-3">Products</div>
            <div className="col-span-2 text-center">Payment</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 spinner animate-spin" />
            </div>
          ) : orderCount > 0 ? (
            <div className="space-y-1">
              {data.pedidos.map((order, index) => (
                <div
                  key={order.id_pedido}
                  className={cn(
                    'grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-xl border transition-colors cursor-default',
                    index % 2 === 0
                      ? 'bg-surface-muted/50 dark:bg-white/2 border-transparent hover:bg-surface-muted dark:hover:bg-white/5'
                      : 'bg-transparent border-transparent hover:bg-surface-muted dark:hover:bg-white/5'
                  )}
                >
                  <div className="col-span-2">
                    <span className="text-xs text-text-muted">
                      {new Date(order.fecha_pedido).toLocaleDateString('en-US', {
                        day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
                      })}
                    </span>
                  </div>

                  <div className="col-span-3 flex items-center gap-2">
                    {/* Avatar initial */}
                    <div className="w-7 h-7 rounded-full bg-brand-default flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {order.nombre_cliente.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-text-secondary dark:text-slate-300 truncate">
                      {order.nombre_cliente}
                    </span>
                  </div>

                  <div className="col-span-3">
                    <p className="text-xs text-text-muted truncate" title={order.productos_resumen}>
                      {order.productos_resumen || 'Details not available'}
                    </p>
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-surface-muted dark:bg-dark-border text-text-secondary dark:text-slate-300 border border-surface-border dark:border-dark-border">
                      {order.metodo_pago}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <span className="font-bold text-text-primary dark:text-white text-sm">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center text-center space-y-3 opacity-50">
              <PieChart className="h-10 w-10 text-text-muted" />
              <div>
                <p className="font-semibold text-text-secondary">No records this month</p>
                <p className="text-xs text-text-muted mt-1">Confirmed orders will appear here automatically.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesSummary;
