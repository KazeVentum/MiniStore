import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingCart, Trash2, ArrowLeft, DollarSign } from 'lucide-react';
import { formatCOP } from '../utils/auth.js';
import { sileo } from 'sileo';

class Order {
  constructor(id, productName, quantity, total) {
    this.id = id;
    this.productName = productName;
    this.quantity = quantity;
    this.total = total;
  }
}

const OrdersPage = () => {
  const [products] = useState([
    { id: 1, name: 'Collar de perlas', price: 25000 },
    { id: 2, name: 'Pulsera de plata', price: 15000 },
    { id: 3, name: 'Aretes de oro', price: 35000 },
    { id: 4, name: 'Anillo de plata', price: 18000 }
  ]);

  const [orders, setOrders] = useState([
    new Order(1, 'Collar de perlas', 2, 50000),
    new Order(2, 'Pulsera de plata', 1, 15000)
  ]);

  const [formData, setFormData] = useState({
    productId: '',
    quantity: ''
  });

  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productId) {
      newErrors.productId = 'Seleccione un producto';
    }
    if (!formData.quantity) {
      newErrors.quantity = 'La cantidad es requerida';
    } else if (isNaN(formData.quantity) || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'Debe ser un número positivo';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      const selectedProduct = products.find(p => p.id === parseInt(formData.productId));
      if (selectedProduct) {
        const total = selectedProduct.price * parseInt(formData.quantity);
        const newOrder = new Order(
          Date.now(),
          selectedProduct.name,
          parseInt(formData.quantity),
          total
        );
        setOrders(prev => [...prev, newOrder]);
        setFormData({ productId: '', quantity: '' });
        sileo.success({ title: 'Pedido creado', description: 'El pedido se ha creado exitosamente' });
      }
    } else {
      setErrors(formErrors);
    }
  };

  const handleDelete = (id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    sileo.error({ title: 'Pedido eliminado', description: 'El pedido ha sido eliminado' });
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

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
              <ShoppingCart className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Pedidos</h1>
              <p className="text-slate-400">{orders.length} pedidos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-600/20 border border-orange-600/50 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-slate-300">Total</span>
          </div>
          <p className="text-3xl font-bold text-orange-500">{formatCOP(totalRevenue)}</p>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-orange-500" />
          Nuevo Pedido
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="productId" className="block text-sm font-medium text-slate-300 mb-2">
              Producto
            </label>
            <select
              id="productId"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg bg-slate-900 border ${errors.productId ? 'border-red-500' : 'border-slate-600'} text-white focus:border-orange-500 focus:outline-none transition-colors`}
            >
              <option value="">Seleccionar producto</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {formatCOP(product.price)}
                </option>
              ))}
            </select>
            {errors.productId && <p className="text-red-400 text-sm mt-1">{errors.productId}</p>}
          </div>
          
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-slate-300 mb-2">
              Cantidad
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="1"
              min="1"
              className={`w-full px-4 py-3 rounded-lg bg-slate-900 border ${errors.quantity ? 'border-red-500' : 'border-slate-600'} text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-colors`}
            />
            {errors.quantity && <p className="text-red-400 text-sm mt-1">{errors.quantity}</p>}
          </div>
          
          <button 
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Crear Pedido
          </button>
        </form>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Lista</h2>
        </div>
        
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">No hay pedidos</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {orders.map(order => (
              <div key={order.id} className="p-6 hover:bg-slate-700/50 transition-colors flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{order.productName}</h3>
                  <p className="text-sm text-slate-400 mt-1">Cantidad: {order.quantity}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="text-2xl font-bold text-orange-500">{formatCOP(order.total)}</p>
                  <button 
                    onClick={() => handleDelete(order.id)}
                    className="p-3 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;