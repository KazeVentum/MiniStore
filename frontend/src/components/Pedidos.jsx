import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPedidos, getPedidoById, updateEstadoPedido } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select } from './ui/select';
import Modal from './ui/modal';
import { Clock, CheckCircle, XCircle, Truck, Plus, Eye, User, MapPin, Phone, Calendar, DollarSign, CreditCard, Edit2, ShoppingBag, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const Pedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Filter states
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
            // Refresh details if open
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'pendiente': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'borrador': return 'text-slate-500 bg-slate-50 border-slate-200 dashed-border';
            case 'completado': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'cancelado': return 'text-rose-600 bg-rose-50 border-rose-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    // Derived data
    const pedidosFiltrados = pedidos.filter(p => {
        const d = new Date(p.fecha_pedido);
        return (d.getUTCMonth() + 1) === parseInt(selectedMonth) && d.getUTCFullYear() === parseInt(selectedYear);
    });

    const statsMensuales = {
        total: pedidosFiltrados.length,
        pendientes: pedidosFiltrados.filter(p => p.estado === 'pendiente').length,
        completados: pedidosFiltrados.filter(p => p.estado === 'completado').length,
        montoTotal: pedidosFiltrados.reduce((sum, p) => sum + parseFloat(p.total), 0)
    };

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const anios = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

    if (loading) return <div className="p-8 text-rosa-oscuro">Cargando pedidos... 💖</div>;

    return (
        <div className="space-y-6">
            {/* 1. Global History Tape (Compact) */}
            <div className="bg-rosa-primario/10 dark:bg-rosa-primario/5 border border-rosa-primario/20 rounded-xl p-3 flex items-center justify-between">
                <p className="text-sm font-medium text-rosa-oscuro dark:text-rosa-primario flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Total histórico: <span className="font-bold">{pedidos.length}</span> pedidos registrados ✨
                </p>
            </div>

            {/* 2. Header & Main Action */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-rosa-oscuro dark:text-white">Gestión de Pedidos 📦</h1>
                    <p className="text-gray-600 dark:text-gray-300">Organiza tus ventas y haz seguimiento mensual</p>
                </div>

                {/* Monthly Navigator */}
                <div className="flex gap-2 bg-white/50 dark:bg-white/5 p-2 rounded-2xl border border-slate-100 dark:border-white/10 w-full md:w-auto">
                    <div className="flex-1 md:w-40">
                        <Select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="h-9 text-xs border-transparent bg-transparent"
                        >
                            {meses.map((mes, i) => (
                                <option key={i} value={i + 1}>{mes}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="w-24">
                        <Select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="h-9 text-xs border-transparent bg-transparent"
                        >
                            {anios.map(anio => (
                                <option key={anio} value={anio}>{anio}</option>
                            ))}
                        </Select>
                    </div>
                </div>

                <Button
                    className="bg-rosa-oscuro hover:bg-rosa-primario text-white px-6 py-6 text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 w-full md:w-auto"
                    onClick={() => navigate('/pedidos/nuevo')}
                >
                    <Plus className="mr-2 h-6 w-6" /> Nuevo Pedido
                </Button>
            </div>

            {/* 3. Stats Cards (Full Width) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-gray-900/50 dark:to-gray-900/30 border-none shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pedidos {meses[selectedMonth - 1]}</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{statsMensuales.total}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-gray-900/50 dark:to-gray-900/30 border-none shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl">
                            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-wider">Pendientes del mes</p>
                            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{statsMensuales.pendientes}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-rosa-primario/5 to-rosa-primario/10 dark:from-rosa-primario/10 dark:to-transparent border-rosa-primario/10 shadow-sm border">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-rosa-primario/20 rounded-xl">
                            <DollarSign className="h-5 w-5 text-rosa-oscuro dark:text-rosa-primario" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-rosa-oscuro/70 dark:text-rosa-primario/70 uppercase tracking-wider">Ventas de {meses[selectedMonth - 1]}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-rosa-oscuro dark:text-rosa-primario">
                                    {formatCurrency(statsMensuales.montoTotal).split(',')[0]}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 4. Orders List */}
            <div className="grid grid-cols-1 gap-4">
                {pedidosFiltrados.length === 0 ? (
                    <div className="py-20 text-center space-y-4 glass-card rounded-3xl border-dashed border-2 border-rosa-primario/20 bg-white/30 dark:bg-black/10">
                        <div className="bg-rosa-primario/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 scale-125">
                            <Clock className="h-8 w-8 text-rosa-oscuro" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">¡Aún no hay pedidos este mes! ✨</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">Parece que no hay registros para {meses[selectedMonth - 1]} de {selectedYear}.</p>
                        <Button variant="outline" className="border-rosa-primario/30 text-rosa-oscuro" onClick={() => navigate('/pedidos/nuevo')}>
                            Crear primer pedido del mes
                        </Button>
                    </div>
                ) : (
                    pedidosFiltrados.map((pedido) => (
                        <Card key={pedido.id_pedido} className="hover:shadow-lg transition-all border-none bg-white/70 dark:bg-dark-surface/50 backdrop-blur-sm">
                            <CardContent className="p-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-rosa-secundario shadow-[2px_0_8px_rgba(236,72,153,0.3)]"></div>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    {/* Order Info */}
                                    <div className="flex-1 cursor-pointer" onClick={() => handleViewDetails(pedido.id_pedido)}>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pedido #{pedido.id_pedido}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(pedido.estado)}`}>
                                                {pedido.estado}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(pedido.fecha_pedido).toLocaleDateString('es-CO', { timeZone: 'UTC' })}
                                            </div>
                                            {pedido.fecha_limite && (
                                                <div className={`flex items-center gap-1 font-medium ${new Date(pedido.fecha_limite) < new Date() && pedido.estado === 'pendiente' ? 'text-red-500' :
                                                    new Date(pedido.fecha_limite) < new Date(Date.now() + 3 * 86400000) && pedido.estado === 'pendiente' ? 'text-orange-500' :
                                                        'text-green-600 dark:text-green-400'
                                                    }`}>
                                                    <Clock className="h-4 w-4" />
                                                    {new Date(pedido.fecha_limite).toLocaleDateString('es-CO', { timeZone: 'UTC' })}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                {pedido.nombre_cliente}
                                            </div>
                                            <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-rosa-primario">
                                                <CreditCard className="h-4 w-4" />
                                                {pedido.metodo_pago}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4" />
                                                <span className="font-semibold text-rosa-oscuro dark:text-rosa-primario">{formatCurrency(pedido.total)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(pedido.id_pedido)}>
                                            <Eye className="h-4 w-4 mr-2" /> Ver Detalles
                                        </Button>

                                        {pedido.estado === 'borrador' && (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-gray-200 dark:border-gray-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/pedidos/editar/${pedido.id_pedido}`);
                                                    }}
                                                >
                                                    <Edit2 className="h-4 w-4 mr-2" /> Editar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-rosa-primario hover:bg-rosa-oscuro text-white"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusChange(pedido.id_pedido, 'pendiente');
                                                    }}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" /> Activar
                                                </Button>
                                            </div>
                                        )}

                                        {pedido.estado === 'pendiente' && (
                                            <div className="flex gap-2 border-l pl-2 ml-2">
                                                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleStatusChange(pedido.id_pedido, 'completado')}>
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleStatusChange(pedido.id_pedido, 'cancelado')}>
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Order Details Modal */}
            <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title={`Detalles del Pedido #${selectedOrder?.id_pedido || ''}`}>
                {selectedOrder && (
                    <div className="space-y-6">
                        {/* Client Info Section */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-lg">
                                <div className="p-2 bg-rosa-primario/30 rounded-lg">
                                    <User className="h-5 w-5 text-rosa-oscuro" />
                                </div>
                                Información del Cliente
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                <div className="space-y-1">
                                    <span className="text-gray-400 block uppercase text-[10px] font-bold tracking-wider">Nombre Completo</span>
                                    <span className="text-gray-900 dark:text-white font-medium text-base">{selectedOrder.nombre_cliente}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-gray-400 block uppercase text-[10px] font-bold tracking-wider">Teléfono</span>
                                    <span className="text-gray-900 dark:text-white font-medium text-base">{selectedOrder.telefono || 'N/A'}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-gray-400 block uppercase text-[10px] font-bold tracking-wider">Fecha Pedido</span>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">{new Date(selectedOrder.fecha_pedido).toLocaleDateString('es-CO', { timeZone: 'UTC' })}</span>
                                </div>
                                {selectedOrder.fecha_limite && (
                                    <div className="space-y-1">
                                        <span className="text-gray-400 block uppercase text-[10px] font-bold tracking-wider">Fecha Límite</span>
                                        <span className={`font-bold ${new Date(selectedOrder.fecha_limite) < new Date() && selectedOrder.estado === 'pendiente' ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {new Date(selectedOrder.fecha_limite).toLocaleDateString('es-CO', { timeZone: 'UTC' })}
                                        </span>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <span className="text-gray-400 block uppercase text-[10px] font-bold tracking-wider">Canal de Venta</span>
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">{selectedOrder.nombre_canal}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-gray-400 block uppercase text-[10px] font-bold tracking-wider">Método de Pago</span>
                                    <span className="text-rosa-oscuro dark:text-rosa-primario font-bold flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        {selectedOrder.metodo_pago}
                                    </span>
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <span className="text-gray-400 block uppercase text-[10px] font-bold tracking-wider">Dirección de Envío</span>
                                    <span className="text-gray-700 dark:text-gray-300">{selectedOrder.direccion || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Products List */}
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Productos</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-200">Producto</th>
                                            <th className="px-4 py-2 text-center text-gray-700 dark:text-gray-200">Cant.</th>
                                            <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">Precio</th>
                                            <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-200">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {selectedOrder.detalles?.map((item, idx) => (
                                            <tr key={idx} className="bg-white dark:bg-gray-900">
                                                <td className="px-4 py-2 text-gray-800 dark:text-gray-100">{item.nombre_producto}</td>
                                                <td className="px-4 py-2 text-center text-gray-800 dark:text-gray-100">{item.cantidad}</td>
                                                <td className="px-4 py-2 text-right text-gray-800 dark:text-gray-100">{formatCurrency(item.precio_unitario)}</td>
                                                <td className="px-4 py-2 text-right font-medium text-gray-800 dark:text-gray-100">{formatCurrency(item.precio_unitario * item.cantidad)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="flex flex-col items-end space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between w-full md:w-1/2 text-sm">
                                <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                                <span className="text-gray-800 dark:text-gray-100">{formatCurrency(selectedOrder.subtotal)}</span>
                            </div>
                            <div className="flex justify-between w-full md:w-1/2 text-sm">
                                <span className="text-gray-600 dark:text-gray-300">Envío:</span>
                                <span className="text-gray-800 dark:text-gray-100">{formatCurrency(selectedOrder.costo_envio)}</span>
                            </div>
                            <div className="flex justify-between w-full md:w-1/2 text-lg font-bold text-rosa-oscuro dark:text-rosa-primario pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span>Total:</span>
                                <span>{formatCurrency(selectedOrder.total)}</span>
                            </div>
                        </div>

                        {/* Notes */}
                        {selectedOrder.notas && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                " {selectedOrder.notas} "
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Pedidos;
