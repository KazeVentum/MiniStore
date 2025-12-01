import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductos, getClientes, getCanales, createPedido } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const NuevoPedido = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [clientes, setClientes] = useState([]);
    const [canales, setCanales] = useState([]);
    const [productos, setProductos] = useState([]);

    const [formData, setFormData] = useState({
        id_cliente: '',
        id_canal: '',
        fecha_pedido: new Date().toISOString().split('T')[0],
        fecha_limite: '', // New field
        costo_envio: 0,
        requiere_envio: false,
        direccion_envio: '',
        notas: '',
        productos: [] // { id_producto, cantidad, precio, nombre }
    });

    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [diasRestantes, setDiasRestantes] = useState(null); // New state for calculation

    useEffect(() => {
        if (formData.fecha_limite) {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const limite = new Date(formData.fecha_limite);
            limite.setHours(0, 0, 0, 0);
            
            const diffTime = limite - hoy;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDiasRestantes(diffDays);
        } else {
            setDiasRestantes(null);
        }
    }, [formData.fecha_limite]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cliData, canData, prodData] = await Promise.all([
                    getClientes(),
                    getCanales(),
                    getProductos()
                ]);
                setClientes(cliData);
                setCanales(canData);
                setProductos(prodData);
            } catch (error) {
                console.error("Error loading data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Address Autofill Logic
    useEffect(() => {
        if (formData.id_cliente && formData.requiere_envio) {
            const cliente = clientes.find(c => c.id_cliente === parseInt(formData.id_cliente));
            if (cliente && cliente.direccion) {
                setFormData(prev => ({ ...prev, direccion_envio: cliente.direccion }));
            }
        }
    }, [formData.id_cliente, formData.requiere_envio, clientes]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const addProduct = () => {
        if (!selectedProduct) return;
        const product = productos.find(p => p.id_producto === parseInt(selectedProduct));
        if (!product) return;

        setFormData(prev => ({
            ...prev,
            productos: [
                ...prev.productos,
                {
                    id_producto: product.id_producto,
                    nombre: product.nombre_producto,
                    precio: product.precio,
                    cantidad: parseInt(quantity)
                }
            ]
        }));
        setSelectedProduct('');
        setQuantity(1);
    };

    const removeProduct = (index) => {
        setFormData(prev => ({
            ...prev,
            productos: prev.productos.filter((_, i) => i !== index)
        }));
    };

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const calculateTotal = () => {
        const subtotal = formData.productos.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        return subtotal + parseFloat(formData.costo_envio || 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.productos.length === 0) {
            alert('Agrega al menos un producto');
            return;
        }
        try {
            await createPedido(formData);
            navigate('/pedidos');
        } catch (error) {
            alert('Error al crear pedido');
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-rosa-oscuro">Cargando... 💖</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => navigate('/pedidos')}>
                    <ArrowLeft className="h-5 w-5 mr-2" /> Volver
                </Button>
                <h1 className="text-2xl font-bold text-rosa-oscuro dark:text-white">Nuevo Pedido 💝</h1>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-gray-900 dark:text-white">Detalles del Pedido</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Cliente</Label>
                                <Select name="id_cliente" value={formData.id_cliente} onChange={handleInputChange} required>
                                    <option value="">Seleccionar Cliente...</option>
                                    {clientes.map(c => (
                                        <option key={c.id_cliente} value={c.id_cliente}>{c.nombre_cliente}</option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Label>Canal de Venta</Label>
                                <Select name="id_canal" value={formData.id_canal} onChange={handleInputChange} required>
                                    <option value="">Seleccionar Canal...</option>
                                    {canales.map(c => (
                                        <option key={c.id_canal} value={c.id_canal}>{c.nombre_canal}</option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Label>Fecha del Pedido</Label>
                                <Input type="date" name="fecha_pedido" value={formData.fecha_pedido} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <Label>Fecha Límite</Label>
                                <Input type="date" name="fecha_limite" value={formData.fecha_limite} onChange={handleInputChange} />
                                {diasRestantes !== null && (
                                    <p className={`text-sm mt-1 ${diasRestantes < 0 ? 'text-red-500' : diasRestantes < 3 ? 'text-orange-500' : 'text-green-600'}`}>
                                        {diasRestantes < 0 ? `Vencido hace ${Math.abs(diasRestantes)} días` : 
                                         diasRestantes === 0 ? 'Vence hoy' : 
                                         `${diasRestantes} días restantes`}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-6">
                                <input type="checkbox" id="requiere_envio" name="requiere_envio" checked={formData.requiere_envio} onChange={handleInputChange} className="h-4 w-4 text-rosa-oscuro rounded border-gray-300 focus:ring-rosa-oscuro" />
                                <Label htmlFor="requiere_envio" className="mb-0">Requiere Envío</Label>
                            </div>
                            {formData.requiere_envio && (
                                <div className="md:col-span-2">
                                    <Label>Dirección de Envío</Label>
                                    <Input name="direccion_envio" value={formData.direccion_envio} onChange={handleInputChange} />
                                </div>
                            )}
                            <div className="md:col-span-2">
                                <Label>Notas</Label>
                                <Input name="notas" value={formData.notas} onChange={handleInputChange} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-gray-900 dark:text-white">Productos</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <Label>Producto</Label>
                                    <Select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                                        <option value="">Agregar producto...</option>
                                        {productos.map(p => (
                                            <option key={p.id_producto} value={p.id_producto}>{p.nombre_producto} - {formatCurrency(p.precio)}</option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="flex-shrink-0">
                                    <Label>Cantidad</Label>
                                    <div className="flex items-center border-2 border-white/40 dark:border-white/20 rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md overflow-hidden">
                                        <button type="button" onClick={decrementQuantity} className="px-3 py-2 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors text-gray-900 dark:text-white">−</button>
                                        <input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                            className="w-16 text-center bg-transparent border-none focus:ring-0 focus:outline-none p-2 text-gray-900 dark:text-white"
                                        />
                                        <button type="button" onClick={incrementQuantity} className="px-3 py-2 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors text-gray-900 dark:text-white">+</button>
                                    </div>
                                </div>
                                <Button type="button" onClick={addProduct} disabled={!selectedProduct}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {formData.productos.length > 0 ? (
                                <div className="border-2 border-white/40 dark:border-white/20 rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-rosa-suave/50 dark:bg-white/5">
                                            <tr>
                                                <th className="text-left px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold">Producto</th>
                                                <th className="text-center px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold">Cant.</th>
                                                <th className="text-right px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold">Precio</th>
                                                <th className="text-right px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold">Total</th>
                                                <th className="w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.productos.map((item, index) => (
                                                <tr key={index} className="border-t border-white/20 dark:border-white/10 hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-3 text-gray-900 dark:text-white">{item.nombre}</td>
                                                    <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{item.cantidad}</td>
                                                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{formatCurrency(item.precio)}</td>
                                                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-semibold">{formatCurrency(item.precio * item.cantidad)}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button type="button" onClick={() => removeProduct(index)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="px-4 py-4 text-center text-gray-400 border-2 border-white/40 dark:border-white/20 rounded-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md">
                                    No hay productos agregados
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Summary */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-gray-900 dark:text-white">Resumen</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(formData.productos.reduce((sum, item) => sum + (item.precio * item.cantidad), 0))}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-300">Envío:</span>
                                <Input
                                    type="number"
                                    className="w-24 text-right h-8 text-gray-900 dark:text-white"
                                    value={formData.costo_envio}
                                    onChange={(e) => setFormData(prev => ({ ...prev, costo_envio: e.target.value }))}
                                />
                            </div>
                            <div className="border-t pt-4 flex justify-between items-center border-gray-200 dark:border-gray-700">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">Total:</span>
                                <span className="text-xl font-bold text-rosa-oscuro dark:text-rosa-primario">{formatCurrency(calculateTotal())}</span>
                            </div>
                            <Button type="submit" className="w-full mt-4 bg-rosa-oscuro hover:bg-rosa-primario">
                                <Save className="mr-2 h-4 w-4" /> Crear Pedido
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
};

export default NuevoPedido;
