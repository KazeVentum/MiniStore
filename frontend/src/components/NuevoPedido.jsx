import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductos, getClientes, getCanales, createPedido, updatePedido, getPedidoById, createCliente, createProducto, getCategorias } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import Modal from './ui/modal';
import { Plus, Trash2, Save, ArrowLeft, UserPlus, Clock } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

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
                        updated_at: pedido.ultima_edicion, // Map from DB column
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
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            {/* Header & Back Action */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <button
                        onClick={() => navigate('/pedidos')}
                        className="group flex items-center gap-2 text-slate-500 hover:text-rosa-oscuro dark:text-gray-400 dark:hover:text-rosa-primario transition-colors font-bold text-sm"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        VOLVER A PEDIDOS
                    </button>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
                        {isEditMode ? 'Editar' : 'Nuevo'} <span className="text-gradient">Pedido</span> ✨
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    {isEditMode && (formData.updated_at || formData.ultima_edicion) && (
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Editado el</span>
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {new Date(formData.updated_at || formData.ultima_edicion).toLocaleString('es-CO', {
                                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                })}
                            </span>
                        </div>
                    )}
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado del Pedido</span>
                        <span className={cn(
                            "text-xs font-bold px-3 py-0.5 rounded-full border",
                            formData.estado === 'completado' ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" :
                                formData.estado === 'pendiente' ? "text-amber-500 bg-amber-500/10 border-amber-500/20" :
                                    "text-slate-400 bg-slate-400/10 border-slate-400/20"
                        )}>
                            {(formData.estado || 'Pendiente').toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Order Details */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-white/5 premium-shadow overflow-visible">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                                <span className="p-2 rounded-xl bg-rosa-primario/20 text-rosa-oscuro dark:text-rosa-primario">
                                    <UserPlus className="h-5 w-5" />
                                </span>
                                Información del Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 flex justify-between items-center">
                                    Cliente Seleccionado
                                    <button
                                        type="button"
                                        onClick={() => setIsClientModalOpen(true)}
                                        className="text-rosa-oscuro dark:text-rosa-primario hover:underline transition-all flex items-center gap-1"
                                    >
                                        <Plus className="h-3 w-3" /> Nuevo Cliente
                                    </button>
                                </Label>

                                <div className="relative" ref={clientSearchRef}>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <Plus className="h-4 w-4" />
                                    </div>
                                    <Input
                                        className="pl-11 h-12 bg-white/50 dark:bg-dark-surface/50 border-white/20 rounded-2xl font-bold focus:ring-rosa-primario/30 transition-all"
                                        placeholder="Buscar o seleccionar cliente..."
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
                                        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-dark-surface border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                            <div className="p-2 space-y-1">
                                                {clientes
                                                    .filter(c =>
                                                        !searchTermClientes ||
                                                        c.nombre_cliente.toLowerCase().includes(searchTermClientes.toLowerCase())
                                                    )
                                                    .slice(0, searchTermClientes ? undefined : 10)
                                                    .map(c => (
                                                        <div
                                                            key={c.id_cliente}
                                                            className="px-4 py-3 rounded-xl hover:bg-rosa-primario/10 dark:hover:bg-rosa-primario/20 cursor-pointer text-sm font-bold text-slate-700 dark:text-gray-200 transition-all flex items-center justify-between group"
                                                            onClick={() => {
                                                                handleInputChange({ target: { name: 'id_cliente', value: c.id_cliente.toString() } });
                                                                setSearchTermClientes('');
                                                                setIsClientDropdownOpen(false);
                                                            }}
                                                        >
                                                            <span>{c.nombre_cliente}</span>
                                                            <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">SELECCIONAR</span>
                                                        </div>
                                                    ))}
                                                {clientes.filter(c => !searchTermClientes || c.nombre_cliente.toLowerCase().includes(searchTermClientes.toLowerCase())).length === 0 && (
                                                    <div className="px-5 py-8 text-center">
                                                        <p className="text-xs text-slate-500 font-medium mb-2">No se encontraron clientes</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsClientModalOpen(true);
                                                                setIsClientDropdownOpen(false);
                                                            }}
                                                            className="text-[10px] font-black uppercase text-rosa-oscuro dark:text-rosa-primario hover:underline"
                                                        >
                                                            Crear nuevo cliente
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Canal de Venta</Label>
                                <Select
                                    name="id_canal"
                                    value={formData.id_canal}
                                    onChange={handleInputChange}
                                    className="h-12 bg-white/50 dark:bg-white/5 border-white/20 rounded-2xl font-bold"
                                    required
                                >
                                    <option value="">Seleccionar Canal...</option>
                                    {canales.map(c => (
                                        <option key={c.id_canal} value={c.id_canal}>{c.nombre_canal}</option>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Fecha del Pedido</Label>
                                <Input
                                    type="date"
                                    name="fecha_pedido"
                                    value={formData.fecha_pedido}
                                    onChange={handleInputChange}
                                    className="h-12 bg-white/50 dark:bg-white/5 border-white/20 rounded-2xl font-bold"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Fecha Límite (Opcional)</Label>
                                <Input
                                    type="date"
                                    name="fecha_limite"
                                    value={formData.fecha_limite}
                                    onChange={handleInputChange}
                                    className="h-12 bg-white/50 dark:bg-white/5 border-white/20 rounded-2xl font-bold"
                                />
                                {diasRestantes !== null && (
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                        diasRestantes < 0 ? 'bg-rose-500/10 text-rose-500' : diasRestantes < 3 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                                    )}>
                                        {diasRestantes < 0 ? `Vencido (${Math.abs(diasRestantes)}d)` :
                                            diasRestantes === 0 ? 'Vence Hoy' :
                                                `${diasRestantes} días restantes`}
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-white/30 dark:bg-white/5 rounded-2xl border border-white/20">
                                    <input
                                        type="checkbox"
                                        id="requiere_envio"
                                        name="requiere_envio"
                                        checked={formData.requiere_envio}
                                        onChange={handleInputChange}
                                        className="h-5 w-5 accent-rosa-secundario rounded-lg"
                                    />
                                    <Label htmlFor="requiere_envio" className="mb-0 font-bold cursor-pointer">Este pedido requiere envío a domicilio</Label>
                                </div>

                                {formData.requiere_envio && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Dirección de Envío</Label>
                                        <Input
                                            name="direccion_envio"
                                            value={formData.direccion_envio}
                                            onChange={handleInputChange}
                                            className="h-12 bg-white/50 dark:bg-white/5 border-white/20 rounded-2xl font-bold"
                                            placeholder="Calle, Número, Ciudad..."
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Método de Pago</Label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                    {['Efectivo', 'Nequi', 'Daviplata', 'Transferencia', 'Otro'].map((metodo) => (
                                        <button
                                            key={metodo}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, metodo_pago: metodo }))}
                                            className={cn(
                                                "py-3 rounded-xl text-xs font-bold transition-all duration-300 border",
                                                formData.metodo_pago === metodo
                                                    ? "bg-rosa-secundario text-white border-rosa-secundario shadow-lg shadow-rosa-secundario/20"
                                                    : "bg-white/50 dark:bg-white/5 text-slate-600 dark:text-gray-400 border-white/20 hover:border-rosa-primario"
                                            )}
                                        >
                                            {metodo}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Notas Adicionales</Label>
                                <textarea
                                    name="notas"
                                    value={formData.notas}
                                    onChange={handleInputChange}
                                    className="w-full min-h-[100px] p-4 bg-white/50 dark:bg-white/5 border border-white/20 rounded-2xl font-medium text-sm focus:ring-2 focus:ring-rosa-primario/50 focus:border-rosa-primario outline-none transition-all placeholder:text-slate-400"
                                    placeholder="Especificaciones especiales, preferencias del cliente..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-white/5 premium-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                                <span className="p-2 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">
                                    <Plus className="h-5 w-5" />
                                </span>
                                Selección de Productos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 flex justify-between items-center">
                                        Elegir Producto
                                        <button
                                            type="button"
                                            onClick={() => setIsProductModalOpen(true)}
                                            className="text-rosa-oscuro dark:text-rosa-primario hover:underline transition-all flex items-center gap-1"
                                        >
                                            <Plus className="h-3 w-3" /> Nuevo Producto
                                        </button>
                                    </Label>
                                    <Select
                                        value={selectedProduct}
                                        onChange={(e) => setSelectedProduct(e.target.value)}
                                        className="h-12 bg-white/50 dark:bg-white/5 border-white/20 rounded-2xl font-bold"
                                    >
                                        <option value="">Agregar producto...</option>
                                        {productos.map(p => (
                                            <option key={p.id_producto} value={p.id_producto}>{p.nombre_producto} — {formatCurrency(p.precio)}</option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="w-full md:w-auto space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Cantidad</Label>
                                    <div className="flex items-center h-12 bg-white/50 dark:bg-white/5 border border-white/20 rounded-2xl overflow-hidden">
                                        <button type="button" onClick={decrementQuantity} className="px-4 h-full hover:bg-white/30 dark:hover:bg-white/10 transition-colors text-lg font-bold">×</button>
                                        <input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                            className="w-12 text-center bg-transparent border-none focus:ring-0 font-black"
                                        />
                                        <button type="button" onClick={incrementQuantity} className="px-4 h-full hover:bg-white/30 dark:hover:bg-white/10 transition-colors text-lg font-bold">+</button>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={addProduct}
                                    disabled={!selectedProduct}
                                    className="h-12 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                >
                                    <Plus className="h-5 w-5" /> AGREGAR
                                </button>
                            </div>

                            {formData.productos.length > 0 ? (
                                <div className="bg-white/30 dark:bg-white/5 rounded-3xl border border-white/20 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <th className="text-left px-6 py-4">Producto</th>
                                                <th className="text-center px-6 py-4">Cant.</th>
                                                <th className="text-right px-6 py-4">P. Unitario</th>
                                                <th className="text-right px-6 py-4">Subtotal</th>
                                                <th className="w-16"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {formData.productos.map((item, index) => (
                                                <tr key={index} className="group hover:bg-white/20 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-gray-200">{item.nombre}</td>
                                                    <td className="px-6 py-4 text-center font-black text-slate-500 dark:text-gray-400 bg-white/5">{item.cantidad}</td>
                                                    <td className="px-6 py-4 text-right font-medium text-slate-600 dark:text-gray-300">{formatCurrency(item.precio)}</td>
                                                    <td className="px-6 py-4 text-right font-black text-rosa-oscuro dark:text-rosa-primario">{formatCurrency(item.precio * item.cantidad)}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeProduct(index)}
                                                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-white/20 dark:bg-white/5 rounded-3xl border-2 border-dashed border-white/20">
                                    <div className="p-4 rounded-full bg-white/50 dark:bg-white/10 text-slate-300">
                                        <Plus className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-slate-500">¿Qué llevará el cliente?</p>
                                        <p className="text-xs text-slate-400 font-medium">Agrega productos para comenzar el pedido</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Summary */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
                    <Card className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-white/5 premium-shadow overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-rosa-oscuro via-rosa-primario to-purple-600" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-black tracking-tight">Resumen Financiero</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div className="flex justify-between items-center group">
                                <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">Subtotal Bruto</span>
                                <span className="font-extrabold text-slate-700 dark:text-gray-200 transition-transform group-hover:scale-110">
                                    {formatCurrency(formData.productos.reduce((sum, item) => sum + (item.precio * item.cantidad), 0))}
                                </span>
                            </div>

                            <div className="flex justify-between items-center px-4 py-3 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/20">
                                <span className="text-xs font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Plus className="h-3 w-3" /> Costo de Envío
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400">$</span>
                                    <input
                                        type="number"
                                        className="w-20 bg-transparent text-right font-black text-slate-900 dark:text-white focus:ring-0 focus:outline-none"
                                        value={formData.costo_envio}
                                        onChange={(e) => setFormData(prev => ({ ...prev, costo_envio: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <div className="flex justify-between items-end mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rosa-oscuro dark:text-rosa-primario">Total a Pagar</span>
                                        <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                                            {formatCurrency(calculateTotal())}
                                        </span>
                                    </div>
                                    <div className="text-[10px] font-black text-slate-400 text-right">
                                        COP — IVA Inc.
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-rosa-secundario hover:bg-rosa-oscuro text-white font-black rounded-2xl shadow-xl shadow-rosa-secundario/20 transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Save className="h-5 w-5" />
                                        {isEditMode ? 'GUARDAR CAMBIOS' : 'CONFIRMAR PEDIDO'}
                                    </button>

                                    {!isEditMode && (
                                        <button
                                            type="button"
                                            onClick={(e) => handleSubmit(e, 'borrador')}
                                            className="w-full py-4 bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 text-slate-700 dark:text-white font-bold rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus className="h-5 w-5" /> GUARDAR COMO BORRADOR
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Sistema de Seguridad Activo
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl border border-indigo-500/20 text-center space-y-2">
                        <p className="text-xs font-bold text-indigo-400">TIP PREMIUM ✨</p>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                            Los pedidos guardados como <span className="font-bold">Borrador</span> no afectan el stock de productos hasta que sean confirmados.
                        </p>
                    </div>
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
