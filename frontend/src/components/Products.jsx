import React, { useEffect, useState } from 'react';
import { getProductos, createProducto, updateProducto, deleteProducto, getCategorias } from '../services/api';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import Modal from './ui/modal';
import { Plus, Trash2, Edit, Package, Search, Tag } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Products
//
// React concepts demonstrated:
//
// 1. Multiple useState calls — each piece of state is declared separately
//    so updates are independent and re-renders are scoped.
//
// 2. Object state for forms — `formData` is a single object. Updates use the
//    spread pattern: setFormData(prev => ({ ...prev, [name]: value }))
//    This keeps all form fields in sync without needing separate variables.
//
// 3. Controlled inputs — every <Input> has a `value` and `onChange` prop.
//    React owns the value; the DOM never holds state on its own.
//
// 4. Derived filtering — filteredProducts is computed on every render from
//    current state. No need to store the filtered list in state.
//
// 5. Conditional rendering — loading spinner, empty state, and the modal
//    are all shown/hidden via boolean state flags.
// ─────────────────────────────────────────────────────────────────────────────
const Products = () => {
  // -- Data state --
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  // -- UI state --
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [editingId, setEditingId]           = useState(null); // null = create mode
  const [searchTerm, setSearchTerm]         = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // -- Form state (single object for all form fields) --
  const [formData, setFormData] = useState({
    nombre_producto: '',
    descripcion:     '',
    precio:          '',
    tamano:          'unico',
    imagen_url:      '',
    id_categoria:    '',
  });

  // ── Data fetching ──────────────────────────────────────────────────────────

  // fetchProducts is defined outside useEffect so it can be called again
  // after create/update/delete operations to refresh the list.
  const fetchProducts = async () => {
    try {
      const [prodData, catData] = await Promise.all([getProductos(), getCategorias()]);
      setProducts(prodData);
      setCategories(catData);
    } catch (error) {
      console.error('Products: error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  // Run once on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await deleteProducto(id);
    fetchProducts(); // re-fetch to update the list
  };

  const handleEdit = (product) => {
    setEditingId(product.id_producto);
    setFormData({
      nombre_producto: product.nombre_producto,
      descripcion:     product.descripcion || '',
      precio:          product.precio,
      tamano:          product.tamano || 'unico',
      imagen_url:      product.imagen_url || '',
      id_categoria:    product.id_categoria,
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null); // null signals create mode
    setFormData({
      nombre_producto: '',
      descripcion:     '',
      precio:          '',
      tamano:          'unico',
      imagen_url:      '',
      id_categoria:    '',
    });
    setIsModalOpen(true);
  };

  // Generic input handler — works for all form fields.
  // Uses computed property name [name] to update only the changed field.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Form submission — calls create or update based on editingId
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent default browser form submission / page reload
    try {
      if (editingId) {
        await updateProducto(editingId, formData);
      } else {
        await createProducto(formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      alert('Error saving product');
    }
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  // Computed on every render — no useState needed for the filtered list.
  const filteredProducts = products.filter((p) => {
    const matchesSearch   = p.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.id_categoria === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 spinner animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">

      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white tracking-tight">
            Product Catalog
          </h1>
          <p className="text-sm text-text-muted mt-1">Manage your jewelry inventory</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Controlled search input */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search product..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleCreate} className="w-full sm:w-auto gap-2">
            <Plus className="h-4 w-4" /> New Product
          </Button>
        </div>
      </div>

      {/* ── Category filter chips ── */}
      {/*
        React concept: .map() over an array to render a list of elements.
        Each element needs a unique `key` prop so React can efficiently
        update only the changed items in the DOM.
      */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={cn(
            'px-4 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap',
            selectedCategory === 'all'
              ? 'bg-brand-default text-white border-brand-default'
              : 'bg-transparent text-text-secondary border-surface-border hover:border-brand-soft dark:border-dark-border'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id_categoria}
            onClick={() => setSelectedCategory(cat.id_categoria.toString())}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap',
              selectedCategory === cat.id_categoria.toString()
                ? 'bg-brand-default text-white border-brand-default'
                : 'bg-transparent text-text-secondary border-surface-border hover:border-brand-soft dark:border-dark-border'
            )}
          >
            {cat.nombre_categoria}
          </button>
        ))}
      </div>

      {/* ── Product grid ── */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => (
            <Card key={prod.id_producto} className="group overflow-hidden card-hover">
              {/* Product image */}
              <div className="relative h-56 bg-surface-muted dark:bg-dark-border flex items-center justify-center overflow-hidden">
                {prod.imagen_url ? (
                  <img
                    src={prod.imagen_url}
                    alt={prod.nombre_producto}
                    className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Package className="h-10 w-10 text-text-muted opacity-30" />
                )}

                {/* Category badge */}
                <div className="absolute top-3 left-3">
                  <span className="flex items-center gap-1 px-2 py-1 bg-white/90 dark:bg-dark-surface/90 rounded-lg text-[10px] font-semibold text-text-secondary border border-surface-border dark:border-dark-border">
                    <Tag className="h-2.5 w-2.5" /> {prod.nombre_categoria}
                  </span>
                </div>

                {/* Hover action overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleEdit(prod)}
                    className="p-2.5 bg-white rounded-full shadow-md hover:scale-110 active:scale-95 transition-all"
                  >
                    <Edit className="h-4 w-4 text-text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(prod.id_producto)}
                    className="p-2.5 bg-danger rounded-full shadow-md hover:scale-110 active:scale-95 transition-all"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-text-primary dark:text-white truncate">
                  {prod.nombre_producto}
                </h3>
                <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                  {prod.descripcion || 'No description'}
                </p>
                <p className="text-lg font-bold text-brand-default dark:text-dark-accent mt-3">
                  {formatCurrency(prod.precio)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="py-20 flex flex-col items-center text-center space-y-4 border-2 border-dashed border-surface-border dark:border-dark-border rounded-2xl">
          <div className="p-4 rounded-full bg-brand-light dark:bg-brand-default/10 text-brand-default">
            <Package className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary dark:text-white">No products found</h3>
            <p className="text-sm text-text-muted mt-1">Add your first product to get started.</p>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      )}

      {/* ── Create / Edit modal ── */}
      {/*
        React concept: the Modal is always in the component tree but
        conditionally visible via the `isOpen` prop. Inside Modal,
        it uses React.createPortal to render outside the current DOM tree
        (directly in document.body), which avoids z-index and overflow issues.
      */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Product' : 'New Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="nombre_producto">Product Name</Label>
            <Input
              id="nombre_producto"
              name="nombre_producto"
              value={formData.nombre_producto}
              onChange={handleInputChange}
              required
              placeholder="e.g. Rose Quartz Necklace"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Description</Label>
            <Input
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Short description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Price (COP)</Label>
              <Input
                id="precio"
                name="precio"
                type="number"
                step="1"
                value={formData.precio ? Math.round(parseFloat(formData.precio)) : ''}
                onChange={handleInputChange}
                required
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tamano">Size</Label>
              <Select id="tamano" name="tamano" value={formData.tamano} onChange={handleInputChange}>
                <option value="unico">One size</option>
                <option value="pequeño">Small (S)</option>
                <option value="mediano">Medium (M)</option>
                <option value="grande">Large (L)</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="id_categoria">Category</Label>
            <Select
              id="id_categoria"
              name="id_categoria"
              value={formData.id_categoria}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre_categoria}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imagen_url">Image URL</Label>
            <Input
              id="imagen_url"
              name="imagen_url"
              value={formData.imagen_url}
              onChange={handleInputChange}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-[2]">
              {editingId ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;
