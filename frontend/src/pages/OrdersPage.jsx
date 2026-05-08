import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingCart, Trash2, ArrowLeft, DollarSign, Search, User } from 'lucide-react';
import { formatCOP } from '../utils/auth.js';
import api from '../services/api.js';
import { sileo } from 'sileo';

const OrdersPage = () => {
  // [Req 5 - useState] orders, products, customers, loading, search, formData, errors
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({ productId: '', quantity: '', customerId: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');

  // [Req 6 - useEffect] Carga productos, pedidos y clientes al montar el componente
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // [Req 7 - Peticiones] Promise.all: GET /productos, GET /pedidos, GET /clientes en paralelo
      const [prodRes, ordRes, clientRes] = await Promise.all([
        api.get('/productos'),
        api.get('/pedidos'),
        api.get('/clientes')
      ]);
      setProducts(prodRes.data);
      setOrders(ordRes.data);
      setCustomers(clientRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productId) newErrors.productId = 'Seleccione un producto';
    if (!formData.quantity) newErrors.quantity = 'La cantidad es requerida';
    else if (isNaN(formData.quantity) || parseInt(formData.quantity) <= 0) newErrors.quantity = 'Debe ser un número positivo';
    return newErrors;
  };

  // [Req 4 - Eventos] onSubmit del formulario de crear pedido
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) { setErrors(formErrors); return; }

    try {
      // [Req 7 - Peticiones] POST /pedidos — crea un nuevo pedido
      const { data } = await api.post('/pedidos', {
        id_producto: parseInt(formData.productId),
        quantity: parseInt(formData.quantity),
        id_cliente: formData.customerId ? parseInt(formData.customerId) : null,
        notes: formData.notes || null
      });
      setOrders(prev => [data, ...prev]);
      setFormData({ productId: '', quantity: '', customerId: '', notes: '' });
      sileo.success({ title: 'Pedido creado', description: `${data.product_name} x${data.quantity} registrado` });
    } catch (error) {
      sileo.error({ title: 'Error', description: 'No se pudo crear el pedido' });
    }
  };

  const handleDelete = async (id) => {
    try {
      // [Req 7 - Peticiones] DELETE /pedidos/:id — elimina un pedido
      await api.delete(`/pedidos/${id}`);
      setOrders(prev => prev.filter(o => o.id !== id));
      sileo.error({ title: 'Pedido eliminado', description: 'El pedido fue eliminado' });
    } catch (error) {
      sileo.error({ title: 'Error', description: 'No se pudo eliminar el pedido' });
    }
  };

  const getCustomerName = (order) => order.clientes?.name || null;

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);

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

      {/* [Req 2 - Formularios] Formulario crear pedido: select producto, cantidad, select cliente, textarea notas */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-orange-500" />
          Nuevo Pedido
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Producto</label>
            <select
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg bg-slate-900 border ${errors.productId ? 'border-red-500' : 'border-slate-600'} text-white focus:border-orange-500 focus:outline-none transition-colors`}
            >
              <option value="">Seleccionar producto</option>
              {/* [Req 8 - key] key={product.id} en el select de productos al crear pedido */}
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {formatCOP(product.price)}
                </option>
              ))}
            </select>
            {errors.productId && <p className="text-red-400 text-sm mt-1">{errors.productId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Cantidad</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="1"
              min="1"
              className={`w-full px-4 py-3 rounded-lg bg-slate-900 border ${errors.quantity ? 'border-red-500' : 'border-slate-600'} text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-colors`}
            />
            {errors.quantity && <p className="text-red-400 text-sm mt-1">{errors.quantity}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Cliente <span className="text-slate-500 font-normal">(opcional)</span>
            </label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-orange-500 focus:outline-none transition-colors"
            >
              <option value="">Sin cliente asignado</option>
              {/* [Req 8 - key] key={customer.id} en el select de clientes al crear pedido */}
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} — {customer.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Notas <span className="text-slate-500 font-normal">(opcional)</span></label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Instrucciones especiales, personalización, etc."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-colors resize-none"
            />
          </div>
          <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors">
            Crear Pedido
          </button>
        </form>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Lista</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar pedido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none text-sm"
            />
          </div>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Cargando...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">No hay pedidos</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {/* [Req 10 - Filtros] Búsqueda de pedidos por nombre de producto — filtrado en cliente */}
            {/* [Req 8 - key] key={order.id} en lista de pedidos */}
            {orders.filter(o => o.product_name.toLowerCase().includes(search.toLowerCase())).map(order => {
              const customerName = getCustomerName(order);
              return (
                <div key={order.id} className="p-6 hover:bg-slate-700/50 transition-colors flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{order.product_name}</h3>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      <p className="text-sm text-slate-400">Cantidad: {order.quantity}</p>
                      {customerName && (
                        <p className="text-sm text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {customerName}
                        </p>
                      )}
                    </div>
                    {order.notes && <p className="text-xs text-slate-500 mt-1 italic">"{order.notes}"</p>}
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="text-2xl font-bold text-orange-500">{formatCOP(order.total)}</p>
                    <button onClick={() => handleDelete(order.id)} className="p-3 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
