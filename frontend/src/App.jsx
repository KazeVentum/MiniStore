import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Productos from './components/Productos';
import Pedidos from './components/Pedidos';
import NuevoPedido from './components/NuevoPedido';
import Clientes from './components/Clientes';
import ResumenVentas from './components/ResumenVentas';
import {
    LayoutDashboard,
    Package,
    ShoppingCart, // Changed from ShoppingBag to ShoppingCart
    Users,
    Menu,
    X, // Added X
    BarChart3 // Added BarChart3
} from 'lucide-react';
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
                className={cn(
                    "relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-500 group overflow-hidden",
                    isActive
                        ? "bg-rosa-secundario text-white shadow-lg shadow-rosa-secundario/40 glow-rosa"
                        : "text-slate-500 dark:text-gray-400 hover:text-rosa-oscuro dark:hover:text-rosa-primario hover:bg-white/50 dark:hover:bg-white/5"
                )}
            >
                {/* Active Indicator Bar */}
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-[0_0_10px_white]" />
                )}

                <Icon className={cn(
                    "h-5 w-5 transition-transform duration-500",
                    isActive ? "text-white rotate-0" : "text-gray-400 group-hover:scale-110 group-hover:rotate-12"
                )}
                />
                <span className={cn(
                    "font-bold tracking-tight transition-all duration-300",
                    isActive ? "translate-x-1" : "group-hover:translate-x-1"
                )}>
                    {children}
                </span>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-gris-texto dark:text-gray-100 font-sans transition-colors duration-500">
            <div className="flex h-screen overflow-hidden">

                {/* Sidebar */}
                <aside className="w-72 hidden md:flex flex-col m-5 rounded-[2rem] glass glass-dark border-white/50 dark:border-white/5 premium-shadow relative overflow-hidden z-10">
                    {/* Background Glows */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-rosa-primario/20 blur-[80px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

                    <div className="p-8 flex items-center justify-center">
                        <div className="relative group text-center">
                            <div className="absolute -inset-1 bg-gradient-to-r from-rosa-secundario to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <h1 className="relative text-3xl font-black tracking-tighter text-gradient py-1">
                                MiniStore ✨
                            </h1>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-1.5 px-4 py-6">
                        <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>
                        <NavLink to="/pedidos" icon={ShoppingCart}>Pedidos</NavLink>
                        <NavLink to="/resumen" icon={BarChart3}>Resumen</NavLink>
                        <NavLink to="/clientes" icon={Users}>Clientes</NavLink>
                        <NavLink to="/productos" icon={Package}>Productos</NavLink>
                    </nav>

                    <div className="p-6 mt-auto">
                        <div className="bg-white/40 dark:bg-white/5 p-4 rounded-2xl border border-white/40 dark:border-white/5 flex items-center justify-between shadow-sm">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Versión- updated 28/01/26</span>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">1.9.1</span>
                            </div>
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
                            <Route path="/pedidos/editar/:id" element={<NuevoPedido />} />
                            <Route path="/resumen" element={<ResumenVentas />} />
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
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
