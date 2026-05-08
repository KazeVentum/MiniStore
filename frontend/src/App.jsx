import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { sileo, Toaster } from 'sileo';
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import { Package, ShoppingCart, Users, Home, LogOut, User } from 'lucide-react';
import { isAuthenticated, logout } from './utils/auth.js';

export { sileo };

function App() {
  const [user, setUser] = useState(isAuthenticated());

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  if (!user) {
    return (
      <>
        <Toaster position="bottom-center" theme="dark" />
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
      <Toaster position="bottom-center" theme="dark" />
      <Router>
        <div className="min-h-screen bg-slate-900">
          <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                  <span className="text-xl font-bold text-white">Ariel's Jewelry Store</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <a href="/" className="nav-link">
                    <Home className="w-4 h-4" />
                    Home
                  </a>
                  <a href="/products" className="nav-link">
                    <Package className="w-4 h-4" />
                    Products
                  </a>
                  <a href="/orders" className="nav-link">
                    <ShoppingCart className="w-4 h-4" />
                    Orders
                  </a>
                  <a href="/customers" className="nav-link">
                    <Users className="w-4 h-4" />
                    Customers
                  </a>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{user.username}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </nav>
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </>
  );
}

export default App;