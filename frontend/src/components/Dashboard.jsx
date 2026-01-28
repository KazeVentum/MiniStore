import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getVentasRecientes, getProductosTop } from '../services/api';
import { Card, CardContent } from './ui/card';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    DollarSign, ShoppingBag, Package, Clock, TrendingUp,
    ArrowUpRight, ShoppingCart, Sparkles, Calendar
} from 'lucide-react';
import { Select } from './ui/select';
import { formatCurrency, cn } from '../lib/utils';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ ventasHoy: 0, pedidosHoy: 0, pedidosPendientes: 0, totalProductos: 0, totalHistorico: 0 });
    const [ventasRecientes, setVentasRecientes] = useState([]);
    const [productosTop, setProductosTop] = useState([]);
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState('7');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [statsData, topData] = await Promise.all([
                    getDashboardStats(),
                    getProductosTop()
                ]);
                setStats(statsData);
                setProductosTop(topData);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const ventasData = await getVentasRecientes(periodo);
                setVentasRecientes(ventasData);
            } catch (error) {
                console.error("Error fetching sales data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVentas();
    }, [periodo]);

    const StatCard = ({ title, value, subValue, icon: Icon, color, trend, delay, onClick }) => (
        <Card
            className={cn(
                "relative overflow-hidden border-none glass glass-dark premium-shadow transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] group",
                onClick && "cursor-pointer"
            )}
            onClick={onClick}
        >
            {/* Background Accent */}
            <div className={cn("absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-500", color)} />

            <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-3 rounded-2xl shadow-lg", color.replace('bg-', 'bg-opacity-20 ' + color))}>
                        <Icon className={cn("h-6 w-6", color.replace('bg-', 'text-'))} />
                    </div>
                    {trend && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                            <ArrowUpRight className="h-3 w-3" /> {trend}
                        </div>
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-[0.2em]">{title}</p>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {value}
                    </h2>
                    {subValue && (
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subValue}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-rosa-primario/20 border-t-rosa-secundario rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-rosa-primario/40 blur-lg rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Aggregate sales by day for the line chart
    const aggregatedVentas = ventasRecientes.reduce((acc, current) => {
        const date = new Date(current.fecha_pedido).toISOString().split('T')[0];
        if (!acc[date]) {
            acc[date] = { fecha_pedido: date, total: 0 };
        }
        acc[date].total += parseFloat(current.total);
        return acc;
    }, {});

    const chartData = Object.values(aggregatedVentas).sort((a, b) => new Date(a.fecha_pedido) - new Date(b.fecha_pedido));

    return (
        <div className="space-y-8 pb-12">
            {/* 1. Header & Welcome */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rosa-primario/30 dark:bg-white/5 border border-rosa-primario/20 text-rosa-oscuro dark:text-rosa-primario text-[10px] font-black uppercase tracking-widest animate-pulse">
                        <Sparkles className="h-3 w-3" /> Centro de Operaciones Premium
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
                        Hola, <span className="text-gradient">Lina</span> 👋
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 font-medium tracking-tight">Reporte ejecutivo del estado actual de tu negocio.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/pedidos/nuevo')}
                        className="group relative px-6 py-3 bg-rosa-oscuro hover:bg-rosa-profundo text-white font-black rounded-2xl shadow-xl shadow-rosa-oscuro/20 transition-all duration-300 hover:-translate-y-1 active:scale-95 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="flex items-center gap-2 relative z-10 uppercase tracking-wider text-xs">
                            <ShoppingCart className="h-4 w-4" /> Nuevo Pedido
                        </span>
                    </button>
                </div>
            </div>

            {/* 2. Key Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard
                    title="Total Histórico"
                    value={formatCurrency(stats.totalHistorico)}
                    subValue="Facturación Total"
                    icon={TrendingUp}
                    color="bg-indigo-500"
                    delay={100}
                />
                <StatCard
                    title="Ventas Hoy"
                    value={formatCurrency(stats.ventasHoy)}
                    subValue={`${stats.pedidosHoy} pedidos hoy`}
                    icon={DollarSign}
                    color="bg-emerald-500"
                    trend="Nuevo"
                    delay={200}
                />
                <StatCard
                    title="Pendientes"
                    value={stats.pedidosPendientes}
                    subValue="Por procesar"
                    icon={Clock}
                    color="bg-amber-500"
                    delay={300}
                    onClick={() => navigate('/pedidos')}
                />
                <StatCard
                    title="Productos"
                    value={stats.totalProductos}
                    subValue="En catálogo"
                    icon={Package}
                    color="bg-rosa-secundario"
                    delay={400}
                    onClick={() => navigate('/productos')}
                />
                <StatCard
                    title={`Ventas ${periodo}d`}
                    value={formatCurrency(ventasRecientes.reduce((acc, curr) => acc + parseFloat(curr.total), 0))}
                    subValue={`Últimos ${periodo} días`}
                    icon={ShoppingBag}
                    color="bg-purple-500"
                    delay={500}
                />
            </div>

            {/* 3. Main Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Activity Chart */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                            <Calendar className="h-5 w-5 text-rosa-secundario" /> Rendimiento de Ventas
                        </h3>
                        <div className="w-40">
                            <Select
                                value={periodo}
                                onChange={(e) => setPeriodo(e.target.value)}
                                className="h-9 text-[10px] font-black uppercase tracking-widest glass glass-dark border-none shadow-sm"
                            >
                                <option value="7">Últimos 7 días</option>
                                <option value="15">Últimos 15 días</option>
                                <option value="30">Últimos 30 días</option>
                            </Select>
                        </div>
                    </div>
                    <Card className="glass glass-dark border-none premium-shadow overflow-hidden p-6 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="fecha_pedido"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }}
                                    dy={10}
                                    tickFormatter={(value) => {
                                        const date = new Date(value);
                                        return `${date.getUTCDate()}/${date.getUTCMonth() + 1}`;
                                    }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }}
                                    tickFormatter={(value) => `$${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ stroke: '#EC4899', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    formatter={(value) => [formatCurrency(value), 'Total']}
                                    labelFormatter={(label) => {
                                        const date = new Date(label);
                                        return date.toLocaleDateString('es-CO', {
                                            timeZone: 'UTC',
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long'
                                        });
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#EC4899"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                {/* Top Products Ranking */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                            <Sparkles className="h-5 w-5 text-amber-500" /> Top Productos
                        </h3>
                    </div>
                    <Card className="glass glass-dark border-none premium-shadow p-6 flex flex-col gap-6">
                        {productosTop.length > 0 ? productosTop.map((producto, index) => (
                            <div key={index} className="flex items-center gap-4 group cursor-default">
                                <div className="relative">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg",
                                        index === 0 ? "bg-amber-400 text-amber-900 glow-rosa" :
                                            index === 1 ? "bg-slate-300 text-slate-700" :
                                                "bg-orange-300 text-orange-900"
                                    )}>
                                        {index + 1}
                                    </div>
                                    {index === 0 && <div className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm border border-amber-100 animate-bounce">👑</div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-800 dark:text-white truncate group-hover:text-rosa-secundario transition-colors uppercase tracking-tight">
                                        {producto.nombre_producto}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{producto.total_vendido} vendidos</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                        TOP {index + 1}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-slate-400 font-bold py-8">No hay datos disponibles aún.</p>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
