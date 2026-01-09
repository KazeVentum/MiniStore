import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Productos from './components/Productos';
import Pedidos from './components/Pedidos';
import NuevoPedido from './components/NuevoPedido';
import Clientes from './components/Clientes';
import { LayoutDashboard, Package, ShoppingBag, Users, Menu } from 'lucide-react';
import ThemeToggle from './components/ui/theme-toggle';
import { cn } from './lib/utils';

// Componente interno para manejar la lógica de navegación que requiere useLocation
const AppContent = () => {
    const location = useLocation();

    const NavLink = ({ to, icon: Icon, children }) => {
        const location = useLocation();
        const isActive = location.pathname === to;

        return (
            <Link
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                    ? 'bg-rosa-secundario text-white shadow-md shadow-rosa-secundario/30 scale-[1.02]'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-rosa-primario/40 dark:hover:bg-white/5'
                    }`}
            >
                <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-500")} />
                <span className="font-medium">{children}</span>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-gris-texto dark:text-gray-100 font-sans transition-colors duration-500">
            <div className="flex h-screen overflow-hidden">

                {/* Sidebar */}
                <aside className="w-64 hidden md:flex flex-col glass-card glass-card-dark m-4 rounded-2xl z-10">
                    <div className="p-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rosa-secundario to-purple-600 dark:from-rosa-primario dark:to-purple-400">
                            MiniStore ✨
                        </h1>
                    </div>

                    <nav className="flex-1 space-y-2 px-3 py-4">
                        <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>
                        <NavLink to="/pedidos" icon={ShoppingBag}>Pedidos</NavLink>
                        <NavLink to="/clientes" icon={Users}>Clientes</NavLink>
                        <NavLink to="/productos" icon={Package}>Productos</NavLink>
                    </nav>

                    <div className="p-4 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">v1.0.0</span>
                            <ThemeToggle />
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    {/* Mobile Header */}
                    <div className="md:hidden flex justify-between items-center mb-6 glass p-4 rounded-xl">
                        <h1 className="text-xl font-bold text-rosa-oscuro dark:text-rosa-primario">MiniStore ✨</h1>
                        <div className="flex gap-2">
                            <ThemeToggle />
                            <button className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                    </div>

                    <div className="max-w-full mx-auto animate-fade-in">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/productos" element={<Productos />} />
                            <Route path="/pedidos" element={<Pedidos />} />
                            <Route path="/pedidos/nuevo" element={<NuevoPedido />} />
                            <Route path="/clientes" element={<Clientes />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
    );
};

function App() {
    return (
        <Router basename="/ministore">
            <AppContent />
        </Router>
    );
}

export default App;
