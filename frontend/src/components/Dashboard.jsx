import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getVentasRecientes, getProductosTop } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingBag, Package, Clock } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ ventasHoy: 0, pedidosHoy: 0, pedidosPendientes: 0, totalProductos: 0 });
    const [ventasRecientes, setVentasRecientes] = useState([]);
    const [productosTop, setProductosTop] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, ventasData, topData] = await Promise.all([
                    getDashboardStats(),
                    getVentasRecientes('7'),
                    getProductosTop()
                ]);
                setStats(statsData);
                setVentasRecientes(ventasData);
                setProductosTop(topData);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-rosa-oscuro dark:text-rosa-primario">Cargando dashboard... 💖</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-rosa-oscuro dark:text-white">Panel de Control ✨</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Ventas Hoy</CardTitle>
                        <DollarSign className="h-4 w-4 text-rosa-oscuro" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.ventasHoy)}</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{stats.pedidosHoy} pedidos hoy</p>
                    </CardContent>
                </Card>
                <Card
                    className="cursor-pointer hover:bg-white/50 transition-colors"
                    onClick={() => navigate('/pedidos')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Pendientes</CardTitle>
                        <Clock className="h-4 w-4 text-amarillo-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amarillo-warning dark:text-yellow-400">{stats.pedidosPendientes}</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pedidos por atender</p>
                    </CardContent>
                </Card>
                <Card
                    className="cursor-pointer hover:bg-white/50 transition-colors"
                    onClick={() => navigate('/productos')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Total Productos</CardTitle>
                        <Package className="h-4 w-4 text-rosa-oscuro" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProductos}</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Productos activos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Total Ventas (7d)</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-rosa-oscuro" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(ventasRecientes.reduce((acc, curr) => acc + parseFloat(curr.total), 0))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Últimos 7 días</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Ventas Recientes</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[...ventasRecientes].reverse()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="fecha_pedido"
                                    tickFormatter={(value) => {
                                        const date = new Date(value);
                                        const year = date.getFullYear();
                                        const month = date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
                                        const day = String(date.getDate()).padStart(2, '0');
                                        return `${year}-${month}-${day}`;
                                    }}
                                    tick={{ fontSize: 11 }}
                                />
                                <YAxis
                                    tickFormatter={(value) => formatCurrency(value).replace('$ ', '$')}
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    labelFormatter={(label) => {
                                        const date = new Date(label);
                                        const year = date.getFullYear();
                                        const month = date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
                                        const day = String(date.getDate()).padStart(2, '0');
                                        return `${year}-${month}-${day}`;
                                    }}
                                />
                                <Line type="monotone" dataKey="total" stroke="#FF69B4" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Top Productos</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={productosTop} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="nombre_producto"
                                    type="category"
                                    width={100}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip formatter={(value) => [value, 'Vendidos']} />
                                <Bar dataKey="total_vendido" fill="#FFB6C1" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
