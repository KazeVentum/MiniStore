import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Trash2, ArrowLeft, Edit2, X, Save } from 'lucide-react';
import { formatCOP } from '../utils/auth.js';
import { sileo } from 'sileo';

class Product {
  constructor(id, name, price) {
    this.id = id;
    this.name = name;
    this.price = price;
  }
}

const ProductsPage = () => {
  const [products, setProducts] = useState([
    new Product(1, 'Collar de perlas', 25000),
    new Product(2, 'Pulsera de plata', 15000),
    new Product(3, 'Aretes de oro', 35000),
    new Product(4, 'Anillo de plata', 18000)
  ]);

  const [formData, setFormData] = useState({
    name: '',
    price: ''
  });

  const [editProduct, setEditProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    price: ''
  });

  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!data.price.trim()) {
      newErrors.price = 'El precio es requerido';
    } else if (isNaN(data.price) || parseFloat(data.price) <= 0) {
      newErrors.price = 'El precio debe ser un número positivo';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length === 0) {
      const newProduct = new Product(
        Date.now(),
        formData.name,
        parseFloat(formData.price)
      );
      setProducts(prev => [...prev, newProduct]);
      setFormData({ name: '', price: '' });
      sileo.success({ title: 'Producto agregado', description: 'El producto se ha agregado correctamente' });
    } else {
      setErrors(formErrors);
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setEditFormData({
      name: product.name,
      price: product.price.toString()
    });
    setEditErrors({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (editErrors[name]) {
      setEditErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const formErrors = validateForm(editFormData);
    if (Object.keys(formErrors).length === 0) {
      setProducts(prev => prev.map(p => 
        p.id === editProduct.id 
          ? new Product(p.id, editFormData.name, parseFloat(editFormData.price))
          : p
      ));
      sileo.info({ title: 'Producto actualizado', description: 'Los cambios se han guardado correctamente' });
      setEditProduct(null);
      setEditFormData({ name: '', price: '' });
    } else {
      setEditErrors(formErrors);
    }
  };

  const handleCancelEdit = () => {
    setEditProduct(null);
    setEditFormData({ name: '', price: '' });
    setEditErrors({});
  };

  const handleDelete = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    sileo.error({ title: 'Producto eliminado', description: 'El producto ha sido eliminado' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-orange-500" />
            Nuevo Producto
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nombre del producto"
                className={`w-full px-4 py-3 rounded-lg bg-slate-900 border ${errors.name ? 'border-red-500' : 'border-slate-600'} text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-colors`}
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-300 mb-2">
                Precio (COP)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                className={`w-full px-4 py-3 rounded-lg bg-slate-900 border ${errors.price ? 'border-red-500' : 'border-slate-600'} text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-colors`}
              />
              {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
            </div>
            
            <button 
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Agregar
            </button>
          </form>
        </div>

        {editProduct && (
          <div className="bg-orange-600/20 border border-orange-600/50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Edit2 className="w-5 h-5 mr-2 text-orange-500" />
              Editar Producto
            </h2>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label htmlFor="editName" className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  id="editName"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-900 border ${editErrors.name ? 'border-red-500' : 'border-slate-600'} text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-colors`}
                />
                {editErrors.name && <p className="text-red-400 text-sm mt-1">{editErrors.name}</p>}
              </div>
              
              <div>
                <label htmlFor="editPrice" className="block text-sm font-medium text-slate-300 mb-2">
                  Precio (COP)
                </label>
                <input
                  type="number"
                  id="editPrice"
                  name="price"
                  value={editFormData.price}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-900 border ${editErrors.price ? 'border-red-500' : 'border-slate-600'} text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-colors`}
                />
                {editErrors.price && <p className="text-red-400 text-sm mt-1">{editErrors.price}</p>}
              </div>
              
              <div className="flex space-x-2">
                <button 
                  type="submit"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar</span>
                </button>
                <button 
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Lista</h2>
        </div>
        
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">No hay productos</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {products.map(product => (
              <div key={product.id} className="p-6 hover:bg-slate-700/50 transition-colors">
                {editProduct?.id === product.id ? (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditChange}
                        className="text-xl font-semibold bg-transparent border-b border-orange-500 text-white focus:outline-none w-full"
                      />
                      <input
                        type="number"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditChange}
                        className="text-2xl font-bold text-orange-500 bg-transparent border-b border-orange-500 mt-1 focus:outline-none w-40"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={handleSaveEdit}
                        className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        className="p-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{product.name}</h3>
                      <p className="text-2xl font-bold text-orange-500 mt-1">{formatCOP(product.price)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-3 text-slate-400 hover:text-orange-500 hover:bg-slate-900 rounded-lg transition-colors"
                        title="Editar producto"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-3 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;