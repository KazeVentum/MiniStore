import React, { useEffect, useState } from 'react';
import { getProductos, createProducto, updateProducto, deleteProducto, getCategorias } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import Modal from './ui/modal';
import { Plus, Trash2, Edit } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
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

    if (loading) return <div className="p-8 text-rosa-oscuro">Cargando productos... 💖</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-rosa-oscuro dark:text-white">Mis Productos 💍</h1>
                <Button
                    className="bg-rosa-oscuro hover:bg-rosa-primario text-white px-6 py-6 text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                    onClick={handleCreate}
                >
                    <Plus className="mr-2 h-6 w-6" /> Nuevo Producto
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productos.map((prod) => (
                    <Card key={prod.id_producto} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-48 bg-gradient-to-br from-rosa-suave/20 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50 flex items-center justify-center overflow-hidden">
                            {prod.imagen_url ? (
                                <img src={prod.imagen_url} alt={prod.nombre_producto} className="object-cover h-full w-full" />
                            ) : (
                                <div className="text-gray-300 dark:text-gray-600">Sin imagen</div>
                            )}
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-gray-900 dark:text-white">{prod.nombre_producto}</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                <span className="font-medium dark:text-gray-200">Categoría:</span> {prod.nombre_categoria}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-2xl font-bold text-rosa-oscuro dark:text-rosa-primario">
                                    {formatCurrency(prod.precio)}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${prod.stock > 5 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                    Stock: {prod.stock}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleEdit(prod)}
                                >
                                    <Edit className="h-4 w-4 mr-2" /> Editar
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={() => handleDelete(prod.id_producto)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Producto" : "Nuevo Producto ✨"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="nombre_producto">Nombre</Label>
                        <Input id="nombre_producto" name="nombre_producto" value={formData.nombre_producto} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Input id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleInputChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="precio">Precio</Label>
                            <Input
                                id="precio"
                                name="precio"
                                type="number"
                                step="1"
                                value={formData.precio ? Math.round(parseFloat(formData.precio)) : ''}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="tamano">Tamaño</Label>
                            <Select id="tamano" name="tamano" value={formData.tamano} onChange={handleInputChange}>
                                <option value="unico">Único</option>
                                <option value="pequeño">Pequeño</option>
                                <option value="mediano">Mediano</option>
                                <option value="grande">Grande</option>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="id_categoria">Categoría</Label>
                        <Select id="id_categoria" name="id_categoria" value={formData.id_categoria} onChange={handleInputChange} required>
                            <option value="">Seleccionar...</option>
                            {categorias.map(cat => (
                                <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre_categoria}</option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="imagen_url">URL Imagen</Label>
                        <Input id="imagen_url" name="imagen_url" value={formData.imagen_url} onChange={handleInputChange} placeholder="https://..." />
                    </div>
                    <Button type="submit" className="w-full mt-4">Guardar Producto 💖</Button>
                </form>
            </Modal>
        </div>
    );
};

export default Productos;
