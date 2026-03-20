import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Trash2, ArrowLeft, User, Mail, Phone } from 'lucide-react';
import { sileo } from 'sileo';

class Customer {
  constructor(id, name, phone, email) {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.email = email;
  }
}

const CustomersPage = () => {
  const [customers, setCustomers] = useState([
    new Customer(1, 'María González', '300-123-4567', 'maria@email.com'),
    new Customer(2, 'Carlos López', '300-567-8901', 'carlos@email.com'),
    new Customer(3, 'Ana Martínez', '300-901-2345', 'ana@email.com')
  ]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
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
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email no válido';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      const newCustomer = new Customer(
        Date.now(),
        formData.name,
        formData.phone,
        formData.email
      );
      setCustomers(prev => [...prev, newCustomer]);
      setFormData({ name: '', phone: '', email: '' });
      sileo.success({ title: 'Cliente agregado', description: 'El cliente se ha registrado correctamente' });
    } else {
      setErrors(formErrors);
    }
  };

  const handleDelete = (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    sileo.error({ title: 'Cliente eliminado', description: 'El cliente ha sido eliminado' });
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white mb-2 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver
        </Link>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-orange-600/20 border border-orange-600/50 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Clientes</h1>
            <p className="text-slate-400">{customers.length} clientes</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-orange-500" />
          Nuevo Cliente
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              Nombre
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nombre completo"
                className={`w-full pl-12 pr-4 py-3 rounded-lg bg-slate-900 border ${errors.name ? 'border-red-500' : 'border-slate-600'} text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-colors`}
              />
            </div>
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
              Teléfono
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="300-123-4567"
                className={`w-full pl-12 pr-4 py-3 rounded-lg bg-slate-900 border ${errors.phone ? 'border-red-500' : 'border-slate-600'} text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-colors`}
              />
            </div>
            {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@ejemplo.com"
                className={`w-full pl-12 pr-4 py-3 rounded-lg bg-slate-900 border ${errors.email ? 'border-red-500' : 'border-slate-600'} text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-colors`}
              />
            </div>
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>
          
          <button 
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Agregar
          </button>
        </form>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Lista</h2>
        </div>
        
        {customers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">No hay clientes</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {customers.map(customer => (
              <div key={customer.id} className="p-6 hover:bg-slate-700/50 transition-colors flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-orange-600/20 border border-orange-600/50 rounded-lg flex items-center justify-center">
                    <span className="text-orange-500 font-semibold text-lg">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{customer.name}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
                      <span className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {customer.phone}
                      </span>
                      <span className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {customer.email}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(customer.id)}
                  className="p-3 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;