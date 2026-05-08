import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Trash2, ArrowLeft, Edit2, X, Save, Search, Star, ImageIcon, GripVertical } from 'lucide-react';
import { formatCOP } from '../utils/auth.js';
import api from '../services/api.js';
import { sileo } from 'sileo';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const STORAGE_KEY = 'product_order';

// Crea un handler genérico para actualizar un campo de formulario y limpiar su error
const makeHandler = (setState, setErrors) => (e) => {
  const { name, value, type, checked } = e.target;
  setState(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  setErrors(prev => ({ ...prev, [name]: '' }));
};

const ProductImage = ({ src, alt }) => {
  const [error, setError] = useState(false);

  if (src && !error) {
    return (
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Package className="w-6 h-6 text-slate-600" />
    </div>
  );
};

const SortableProduct = ({ product, isEditing, editFormData, onEditChange, onSave, onEdit, onDelete, onCancel }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 hover:bg-slate-700/50 transition-colors flex items-center gap-4 border-b border-slate-700 last:border-b-0"
    >
      <div
        {...attributes}
        {...listeners}
        className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0">
        <ProductImage src={product.image_url} alt={product.name} />
      </div>

      {isEditing ? (
        <div className="flex-1 flex flex-wrap items-center gap-2">
          <input
            type="text"
            name="name"
            value={editFormData.name}
            onChange={onEditChange}
            className="flex-1 min-w-[120px] px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-orange-500 focus:outline-none text-sm"
          />
          <input
            type="number"
            name="price"
            value={editFormData.price}
            onChange={onEditChange}
            className="w-28 px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-orange-500 focus:outline-none text-sm"
          />
          <input
            type="url"
            name="image_url"
            value={editFormData.image_url}
            onChange={onEditChange}
            placeholder="URL imagen"
            className="flex-1 min-w-[160px] px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none text-sm"
          />
          <label className="flex items-center gap-1 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              checked={editFormData.featured}
              onChange={onEditChange}
              className="accent-orange-500"
            />
            <Star className="w-4 h-4 text-orange-400" />
          </label>
          <button onClick={onSave} className="p-2 text-green-400 hover:bg-slate-900 rounded-lg transition-colors">
            <Save className="w-5 h-5" />
          </button>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:bg-slate-900 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{product.name}</h3>
              {product.featured && <Star className="w-4 h-4 text-orange-400 fill-orange-400" />}
            </div>
            <p className="text-orange-500 font-bold text-lg mt-1">{formatCOP(product.price)}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => onEdit(product)} className="p-3 text-slate-400 hover:text-orange-400 hover:bg-slate-900 rounded-lg transition-colors">
              <Edit2 className="w-5 h-5" />
            </button>
            <button onClick={() => onDelete(product.id)} className="p-3 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  const [formData, setFormData] = useState({ name: '', price: '', image_url: '', featured: false });
  const [editProduct, setEditProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', price: '', image_url: '', featured: false });
  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const handleChange = makeHandler(setFormData, setErrors);
  const handleEditChange = makeHandler(setEditFormData, setEditErrors);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/productos');
      const savedOrder = localStorage.getItem(STORAGE_KEY);
      if (savedOrder) {
        const order = JSON.parse(savedOrder);
        setProducts([...data].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)));
      } else {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const validate = (data) => {
    const newErrors = {};
    if (!data.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!data.price) newErrors.price = 'El precio es requerido';
    else if (isNaN(data.price) || parseFloat(data.price) <= 0) newErrors.price = 'Debe ser un número positivo';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validate(formData);
    if (Object.keys(formErrors).length > 0) { setErrors(formErrors); return; }

    try {
      const { data } = await api.post('/productos', {
        name: formData.name,
        price: parseFloat(formData.price),
        image_url: formData.image_url || null,
        featured: formData.featured
      });
      setProducts(prev => [...prev, data]);
      setFormData({ name: '', price: '', image_url: '', featured: false });
      sileo.success({ title: 'Producto creado', description: `${data.name} agregado correctamente` });
    } catch (error) {
      sileo.error({ title: 'Error', description: 'No se pudo crear el producto' });
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setEditFormData({ name: product.name, price: product.price, image_url: product.image_url || '', featured: product.featured || false });
    setEditErrors({});
  };

  const handleSaveEdit = async () => {
    const formErrors = validate(editFormData);
    if (Object.keys(formErrors).length > 0) { setEditErrors(formErrors); return; }

    try {
      const { data } = await api.put(`/productos/${editProduct.id}`, {
        name: editFormData.name,
        price: parseFloat(editFormData.price),
        image_url: editFormData.image_url || null,
        featured: editFormData.featured
      });
      setProducts(prev => prev.map(p => p.id === editProduct.id ? data : p));
      setEditProduct(null);
      sileo.success({ title: 'Producto actualizado', description: `${data.name} editado correctamente` });
    } catch (error) {
      sileo.error({ title: 'Error', description: 'No se pudo actualizar el producto' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/productos/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      sileo.error({ title: 'Producto eliminado', description: 'El producto fue eliminado' });
    } catch (error) {
      sileo.error({ title: 'Error', description: 'No se pudo eliminar el producto' });
    }
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setProducts(prev => {
      const reordered = arrayMove(prev, prev.findIndex(p => p.id === active.id), prev.findIndex(p => p.id === over.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reordered.map(p => p.id)));
      return reordered;
    });
  };

  const filtered = products
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => !onlyFeatured || p.featured);

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white mb-2 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver
        </Link>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-orange-600/20 border border-orange-600/50 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Productos</h1>
            <p className="text-slate-400">{products.length} productos</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-orange-500" />
          Nuevo Producto
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Collar de perlas"
              className={`w-full px-4 py-3 rounded-lg bg-slate-900 border ${errors.name ? 'border-red-500' : 'border-slate-600'} text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-colors`}
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Precio (COP)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="25000"
              min="1"
              className={`w-full px-4 py-3 rounded-lg bg-slate-900 border ${errors.price ? 'border-red-500' : 'border-slate-600'} text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-colors`}
            />
            {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-400" />
              URL de imagen <span className="text-slate-500 font-normal">(opcional)</span>
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="featured"
              id="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4 accent-orange-500 cursor-pointer"
            />
            <label htmlFor="featured" className="text-sm font-medium text-slate-300 cursor-pointer flex items-center gap-1">
              <Star className="w-4 h-4 text-orange-400" />
              Producto destacado
            </label>
          </div>
          <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors">
            Agregar Producto
          </button>
        </form>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-white">Lista</h2>
            <p className="text-xs text-slate-500 mt-0.5">Arrastra para reordenar</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOnlyFeatured(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                onlyFeatured
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-600'
              }`}
            >
              <Star className={`w-4 h-4 ${onlyFeatured ? 'fill-white' : ''}`} />
              Destacados
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none text-sm"
              />
            </div>
          </div>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">{search ? 'Sin resultados' : 'No hay productos'}</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filtered.map(p => p.id)} strategy={verticalListSortingStrategy}>
              <div>
                {filtered.map(product => (
                  <SortableProduct
                    key={product.id}
                    product={product}
                    isEditing={editProduct?.id === product.id}
                    editFormData={editFormData}
                    onEditChange={handleEditChange}
                    onSave={handleSaveEdit}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCancel={() => setEditProduct(null)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
