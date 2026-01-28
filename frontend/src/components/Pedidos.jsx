import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPedidos, getPedidoById, updateEstadoPedido } from '../services/api';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Select } from './ui/select';
import Modal from './ui/modal';
import {
    Clock, CheckCircle, XCircle, Plus, Eye, User,
    Calendar, DollarSign, CreditCard, Edit2, ShoppingBag,
    ShoppingCart, Filter, ChevronRight, Package, Box, Truck, Info
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

const Pedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Filter states
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedStatus, setSelectedStatus] = useState('todos');

    const navigate = useNavigate();

    const fetchPedidos = async () => {
        try {
            const data = await getPedidos();
            setPedidos(data);
        } catch (error) {
            console.error("Error fetching orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPedidos();
    }, []);

    const handleStatusChange = async (id, nuevoEstado) => {
        await updateEstadoPedido(id, nuevoEstado);
        fetchPedidos();
        if (selectedOrder && selectedOrder.id_pedido === id) {
            const updatedOrder = await getPedidoById(id);
            setSelectedOrder(updatedOrder);
        }
    };

    const handleViewDetails = async (id) => {
        try {
            const order = await getPedidoById(id);
            setSelectedOrder(order);
            setIsDetailsOpen(true);
        } catch (error) {
            console.error("Error fetching order details", error);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'pendiente': return 'text-amber-500 bg-amber-500/10 border-amber-500/20 glow-amber';
            case 'borrador': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
            case 'completado': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 glow-emerald';
            case 'cancelado': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    };

    // Derived data
    const pedidosFiltrados = pedidos.filter(p => {
        const d = new Date(p.fecha_pedido);
        const matchFecha = (d.getUTCMonth() + 1) === parseInt(selectedMonth) && d.getUTCFullYear() === parseInt(selectedYear);
        const matchEstado = selectedStatus === 'todos' || p.estado === selectedStatus;
        return matchFecha && matchEstado;
    });

    const statsMensuales = {
        total: pedidosFiltrados.length,
        pendientes: pedidosFiltrados.filter(p => p.estado === 'pendiente').length,
        montoTotal: pedidosFiltrados.reduce((sum, p) => sum + parseFloat(p.total), 0),
        historicoTotal: pedidos.length // Cantidad histórica total
    };

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const anios = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-rosa-primario/20 border-t-rosa-secundario rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header & New Action */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rosa-primario/30 text-rosa-oscuro dark:text-rosa-primario text-[10px] font-black uppercase tracking-widest">
                        <Box className="h-3 w-3" /> Logística & Control
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
                        Gestión de <span className="text-gradient">Pedidos</span>
                    </h1>
                </div>

                <button
                    onClick={() => navigate('/pedidos/nuevo')}
                    className="group relative px-8 py-4 bg-rosa-secundario hover:bg-rosa-oscuro text-white font-black rounded-2xl shadow-xl shadow-rosa-secundario/20 transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" /> NUEVO PEDIDO
                </button>
            </div>

            {/* Monthly Filters Bar */}
            <div className="glass glass-dark p-4 rounded-3xl border-none premium-shadow flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-3 text-slate-400">
                    <Filter className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Filtros</span>
                </div>

                <div className="flex-1 flex flex-wrap gap-3">
                    <Select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="h-10 min-w-[140px] text-xs font-bold bg-white/50 dark:bg-white/5 border-white/20 rounded-xl"
                    >
                        {meses.map((mes, i) => (
                            <option key={i} value={i + 1}>{mes}</option>
                        ))}
                    </Select>

                    <Select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="h-10 w-24 text-xs font-bold bg-white/50 dark:bg-white/5 border-white/20 rounded-xl"
                    >
                        {anios.map(anio => (
                            <option key={anio} value={anio}>{anio}</option>
                        ))}
                    </Select>

                    <Select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="h-10 min-w-[160px] text-xs font-bold bg-white/50 dark:bg-white/5 border-white/20 rounded-xl"
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="borrador">Borradores</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="completado">Completados</option>
                        <option value="cancelado">Cancelados</option>
                    </Select>
                </div>

                <div className="hidden lg:flex items-center gap-8 px-4 border-l border-white/10 ml-2">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Pedidos Mes</p>
                        <p className="text-lg font-black text-indigo-500">{statsMensuales.total}</p>
                    </div>
                    <div className="text-right border-l border-white/10 pl-6">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Monto Mes</p>
                        <p className="text-lg font-black text-rosa-secundario">{formatCurrency(statsMensuales.montoTotal)}</p>
                    </div>
                    <div className="text-right border-l border-white/10 pl-6">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Histórico Total</p>
                        <p className="text-lg font-black text-slate-600 dark:text-slate-300">{statsMensuales.historicoTotal}</p>
                    </div>
                </div>
            </div>

            {/* Orders List Container */}
            <div className="grid grid-cols-1 gap-4">
                {pedidosFiltrados.length === 0 ? (
                    <div className="py-24 glass glass-dark rounded-[2.5rem] border-dashed border-2 border-white/10 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-20 h-20 bg-rosa-primario/10 rounded-full flex items-center justify-center animate-bounce">
                            <ShoppingBag className="h-10 w-10 text-rosa-oscuro/40" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Sin pedidos este mes</h3>
                        <p className="text-slate-500 dark:text-gray-400 max-w-xs font-medium">Parece que no hay registros para {meses[selectedMonth - 1]}. Empieza creando uno nuevo.</p>
                    </div>
                ) : (
                    pedidosFiltrados.map((pedido) => (
                        <Card
                            key={pedido.id_pedido}
                            className="group relative overflow-hidden bg-white dark:bg-dark-surface border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md rounded-3xl"
                        >
                            <CardContent className="p-6 relative z-10">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    {/* Left Side: Basic Info */}
                                    <div className="flex items-center gap-5 flex-1 min-w-0">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110",
                                            pedido.estado === 'completado' ? "bg-emerald-500/10 text-emerald-600" :
                                                pedido.estado === 'pendiente' ? "bg-amber-500/10 text-amber-600" :
                                                    "bg-slate-500/10 text-slate-600"
                                        )}>
                                            <Package className="h-7 w-7" />
                                        </div>
                                        <div className="space-y-1 min-w-0" onClick={() => handleViewDetails(pedido.id_pedido)}>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                                    Pedido <span className="text-rosa-secundario">#{pedido.id_pedido}</span>
                                                </h3>
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all duration-500",
                                                    getStatusStyles(pedido.estado)
                                                )}>
                                                    {pedido.estado}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                                                <span className="flex items-center gap-1.5"><User className="h-3 w-3" /> {pedido.nombre_cliente}</span>
                                                <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {new Date(pedido.fecha_pedido).toLocaleDateString()}</span>
                                                {pedido.fecha_limite && (
                                                    <span className={cn(
                                                        "flex items-center gap-1.5",
                                                        new Date(pedido.fecha_limite) < new Date() && pedido.estado === 'pendiente' ? "text-rose-500" : ""
                                                    )}>
                                                        <Clock className="h-3 w-3" /> {new Date(pedido.fecha_limite).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle: Financials */}
                                    <div className="flex flex-col md:items-end gap-1 px-6 border-l border-slate-200 dark:border-white/5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto Total</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(pedido.total)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 justify-end">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                                                pedido.metodo_pago === 'Efectivo' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                                                    pedido.metodo_pago === 'Nequi' ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" :
                                                        pedido.metodo_pago === 'Daviplata' ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400" :
                                                            pedido.metodo_pago === 'Transferencia' ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" :
                                                                "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                                            )}>
                                                {pedido.metodo_pago}
                                            </span>
                                        </div>
                                        {pedido.ultima_edicion && (
                                            <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 mt-1">
                                                <Edit2 className="h-3 w-3" />
                                                Editado: {new Date(pedido.ultima_edicion).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>

                                    {/* Right Side: Quick Actions */}
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <button
                                            onClick={() => handleViewDetails(pedido.id_pedido)}
                                            className="p-3 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-400 hover:text-rosa-secundario transition-all"
                                            title="Ver Detalles"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/pedidos/editar/${pedido.id_pedido}`)}
                                            className="p-3 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-400 hover:text-indigo-500 transition-all"
                                            title="Editar"
                                        >
                                            <Edit2 className="h-5 w-5" />
                                        </button>

                                        {pedido.estado === 'pendiente' && (
                                            <div className="flex gap-2 ml-2">
                                                <button
                                                    onClick={() => handleStatusChange(pedido.id_pedido, 'completado')}
                                                    className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <CheckCircle className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(pedido.id_pedido, 'cancelado')}
                                                    className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                        {pedido.estado === 'borrador' && (
                                            <button
                                                onClick={() => handleStatusChange(pedido.id_pedido, 'pendiente')}
                                                className="px-4 py-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500 text-indigo-600 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                                            >
                                                Activar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Detailed View Modal */}
            <Modal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                title={`DETALLE DEL PEDIDO #${selectedOrder?.id_pedido}`}
            >
                {selectedOrder && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Summary Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass glass-dark p-6 rounded-3xl border-none space-y-4">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <User className="h-4 w-4 text-rosa-secundario" /> Información del Cliente
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{selectedOrder.nombre_cliente}</p>
                                    <div className="space-y-1 text-slate-500 font-bold text-xs">
                                        <p className="flex items-center gap-2 tracking-tight uppercase"><ShoppingCart className="h-3 w-3" /> Canal: {selectedOrder.nombre_canal}</p>
                                        <div className="flex items-center gap-2 tracking-tight uppercase">
                                            <CreditCard className="h-3 w-3" /> Pago:
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest",
                                                selectedOrder.metodo_pago === 'Efectivo' ? "bg-emerald-500 text-white" :
                                                    selectedOrder.metodo_pago === 'Nequi' ? "bg-purple-600 text-white" :
                                                        selectedOrder.metodo_pago === 'Daviplata' ? "bg-rose-600 text-white" :
                                                            selectedOrder.metodo_pago === 'Transferencia' ? "bg-blue-600 text-white" :
                                                                "bg-slate-700 text-white"
                                            )}>
                                                {selectedOrder.metodo_pago.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass glass-dark p-6 rounded-3xl border-none space-y-4">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Truck className="h-4 w-4 text-indigo-500" /> Detalle de Logística
                                </h3>
                                <div className="space-y-2 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                    <p className="flex items-center gap-2">Fecha: <span className="text-slate-900 dark:text-white uppercase">{new Date(selectedOrder.fecha_pedido).toLocaleDateString()}</span></p>
                                    <p className="flex items-center gap-2">Límite: <span className="text-rose-500">{selectedOrder.fecha_limite ? new Date(selectedOrder.fecha_limite).toLocaleDateString() : 'N/A'}</span></p>
                                    <p className="mt-2 text-[10px] normal-case font-medium italic">Dirección: {selectedOrder.direccion || 'No especificada'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="glass glass-dark rounded-[2rem] border-none overflow-hidden premium-shadow">
                            <div className="p-6 bg-white/10 border-b border-white/5">
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4 text-emerald-500" /> Productos del Pedido
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-500/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4 text-left">Descripción</th>
                                            <th className="px-6 py-4 text-center">Cant.</th>
                                            <th className="px-6 py-4 text-right">Precio</th>
                                            <th className="px-6 py-4 text-right">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {selectedOrder.detalles?.map((item, idx) => (
                                            <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-sm font-black text-slate-800 dark:text-white tracking-tight uppercase">
                                                    {item.nombre_producto}
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm font-bold text-slate-500">
                                                    {item.cantidad}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-bold text-slate-500">
                                                    {formatCurrency(item.precio_unitario)}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-black text-rosa-secundario">
                                                    {formatCurrency(item.precio_unitario * item.cantidad)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Financial Totals */}
                        <div className="flex flex-col items-end gap-3 pt-6">
                            <div className="flex justify-between w-full md:w-1/3 text-[11px] font-black text-slate-400 uppercase tracking-widest px-4">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(selectedOrder.subtotal)}</span>
                            </div>
                            <div className="flex justify-between w-full md:w-1/3 text-[11px] font-black text-slate-400 uppercase tracking-widest px-4">
                                <span>Envío:</span>
                                <span>{formatCurrency(selectedOrder.costo_envio)}</span>
                            </div>
                            <div className="flex justify-between w-full md:w-1/2 p-6 glass glass-dark rounded-2xl glow-rosa border-none">
                                <span className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Total Pedido</span>
                                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{formatCurrency(selectedOrder.total)}</span>
                            </div>
                        </div>

                        {selectedOrder.notas && (
                            <div className="p-6 glass glass-dark rounded-2xl italic text-xs text-slate-500 border-none font-medium leading-relaxed">
                                " {selectedOrder.notas} "
                            </div>
                        )}

                        {selectedOrder.ultima_edicion && (
                            <div className="flex justify-center pt-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="h-3 w-3" /> Editado el: {new Date(selectedOrder.ultima_edicion).toLocaleString('es-CO', {
                                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Pedidos;
