import React, { useEffect, useState } from 'react';
import { getVentasMensuales } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { formatCurrency } from '../lib/utils';
import { Calendar, DollarSign, CreditCard, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

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
            setData(result);
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

    const totalVentas = data.resumen.reduce((sum, item) => sum + parseFloat(item.total_monto), 0);

    return (
        <div className="space-y-8">
            {/* Header & Month Selector */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                <h1 className="text-3xl font-bold text-rosa-oscuro dark:text-white flex items-center gap-3">
                    <Calendar className="h-8 w-8" />
                    Resumen de Ventas 📊
                </h1>

                <div className="flex items-center gap-4 bg-white/70 dark:bg-dark-surface/50 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-sm">
                    <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} className="rounded-xl">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <span className="font-bold text-lg min-w-[140px] text-center text-gray-800 dark:text-gray-100">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} className="rounded-xl">
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                <Card className="bg-white/80 dark:bg-white/10 border border-rosa-primario/20 dark:border-white/10 overflow-hidden relative shadow-xl shadow-rosa-primario/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rosa-primario/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Total Ventas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r from-rosa-oscuro to-purple-600 dark:from-rosa-primario dark:to-purple-400">
                            {formatCurrency(totalVentas)}
                        </div>
                        <p className="text-gray-500 dark:text-gray-300 text-xs font-medium">
                            {loading ? 'Calculando...' : `${data.pedidos.length} pedidos este mes`}
                        </p>
                    </CardContent>
                </Card>

                {data.resumen.map((metodo, idx) => (
                    <Card key={idx} className="bg-white/70 dark:bg-dark-surface/50 backdrop-blur-md border-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rosa-primario/5 rounded-full -mr-12 -mt-12 group-hover:bg-rosa-primario/10 transition-colors"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                                {metodo.metodo_pago === 'Efectivo' ? <DollarSign className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                                {metodo.metodo_pago}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(metodo.total_monto)}</div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">{metodo.cantidad_pedidos} transacciones</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Detailed Table */}
            <Card className="border-none bg-white/70 dark:bg-dark-surface/50 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="h-5 w-5 text-rosa-oscuro" />
                        Detalle de Pedidos
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-rosa-suave/30 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200">Fecha</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200">Cliente</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200">Productos</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 text-center">Pago</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading && data.pedidos.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-rosa-oscuro dark:text-rosa-primario animate-pulse italic">
                                            Cargando información del mes... ✨
                                        </td>
                                    </tr>
                                ) : data.pedidos.length > 0 ? (
                                    data.pedidos.map((pedido) => (
                                        <tr key={pedido.id_pedido} className="hover:bg-rosa-primario/5 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {new Date(pedido.fecha_pedido).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 dark:text-white">{pedido.nombre_cliente}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={pedido.productos_resumen}>
                                                    {pedido.productos_resumen || 'Sin detalles'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${pedido.metodo_pago === 'Efectivo'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    {pedido.metodo_pago}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(pedido.total)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic">
                                            No hay ventas registradas en este periodo 🌸
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResumenVentas;
