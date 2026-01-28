import React, { useEffect, useState } from 'react';
import { getProductos, createProducto, updateProducto, deleteProducto, getCategorias } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import Modal from './ui/modal';
import { Plus, Trash2, Edit, Package, Search, Filter, Sparkles, Tag } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const [formData, setFormData] = useState({
        nombre_producto: '',
        descripcion: '',
        precio: '',
        tamano: 'unico',
        imagen_url: '',
        id_categoria: ''
    });

    const fetchProductos = async () => {
        try {
            const [prodData, catData] = await Promise.all([getProductos(), getCategorias()]);
            setProductos(prodData);
            setCategorias(catData);
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            await deleteProducto(id);
            fetchProductos();
        }
    };

    const handleEdit = (producto) => {
        setEditingId(producto.id_producto);
        setFormData({
            nombre_producto: producto.nombre_producto,
            descripcion: producto.descripcion || '',
            precio: producto.precio,
            tamano: producto.tamano || 'unico',
            imagen_url: producto.imagen_url || '',
            id_categoria: producto.id_categoria
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingId(null);
        setFormData({
            nombre_producto: '',
            descripcion: '',
            precio: '',
            tamano: 'unico',
            imagen_url: '',
            id_categoria: ''
        });
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateProducto(editingId, formData);
            } else {
                await createProducto(formData);
            }
            setIsModalOpen(false);
            fetchProductos();
        } catch (error) {
            alert('Error al guardar producto');
        }
    };

    const filteredProductos = productos.filter(p => {
        const matchesSearch = p.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.id_categoria === parseInt(selectedCategory);
        return matchesSearch && matchesCategory;
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-rosa-primario/30 border-t-rosa-oscuro rounded-full animate-spin" />
            <p className="text-rosa-oscuro font-bold animate-pulse">Revelando catálogo de lujo... 💍</p>
        </div>
    );

    return (
        <div className="space-y-10 pb-12 animate-in fade-in duration-700">
            {/* Header section with Actions & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
                        Mi <span className="text-gradient">Catálogo</span> 💍
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 font-medium">Gestiona tu inventario con elegancia y precisión</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar producto..."
                            className="pl-11 h-12 bg-white/50 dark:bg-white/5 border-white/20 rounded-2xl font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        className="w-full sm:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-12 px-8 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        onClick={handleCreate}
                    >
                        <Plus className="h-5 w-5" /> NUEVO PRODUCTO
                    </Button>
                </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={cn(
                        "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                        selectedCategory === 'all'
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg"
                            : "bg-white/50 dark:bg-white/5 text-slate-500 dark:text-gray-400 border-white/20 hover:border-rosa-primario"
                    )}
                >
                    Todos
                </button>
                {categorias.map(cat => (
                    <button
                        key={cat.id_categoria}
                        onClick={() => setSelectedCategory(cat.id_categoria.toString())}
                        className={cn(
                            "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                            selectedCategory === cat.id_categoria.toString()
                                ? "bg-rosa-secundario text-white border-rosa-secundario shadow-lg shadow-rosa-secundario/20"
                                : "bg-white/50 dark:bg-white/5 text-slate-500 dark:text-gray-400 border-white/20 hover:border-rosa-primario"
                        )}
                    >
                        {cat.nombre_categoria}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            {filteredProductos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProductos.map((prod) => (
                        <Card key={prod.id_producto} className="glass glass-dark border-none premium-shadow group overflow-hidden transition-all duration-500 hover:-translate-y-2">
                            <div className="relative h-64 bg-slate-100 dark:bg-dark-surface/50 flex items-center justify-center overflow-hidden">
                                {prod.imagen_url ? (
                                    <img
                                        src={prod.imagen_url}
                                        alt={prod.nombre_producto}
                                        className="object-cover h-full w-full group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="text-slate-300 dark:text-slate-600 flex flex-col items-center">
                                        <Package className="h-12 w-12 mb-3 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                                        <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-30">Sin imagen</span>
                                    </div>
                                )}

                                {/* Overlay Badges */}
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white border border-white/50 shadow-sm flex items-center gap-1.5">
                                        <Tag className="h-3 w-3 text-rosa-oscuro" /> {prod.nombre_categoria}
                                    </span>
                                </div>

                                <div className="absolute bottom-4 right-4">
                                    <span className={cn(
                                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/30 shadow-sm backdrop-blur-md",
                                        prod.stock > 5
                                            ? "bg-emerald-500/90 text-white"
                                            : "bg-amber-500/90 text-white"
                                    )}>
                                        {prod.stock} disponibles
                                    </span>
                                </div>

                                {/* Action Overlay */}
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 scale-110 group-hover:scale-100 transition-transform">
                                    <button
                                        onClick={() => handleEdit(prod)}
                                        className="p-3 bg-white text-slate-900 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(prod.id_producto)}
                                        className="p-3 bg-rose-500 text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white truncate tracking-tight group-hover:text-rosa-oscuro transition-colors">{prod.nombre_producto}</h3>
                                    <p className="text-xs text-slate-500 dark:text-gray-400 font-medium line-clamp-1">{prod.descripcion || 'Sin descripción adicional'}</p>
                                </div>

                                <div className="pt-2 flex justify-between items-end border-t border-slate-100 dark:border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Precio Sugerido</span>
                                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                                            {formatCurrency(prod.precio)}
                                        </span>
                                    </div>
                                    <div className="p-2 rounded-xl bg-rosa-primario/10 text-rosa-oscuro dark:text-rosa-primario">
                                        <Sparkles className="h-5 w-5 animate-pulse" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 glass glass-dark rounded-[2.5rem] border-2 border-dashed border-white/20">
                    <div className="p-8 rounded-full bg-indigo-500/10 text-indigo-500 animate-bounce">
                        <Package className="h-12 w-12" />
                    </div>
                    <div className="space-y-2 max-w-sm px-6">
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Tu escaparate está vacío</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed">Comienza a cargar tus piezas de bisutería para poder crear pedidos y deslumbrar a tus clientes.</p>
                    </div>
                    <Button
                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 h-12 rounded-2xl font-black shadow-xl"
                        onClick={handleCreate}
                    >
                        AGREGAR PRIMER PRODUCTO 💍
                    </Button>
                </div>
            )}

            {/* Premium Product Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Pieza de Colección" : "Nueva Pieza para el Catálogo 💍"}>
                <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                    <div className="space-y-6 bg-white/50 dark:bg-white/5 p-6 rounded-3xl border border-white/20">
                        <div className="space-y-2">
                            <Label htmlFor="nombre_producto" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Nombre de la Joya</Label>
                            <Input
                                id="nombre_producto"
                                name="nombre_producto"
                                value={formData.nombre_producto}
                                onChange={handleInputChange}
                                required
                                className="h-12 bg-white dark:bg-slate-900/50 border-white/20 rounded-xl font-bold"
                                placeholder="Ej: Collar de Cuarzo Rosa"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="descripcion" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Descripción / Historia</Label>
                            <Input
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                className="h-12 bg-white dark:bg-slate-900/50 border-white/20 rounded-xl font-bold"
                                placeholder="Breve detalle sobre la pieza..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="precio" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Valor Comercial (COP)</Label>
                                <Input
                                    id="precio"
                                    name="precio"
                                    type="number"
                                    step="1"
                                    value={formData.precio ? Math.round(parseFloat(formData.precio)) : ''}
                                    onChange={handleInputChange}
                                    required
                                    className="h-12 bg-white dark:bg-slate-900/50 border-white/20 rounded-xl font-black"
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tamano" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Medida / Tamaño</Label>
                                <Select
                                    id="tamano"
                                    name="tamano"
                                    value={formData.tamano}
                                    onChange={handleInputChange}
                                    className="h-12 bg-white dark:bg-slate-900/50 border-white/20 rounded-xl font-bold"
                                >
                                    <option value="unico">Único / Ajustable</option>
                                    <option value="pequeño">Pequeño (S)</option>
                                    <option value="mediano">Mediano (M)</option>
                                    <option value="grande">Grande (L)</option>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="id_categoria" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Categoría del Producto</Label>
                                <Select
                                    id="id_categoria"
                                    name="id_categoria"
                                    value={formData.id_categoria}
                                    onChange={handleInputChange}
                                    required
                                    className="h-12 bg-white dark:bg-slate-900/50 border-white/20 rounded-xl font-bold"
                                >
                                    <option value="">Seleccionar categoría...</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre_categoria}</option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imagen_url" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400 ml-1">Enlace de Imagen (URL)</Label>
                            <Input
                                id="imagen_url"
                                name="imagen_url"
                                value={formData.imagen_url}
                                onChange={handleInputChange}
                                placeholder="https://ejemplo.com/foto.jpg"
                                className="h-12 bg-white dark:bg-slate-900/50 border-white/20 rounded-xl font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 h-14 rounded-2xl font-black text-slate-400 uppercase tracking-widest"
                        >
                            CANCELAR
                        </Button>
                        <Button
                            type="submit"
                            className="flex-[2] h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <Sparkles className="h-5 w-5" />
                            {editingId ? 'ACTUALIZAR PIEZA' : 'GUARDAR EN CATÁLOGO ✨'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Productos;
