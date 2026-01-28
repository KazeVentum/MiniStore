import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductos, getClientes, getCanales, createPedido, updatePedido, getPedidoById, createCliente, createProducto, getCategorias } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import Modal from './ui/modal';
import { Plus, Trash2, Save, ArrowLeft, UserPlus } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const NuevoPedido = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [loading, setLoading] = useState(true);
    const [clientes, setClientes] = useState([]);
    const [canales, setCanales] = useState([]);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]); // For product creation

    const [formData, setFormData] = useState({
        id_cliente: '',
        id_canal: '',
        fecha_pedido: new Date().toLocaleDateString('en-CA'),
        fecha_limite: '', // New field
        costo_envio: 0,
        requiere_envio: false,
        direccion_envio: '',
        notas: '',
        metodo_pago: 'Efectivo',
        productos: [] // { id_producto, cantidad, precio, nombre }
    });

    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [diasRestantes, setDiasRestantes] = useState(null);

    // Cliente Search States
    const [searchTermClientes, setSearchTermClientes] = useState('');
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const clientSearchRef = useRef(null);

    // Handle click outside for client dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (clientSearchRef.current && !clientSearchRef.current.contains(event.target)) {
                setIsClientDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Quick Client Creation States
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [clientFormData, setClientFormData] = useState({
        nombre_cliente: '',
        telefono: '',
        direccion: '',
        notas: ''
    });

    // Quick Product Creation States
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productFormData, setProductFormData] = useState({
        nombre_producto: '',
        descripcion: '',
        precio: '',
        tamano: 'unico',
        imagen_url: '',
        id_categoria: ''
    });

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
                const [cliData, canData, prodData, catData] = await Promise.all([
                    getClientes(),
                    getCanales(),
                    getProductos(),
                    getCategorias()
                ]);
                setClientes(cliData);
                setCanales(canData);
                setProductos(prodData);
                setCategorias(catData);
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

    useEffect(() => {
        if (isEditMode) {
            const loadPedido = async () => {
                try {
                    const pedido = await getPedidoById(id);
                    setFormData({
                        fecha_pedido: pedido.fecha_pedido.split('T')[0],
                        fecha_limite: pedido.fecha_limite ? pedido.fecha_limite.split('T')[0] : '',
                        id_cliente: pedido.id_cliente,
                        id_canal: pedido.id_canal,
                        costo_envio: pedido.costo_envio,
                        requiere_envio: pedido.requiere_envio === 1,
                        direccion_envio: pedido.direccion_envio || '',
                        notas: pedido.notas || '',
                        metodo_pago: pedido.metodo_pago,
                        estado: pedido.estado,
                        productos: pedido.detalles.map(d => ({
                            id_producto: d.id_producto,
                            nombre: d.nombre_producto, // Fixed mapping
                            precio: d.precio_unitario,
                            cantidad: d.cantidad
                        }))
                    });
                } catch (error) {
                    alert('Error al cargar el pedido');
                    navigate('/pedidos');
                }
            };
            loadPedido();
        }
    }, [id, isEditMode, navigate]);

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

    const handleClientInputChange = (e) => {
        const { name, value } = e.target;
        setClientFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClientSubmit = async (e) => {
        e.preventDefault();
        try {
            const newClient = await createCliente(clientFormData);
            // Refresh client list
            const updatedClients = await getClientes();
            setClientes(updatedClients);

            // Auto-select new client
            setFormData(prev => ({ ...prev, id_cliente: newClient.id }));

            // Close modal and reset form
            setIsClientModalOpen(false);
            setClientFormData({ nombre_cliente: '', telefono: '', direccion: '', notas: '' });
        } catch (error) {
            alert('Error al crear cliente rápido');
        }
    };

    const handleProductInputChange = (e) => {
        const { name, value } = e.target;
        setProductFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const newProduct = await createProducto(productFormData);
            // Refresh product list
            const updatedProducts = await getProductos();
            setProductos(updatedProducts);

            // Auto-select new product
            setSelectedProduct(newProduct.id);

            // Close modal and reset form
            setIsProductModalOpen(false);
            setProductFormData({
                nombre_producto: '',
                descripcion: '',
                precio: '',
                tamano: 'unico',
                imagen_url: '',
                id_categoria: ''
            });
        } catch (error) {
            alert('Error al crear producto rápido');
        }
    };

    const handleSubmit = async (e, forcedStatus = null) => {
        if (e) e.preventDefault();
        if (formData.productos.length === 0) {
            alert('Agrega al menos un producto');
            return;
        }
        try {
            const dataToSubmit = {
                ...formData,
                estado: forcedStatus || (isEditMode ? formData.estado : 'pendiente')
            };

            if (isEditMode) {
                await updatePedido(id, dataToSubmit);
            } else {
                await createPedido(dataToSubmit);
            }
            navigate('/pedidos');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Error al procesar pedido';
            alert(`Error: ${errorMsg}`);
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
                                <Label className="flex justify-between items-center">
                                    Cliente
                                    <button
                                        type="button"
                                        onClick={() => setIsClientModalOpen(true)}
                                        className="text-[10px] bg-rosa-primario/50 text-rosa-oscuro px-2 py-0.5 rounded-full hover:bg-rosa-primario transition-colors flex items-center gap-1"
                                    >
                                        <Plus className="h-2 w-2" /> Nuevo
                                    </button>
                                </Label>
                                <Select name="id_cliente" value={formData.id_cliente} onChange={handleInputChange} className="hidden" required>
                                    <option value="">Seleccionar Cliente...</option>
                                    {clientes.map(c => (
                                        <option key={c.id_cliente} value={c.id_cliente}>{c.nombre_cliente}</option>
                                    ))}
                                </Select>

                                <div className="relative mt-1" ref={clientSearchRef}>
                                    <Input
                                        placeholder="Buscar cliente..."
                                        value={searchTermClientes || (clientes.find(c => c.id_cliente === parseInt(formData.id_cliente))?.nombre_cliente || '')}
                                        onChange={(e) => {
                                            setSearchTermClientes(e.target.value);
                                            setIsClientDropdownOpen(true);
                                            if (e.target.value === '') {
                                                setFormData(prev => ({ ...prev, id_cliente: '' }));
                                            }
                                        }}
                                        onFocus={() => setIsClientDropdownOpen(true)}
                                    />
                                    {isClientDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border-2 border-rosa-primario/30 rounded-xl shadow-xl max-h-60 overflow-y-auto backdrop-blur-md">
                                            {clientes
                                                .filter(c =>
                                                    !searchTermClientes ||
                                                    c.nombre_cliente.toLowerCase().includes(searchTermClientes.toLowerCase())
                                                )
                                                .slice(0, searchTermClientes ? undefined : 5)
                                                .map(c => (
                                                    <div
                                                        key={c.id_cliente}
                                                        className="px-4 py-2 hover:bg-rosa-primario/20 cursor-pointer text-sm text-gray-900 dark:text-gray-100 transition-colors"
                                                        onClick={() => {
                                                            handleInputChange({ target: { name: 'id_cliente', value: c.id_cliente.toString() } });
                                                            setSearchTermClientes('');
                                                            setIsClientDropdownOpen(false);
                                                        }}
                                                    >
                                                        {c.nombre_cliente}
                                                    </div>
                                                ))}
                                            {clientes.filter(c => !searchTermClientes || c.nombre_cliente.toLowerCase().includes(searchTermClientes.toLowerCase())).length === 0 && (
                                                <div className="px-4 py-2 text-sm text-gray-500 italic">No se encontraron clientes</div>
                                            )}
                                        </div>
                                    )}
                                </div>
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
                                <Label>Método de Pago</Label>
                                <Select name="metodo_pago" value={formData.metodo_pago} onChange={handleInputChange} required>
                                    <option value="Efectivo">💵 Efectivo</option>
                                    <option value="Nequi">📱 Nequi</option>
                                    <option value="Daviplata">📱 Daviplata</option>
                                    <option value="Transferencia">🏦 Transferencia Bancaria</option>
                                    <option value="Otro">✨ Otro</option>
                                </Select>
                            </div>
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
                                    <Label className="flex justify-between items-center">
                                        Producto
                                        <button
                                            type="button"
                                            onClick={() => setIsProductModalOpen(true)}
                                            className="text-[10px] bg-rosa-primario/50 text-rosa-oscuro px-2 py-0.5 rounded-full hover:bg-rosa-primario transition-colors flex items-center gap-1"
                                        >
                                            <Plus className="h-2 w-2" /> Nuevo
                                        </button>
                                    </Label>
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
                            <div className="pt-2 space-y-2">
                                <Button
                                    type="button"
                                    onClick={(e) => handleSubmit(e, 'borrador')}
                                    variant="outline"
                                    className="w-full border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Guardar Borrador
                                </Button>
                                <Button type="submit" className="w-full bg-rosa-oscuro hover:bg-rosa-primario">
                                    <Save className="mr-2 h-4 w-4" /> {isEditMode ? 'Guardar Cambios' : 'Crear Pedido'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
            {/* Quick Client Modal */}
            <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Registro Rápido de Cliente ✨">
                <form onSubmit={handleClientSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="nombre_cliente">Nombre Completo</Label>
                        <Input
                            id="nombre_cliente"
                            name="nombre_cliente"
                            value={clientFormData.nombre_cliente}
                            onChange={handleClientInputChange}
                            required
                            placeholder="Ej: Maria Lopez"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="telefono">Teléfono</Label>
                            <Input
                                id="telefono"
                                name="telefono"
                                value={clientFormData.telefono}
                                onChange={handleClientInputChange}
                                placeholder="300 123 4567"
                            />
                        </div>
                        <div>
                            <Label htmlFor="direccion">Dirección</Label>
                            <Input
                                id="direccion"
                                name="direccion"
                                value={clientFormData.direccion}
                                onChange={handleClientInputChange}
                                placeholder="Calle 123 #45-67"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="notas">Notas Internas</Label>
                        <Input
                            id="notas"
                            name="notas"
                            value={clientFormData.notas}
                            onChange={handleClientInputChange}
                            placeholder="Ej: Prefiere entregas en la mañana"
                        />
                    </div>
                    <Button type="submit" className="w-full mt-4 bg-rosa-secundario hover:bg-rosa-oscuro text-white shadow-md shadow-rosa-secundario/20">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Registrar y Seleccionar ✨
                    </Button>
                </form>
            </Modal>

            {/* Quick Product Modal */}
            <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Registro Rápido de Producto 💍">
                <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="quick_nombre_producto">Nombre</Label>
                        <Input
                            id="quick_nombre_producto"
                            name="nombre_producto"
                            value={productFormData.nombre_producto}
                            onChange={handleProductInputChange}
                            required
                            placeholder="Ej: Anillo de Plata"
                        />
                    </div>
                    <div>
                        <Label htmlFor="quick_descripcion">Descripción</Label>
                        <Input
                            id="quick_descripcion"
                            name="descripcion"
                            value={productFormData.descripcion}
                            onChange={handleProductInputChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="quick_precio">Precio</Label>
                            <Input
                                id="quick_precio"
                                name="precio"
                                type="number"
                                step="1"
                                value={productFormData.precio}
                                onChange={handleProductInputChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="quick_tamano">Tamaño</Label>
                            <Select id="quick_tamano" name="tamano" value={productFormData.tamano} onChange={handleProductInputChange}>
                                <option value="unico">Único</option>
                                <option value="pequeño">Pequeño</option>
                                <option value="mediano">Mediano</option>
                                <option value="grande">Grande</option>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="quick_id_categoria">Categoría</Label>
                        <Select id="quick_id_categoria" name="id_categoria" value={productFormData.id_categoria} onChange={handleProductInputChange} required>
                            <option value="">Seleccionar...</option>
                            {categorias.map(cat => (
                                <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre_categoria}</option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="quick_imagen_url">URL Imagen</Label>
                        <Input id="quick_imagen_url" name="imagen_url" value={productFormData.imagen_url} onChange={handleProductInputChange} placeholder="https://..." />
                    </div>
                    <Button type="submit" className="w-full mt-4 bg-rosa-secundario hover:bg-rosa-oscuro text-white shadow-md shadow-rosa-secundario/20">
                        <Save className="h-4 w-4 mr-2" />
                        Guardar y Agregar 💍
                    </Button>
                </form>
            </Modal>
        </div>
    );
};

export default NuevoPedido;
