import React, { useEffect, useState } from 'react';
import { getVentasMensuales } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { formatCurrency, cn } from '../lib/utils';
import { Calendar, DollarSign, CreditCard, ChevronLeft, ChevronRight, FileText, TrendingUp, ShoppingBag, PieChart, Sparkles } from 'lucide-react';

const ResumenVentas = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ resumen: [], pedidos: [], meta: {} });
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchData = async () => {
        setLoading(true);
        try {
            const mes = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const anio = currentDate.getFullYear().toString();
            const result = await getVentasMensuales(mes, anio);
            setData(result || { resumen: [], pedidos: [], meta: {} });
        } catch (error) {
            console.error("Error loading monthly sales", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentDate]);

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const totalVentas = (data.resumen || []).reduce((sum, item) => sum + parseFloat(item.total_monto || 0), 0);

    return (
        <div className="space-y-10 pb-12 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-4">
                        <span className="p-3 rounded-2xl bg-rosa-primario/20 text-rosa-oscuro dark:text-rosa-primario">
                            <TrendingUp className="h-8 w-8" />
                        </span>
                        Análisis de <span className="text-gradient">Ventas</span> 📊
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 font-medium">Visualiza el crecimiento y rendimiento de MiniStore</p>
                </div>

                <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-3 hover:bg-rosa-primario/10 text-slate-400 hover:text-rosa-oscuro transition-all rounded-xl"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="px-6 py-2 text-center min-w-[180px]">
                        <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-rosa-oscuro dark:text-rosa-primario leading-none mb-1">Periodo Seleccionado</span>
                        <span className="text-lg font-black text-slate-800 dark:text-white">
                            {monthNames[currentDate.getMonth()].toUpperCase()} {currentDate.getFullYear()}
                        </span>
                    </div>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-3 hover:bg-rosa-primario/10 text-slate-400 hover:text-rosa-oscuro transition-all rounded-xl"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Core Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Main Total Card */}
                <Card className="lg:col-span-12 glass glass-dark border-none premium-shadow overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-rosa-primario/20 via-purple-500/10 to-transparent rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

                    <CardContent className="p-10 relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <span className="text-xs font-black uppercase tracking-[0.3em] text-rosa-oscuro dark:text-rosa-primario opacity-70">Ingresos Totales del Mes</span>
                                    <div className="flex items-baseline gap-2">
                                        <h2 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white">
                                            {formatCurrency(totalVentas)}
                                        </h2>
                                        <span className="text-lg font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-xl"> +12% </span>
                                    </div>
                                </div>
                                <div className="flex gap-10">
                                    <div className="space-y-1">
                                        <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Volumen de Pedidos</span>
                                        <span className="text-2xl font-black text-slate-700 dark:text-gray-200">{(data.pedidos || []).length}</span>
                                    </div>
                                    <div className="space-y-1 border-l border-white/10 pl-10">
                                        <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Promedio por Venta</span>
                                        <span className="text-2xl font-black text-slate-700 dark:text-gray-200">
                                            {formatCurrency(totalVentas / ((data.pedidos || []).length || 1))}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {(data.resumen || []).map((metodo, idx) => (
                                    <div key={idx} className="p-5 bg-white/40 dark:bg-white/5 rounded-3xl border border-white/20 hover:border-rosa-primario/50 transition-all group/stat">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 group-hover/stat:scale-110 transition-transform">
                                                {metodo.metodo_pago === 'Efectivo' ? <DollarSign className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{metodo.cantidad_pedidos} Ops</span>
                                        </div>
                                        <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{metodo.metodo_pago}</span>
                                        <span className="text-lg font-black text-slate-800 dark:text-white">{formatCurrency(metodo.total_monto)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sub Stats - Bottom Layer */}
                <div className="lg:col-span-12 space-y-8">
                    <Card className="bg-white dark:bg-dark-surface border-none premium-shadow overflow-hidden">
                        <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                                <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                                    <ShoppingBag className="h-5 w-5" />
                                </span>
                                Bitácora de Operaciones
                            </CardTitle>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Listado Detallado</span>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-3">
                                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <div className="col-span-2">Fecha</div>
                                    <div className="col-span-3">Cliente</div>
                                    <div className="col-span-3">Composición</div>
                                    <div className="col-span-2 text-center">Canal</div>
                                    <div className="col-span-2 text-right">Inversión</div>
                                </div>

                                {loading ? (
                                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                        <div className="w-10 h-10 border-4 border-rosa-primario/20 border-t-rosa-oscuro rounded-full animate-spin" />
                                        <span className="text-xs font-black text-rosa-oscuro uppercase tracking-widest animate-pulse">Sincronizando reportes...</span>
                                    </div>
                                ) : (data.pedidos || []).length > 0 ? (
                                    data.pedidos.map((pedido, index) => (
                                        <div
                                            key={pedido.id_pedido}
                                            className={cn(
                                                "grid grid-cols-12 gap-4 items-center p-4 rounded-2xl border transition-all duration-200 cursor-default group",
                                                index % 2 === 0
                                                    ? "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-rosa-primario/30 dark:hover:border-white/20 hover:shadow-md"
                                                    : "bg-white dark:bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5 hover:border-rosa-primario/30 dark:hover:border-white/20 hover:shadow-md",
                                                "hover:scale-[1.005]"
                                            )}
                                        >
                                            <div className="col-span-2">
                                                <span className="text-xs font-bold text-slate-500 dark:text-gray-400 block">
                                                    {new Date(pedido.fecha_pedido).toLocaleDateString('es-CO', {
                                                        day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC'
                                                    }).toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="col-span-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 flex items-center justify-center text-sm font-bold shadow-lg shadow-black/20">
                                                        {pedido.nombre_cliente.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-slate-700 dark:text-gray-200 truncate pr-4">
                                                        {pedido.nombre_cliente}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="col-span-3">
                                                <p className="text-xs font-medium text-slate-500 dark:text-gray-400 truncate max-w-[200px]" title={pedido.productos_resumen}>
                                                    {pedido.productos_resumen || 'Detalles no disponibles'}
                                                </p>
                                            </div>

                                            <div className="col-span-2 flex justify-center">
                                                <span className={cn(
                                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                                    pedido.metodo_pago === 'Efectivo' ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/40 dark:text-emerald-100 dark:border-emerald-400/60" :
                                                        pedido.metodo_pago === 'Daviplata' ? "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/40 dark:text-rose-100 dark:border-rose-400/60" :
                                                            pedido.metodo_pago === 'Nequi' ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/40 dark:text-purple-100 dark:border-purple-400/60" :
                                                                pedido.metodo_pago === 'Transferencia' ? "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/40 dark:text-yellow-100 dark:border-yellow-400/60" :
                                                                    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/40 dark:text-slate-100 dark:border-slate-400/60"
                                                )}>
                                                    {pedido.metodo_pago}
                                                </span>
                                            </div>

                                            <div className="col-span-2 text-right">
                                                <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                                    {formatCurrency(pedido.total)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-24 text-center flex flex-col items-center justify-center space-y-4 opacity-40">
                                        <PieChart className="h-12 w-12 text-slate-300" />
                                        <div className="space-y-1">
                                            <p className="text-lg font-black text-slate-500">Sin registros este mes</p>
                                            <p className="text-xs font-medium text-slate-400">Las ventas confirmadas aparecerán aquí automáticamente.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-center pt-6 opacity-30">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    <Sparkles className="h-3 w-3" /> Reporte Certificado por MiniStore Engine <Sparkles className="h-3 w-3" />
                </div>
            </div>
        </div>
    );
};

export default ResumenVentas;
