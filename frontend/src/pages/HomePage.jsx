import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, ArrowRight } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-6 py-12">
        <h1 className="text-5xl font-bold text-white">MiniStore</h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Gestión de productos, pedidos y clientes
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <FeatureCard 
          icon={<Package className="w-8 h-8" />}
          title="Productos"
          description="Administra el catálogo de productos de la tienda"
          link="/products"
        />
        <FeatureCard 
          icon={<ShoppingCart className="w-8 h-8" />}
          title="Pedidos"
          description="Gestiona los pedidos de los clientes"
          link="/orders"
        />
        <FeatureCard 
          icon={<Users className="w-8 h-8" />}
          title="Clientes"
          description="Registro y administración de clientes"
          link="/customers"
        />
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-2">¿Listo para comenzar?</h3>
        <p className="text-slate-400 mb-6">Explora las diferentes secciones del sistema</p>
        <Link 
          to="/products" 
          className="inline-flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <span>Comenzar</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, link }) => (
  <a 
    href={link}
    className="group bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-orange-600 transition-all"
  >
    <div className="w-16 h-16 bg-orange-600/20 border border-orange-600/50 rounded-lg flex items-center justify-center mb-4 text-orange-500">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 mb-4">{description}</p>
    <div className="flex items-center text-orange-500 group-hover:text-orange-400 group-hover:translate-x-2 transition-all text-sm font-medium">
      Ir a {title} <ArrowRight className="w-4 h-4 ml-1" />
    </div>
  </a>
);

export default HomePage;