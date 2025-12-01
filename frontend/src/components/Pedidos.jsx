import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPedidos, getPedidoById, updateEstadoPedido } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import Modal from './ui/modal';
import { Clock, CheckCircle, XCircle, Truck, Plus, Eye, User, MapPin, Phone, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const Pedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
            case 'pendiente': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'completado': return 'text-green-600 bg-green-100 border-green-200';
            case 'cancelado': return 'text-red-600 bg-red-100 border-red-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    if (loading) return <div className="p-8 text-rosa-oscuro">Cargando pedidos... 💖</div>;

    return (
        <div className="space-y-8">
            {/* Header & Main Action */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-rosa-oscuro dark:text-white">Pedidos 📦</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">Gestiona tus ventas y envíos</p>
                </div>
                <Button
                    className="bg-rosa-oscuro hover:bg-rosa-primario text-white px-6 py-6 text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                    onClick={() => navigate('/pedidos/nuevo')}
                >
                    <Plus className="mr-2 h-6 w-6" /> Nuevo Pedido
                </Button>
            </div>

            {/* Orders List */}
            <div className="grid grid-cols-1 gap-4">
                {pedidos.map((pedido) => (
                    <Card key={pedido.id_pedido} className="hover:shadow-md transition-all border-l-4 border-l-rosa-secundario">
                        <CardContent className="p-6">
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
                                            {new Date(pedido.fecha_pedido).toLocaleDateString()}
                                        </div>
                                        {pedido.fecha_limite && (
                                            <div className={`flex items-center gap-1 font-medium ${new Date(pedido.fecha_limite) < new Date() && pedido.estado === 'pendiente' ? 'text-red-500' :
                                                new Date(pedido.fecha_limite) < new Date(Date.now() + 3 * 86400000) && pedido.estado === 'pendiente' ? 'text-orange-500' :
                                                    'text-green-600 dark:text-green-400'
                                                }`}>
                                                <Clock className="h-4 w-4" />
                                                {new Date(pedido.fecha_limite).toLocaleDateString()}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            {pedido.nombre_cliente}
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
                ))}
            </div>

            {/* Order Details Modal */}
            <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title={`Detalles del Pedido #${selectedOrder?.id_pedido || ''}`}>
                {selectedOrder && (
                    <div className="space-y-6">
                        {/* Client Info Section */}
                        <div className="bg-rosa-suave/30 dark:bg-white/5 p-4 rounded-lg border border-rosa-suave">
                            <h3 className="font-semibold text-rosa-oscuro dark:text-rosa-primario mb-3 flex items-center gap-2">
                                <User className="h-5 w-5" /> Información del Cliente
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm text-gray-700 dark:text-gray-200">
                                <p><span className="font-medium dark:text-white">Nombre:</span> {selectedOrder.nombre_cliente}</p>
                                <p><span className="font-medium dark:text-white">Teléfono:</span> {selectedOrder.telefono || 'N/A'}</p>
                                <p><span className="font-medium dark:text-white">Fecha Pedido:</span> {new Date(selectedOrder.fecha_pedido).toLocaleDateString()}</p>
                                {selectedOrder.fecha_limite && (
                                    <p className={`${new Date(selectedOrder.fecha_limite) < new Date() && selectedOrder.estado === 'pendiente' ? 'text-red-500 font-bold' : ''
                                        }`}>
                                        <span className="font-medium dark:text-white text-gray-700">Fecha Límite:</span> {new Date(selectedOrder.fecha_limite).toLocaleDateString()}
                                    </p>
                                )}
                                <p className="md:col-span-2"><span className="font-medium dark:text-white">Dirección:</span> {selectedOrder.direccion || 'N/A'}</p>
                                {selectedOrder.direccion_envio && (
                                    <p className="md:col-span-2 text-rosa-oscuro dark:text-rosa-primario"><span className="font-medium dark:text-white">Enviar a:</span> {selectedOrder.direccion_envio}</p>
                                )}
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
