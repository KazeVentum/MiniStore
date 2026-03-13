import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPedidos, getPedidoById, updateEstadoPedido } from '../services/api';
import { Card, CardContent } from './ui/card';
import { Select } from './ui/select';
import Modal from './ui/modal';
import {
  Clock, CheckCircle, XCircle, Plus, Eye, User,
  Calendar, CreditCard, Edit2, Package, Filter, Truck,
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// getStatusStyle — pure helper function (not a component)
//
// React concept: keep business logic out of JSX. Pure functions that return
// strings (Tailwind classes, labels, etc.) make JSX much easier to read.
// ─────────────────────────────────────────────────────────────────────────────
const getStatusStyle = (status) => {
  const map = {
    pendiente:  'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    borrador:   'text-slate-500 bg-slate-50 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10',
    completado: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    cancelado:  'text-red-500 bg-red-50 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  };
  return map[status] || 'text-slate-500 bg-slate-50 border-slate-200';
};

// ─────────────────────────────────────────────────────────────────────────────
// Orders
//
// React concepts demonstrated:
//
// 1. Multiple filter states working together — selectedMonth, selectedYear,
//    and selectedStatus are independent state variables. The derived list
//    (filteredOrders) applies all three filters in a single .filter() call.
//
// 2. async event handlers — handleStatusChange and handleViewDetails are
//    async functions attached to onClick props. React does not block on them;
//    the UI stays responsive while the await resolves.
//
// 3. Optional chaining (?.) — `selectedOrder?.id_pedido` safely reads a
//    property when selectedOrder might be null.
// ─────────────────────────────────────────────────────────────────────────────
const Orders = () => {
  const navigate = useNavigate();

  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filter state — initialized to current month/year
  const [selectedMonth, setSelectedMonth]   = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear]     = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState('todos');

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchOrders = async () => {
    try {
      const data = await getPedidos();
      setOrders(data);
    } catch (error) {
      console.error('Orders: error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleStatusChange = async (id, newStatus) => {
    await updateEstadoPedido(id, newStatus);
    fetchOrders();
    // If the detail modal is open for this order, refresh it too
    if (selectedOrder && selectedOrder.id_pedido === id) {
      const updated = await getPedidoById(id);
      setSelectedOrder(updated);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const order = await getPedidoById(id);
      setSelectedOrder(order);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error('Orders: error fetching order details', error);
    }
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const filteredOrders = orders.filter((o) => {
    const d = new Date(o.fecha_pedido);
    const matchDate   = (d.getUTCMonth() + 1) === parseInt(selectedMonth) && d.getUTCFullYear() === parseInt(selectedYear);
    const matchStatus = selectedStatus === 'todos' || o.estado === selectedStatus;
    return matchDate && matchStatus;
  });

  const monthTotal  = filteredOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 spinner animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">

      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white tracking-tight">Orders</h1>
          <p className="text-sm text-text-muted mt-1">Manage and track customer orders</p>
        </div>
        <button
          onClick={() => navigate('/orders/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-default hover:bg-brand-hover text-white font-semibold rounded-xl shadow-sm transition-all duration-200 active:scale-95 text-sm"
        >
          <Plus className="h-4 w-4" /> New Order
        </button>
      </div>

      {/* ── Filter bar ── */}
      {/*
        React concept: controlled selects — each <Select> is bound to a
        state variable via value + onChange. Changing any filter immediately
        re-renders the filtered list below.
      */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-surface-card dark:bg-dark-surface border border-surface-border dark:border-dark-border rounded-2xl shadow-sm">
        <Filter className="h-4 w-4 text-text-muted shrink-0" />

        <Select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="h-9 min-w-[130px] text-xs"
        >
          {monthNames.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </Select>

        <Select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="h-9 w-24 text-xs"
        >
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </Select>

        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-9 min-w-[150px] text-xs"
        >
          <option value="todos">All statuses</option>
          <option value="borrador">Draft</option>
          <option value="pendiente">Pending</option>
          <option value="completado">Completed</option>
          <option value="cancelado">Cancelled</option>
        </Select>

        {/* Derived stats from the filtered list */}
        <div className="hidden lg:flex items-center gap-6 ml-auto pl-4 border-l border-surface-border dark:border-dark-border">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-widest">Orders</p>
            <p className="text-lg font-bold text-brand-default dark:text-dark-accent">{filteredOrders.length}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-widest">Month Total</p>
            <p className="text-lg font-bold text-text-primary dark:text-white">{formatCurrency(monthTotal)}</p>
          </div>
        </div>
      </div>

      {/* ── Orders list ── */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center space-y-4 border-2 border-dashed border-surface-border dark:border-dark-border rounded-2xl">
            <div className="p-4 rounded-full bg-surface-muted dark:bg-dark-border">
              <Package className="h-8 w-8 text-text-muted" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary dark:text-white">No orders this period</h3>
              <p className="text-sm text-text-muted mt-1">
                No records for {monthNames[selectedMonth - 1]}. Create a new order to get started.
              </p>
            </div>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id_pedido} className="group">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                  {/* Order info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
                      order.estado === 'completado' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' :
                      order.estado === 'pendiente'  ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' :
                                                      'bg-surface-muted dark:bg-white/5 text-text-muted'
                    )}>
                      <Package className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 cursor-pointer" onClick={() => handleViewDetails(order.id_pedido)}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-text-primary dark:text-white">
                          Order #{order.id_pedido}
                        </span>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                          getStatusStyle(order.estado)
                        )}>
                          {order.estado}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-text-muted">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {order.nombre_cliente}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(order.fecha_pedido).toLocaleDateString()}</span>
                        {order.fecha_limite && (
                          <span className={cn(
                            'flex items-center gap-1',
                            new Date(order.fecha_limite) < new Date() && order.estado === 'pendiente' ? 'text-danger' : ''
                          )}>
                            <Clock className="h-3 w-3" /> {new Date(order.fecha_limite).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financials */}
                  <div className="flex flex-col items-end gap-1 px-4 border-l border-surface-border dark:border-dark-border">
                    <span className="text-xs text-text-muted">Total</span>
                    <span className="text-xl font-bold text-text-primary dark:text-white">
                      {formatCurrency(order.total)}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-muted dark:bg-dark-border text-text-muted uppercase tracking-wider">
                      {order.metodo_pago}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleViewDetails(order.id_pedido)}
                      className="p-2 rounded-lg text-text-muted hover:text-brand-default hover:bg-brand-light dark:hover:bg-brand-default/10 transition-colors"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/orders/edit/${order.id_pedido}`)}
                      className="p-2 rounded-lg text-text-muted hover:text-brand-default hover:bg-brand-light dark:hover:bg-brand-default/10 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    {order.estado === 'pendiente' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(order.id_pedido, 'completado')}
                          className="p-2 rounded-lg text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-500 hover:text-white transition-all"
                          title="Mark complete"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id_pedido, 'cancelado')}
                          className="p-2 rounded-lg text-danger bg-danger/5 hover:bg-danger hover:text-white transition-all"
                          title="Cancel"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {order.estado === 'borrador' && (
                      <button
                        onClick={() => handleStatusChange(order.id_pedido, 'pendiente')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-default bg-brand-light dark:bg-brand-default/10 hover:bg-brand-default hover:text-white transition-all"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── Order detail modal ── */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title={`Order #${selectedOrder?.id_pedido}`}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-muted dark:bg-dark-bg/40 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                  <User className="h-3.5 w-3.5" /> Customer Info
                </h4>
                <p className="font-semibold text-text-primary dark:text-white">{selectedOrder.nombre_cliente}</p>
                <div className="text-xs text-text-muted space-y-1">
                  <p>Channel: {selectedOrder.nombre_canal}</p>
                  <p>Payment: <span className="font-semibold text-text-secondary dark:text-slate-300">{selectedOrder.metodo_pago}</span></p>
                </div>
              </div>

              <div className="p-4 bg-surface-muted dark:bg-dark-bg/40 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5" /> Logistics
                </h4>
                <div className="text-xs text-text-muted space-y-1">
                  <p>Date: <span className="text-text-secondary dark:text-slate-300">{new Date(selectedOrder.fecha_pedido).toLocaleDateString()}</span></p>
                  <p>Deadline: <span className="text-danger">{selectedOrder.fecha_limite ? new Date(selectedOrder.fecha_limite).toLocaleDateString() : 'N/A'}</span></p>
                  {selectedOrder.direccion && <p>Address: {selectedOrder.direccion}</p>}
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div className="rounded-xl border border-surface-border dark:border-dark-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted dark:bg-dark-border">
                  <tr className="text-xs font-bold text-text-muted uppercase tracking-widest">
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border dark:divide-dark-border">
                  {selectedOrder.detalles?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-text-primary dark:text-white">{item.nombre_producto}</td>
                      <td className="px-4 py-3 text-center text-text-secondary">{item.cantidad}</td>
                      <td className="px-4 py-3 text-right text-text-secondary">{formatCurrency(item.precio_unitario)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-brand-default dark:text-dark-accent">
                        {formatCurrency(item.precio_unitario * item.cantidad)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm text-text-muted px-2">
                <span>Subtotal</span><span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-text-muted px-2">
                <span>Shipping</span><span>{formatCurrency(selectedOrder.costo_envio)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-brand-light dark:bg-brand-default/10 rounded-xl border border-brand-soft dark:border-brand-default/20">
                <span className="font-semibold text-text-primary dark:text-white">Order Total</span>
                <span className="text-2xl font-bold text-brand-default dark:text-dark-accent">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            {selectedOrder.notas && (
              <p className="text-xs text-text-muted italic p-4 bg-surface-muted dark:bg-dark-bg/40 rounded-xl">
                "{selectedOrder.notas}"
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
