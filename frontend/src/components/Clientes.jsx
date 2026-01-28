import React, { useEffect, useState } from 'react';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import Modal from './ui/modal';
import { Plus, Trash2, Edit, Phone, MapPin, User, Search, UserPlus } from 'lucide-react';
import { cn } from '../lib/utils';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        nombre_cliente: '',
        telefono: '',
        direccion: '',
        notas: ''
    });

    const fetchClientes = async () => {
        try {
            const data = await getClientes();
            setClientes(data);
        } catch (error) {
            console.error("Error fetching clients", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
            await deleteCliente(id);
            fetchClientes();
        }
    };

    const handleEdit = (cliente) => {
        setEditingId(cliente.id_cliente);
        setFormData({
            nombre_cliente: cliente.nombre_cliente,
            telefono: cliente.telefono || '',
            direccion: cliente.direccion || '',
            notas: cliente.notas || ''
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingId(null);
        setFormData({
            nombre_cliente: '',
            telefono: '',
            direccion: '',
            notas: ''
        });
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateCliente(editingId, formData);
            } else {
                await createCliente(formData);
            }
            setIsModalOpen(false);
            fetchClientes();
        } catch (error) {
            alert('Error al guardar cliente');
        }
    };

    const filteredClientes = clientes.filter(c =>
        c.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.telefono && c.telefono.includes(searchTerm))
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-rosa-primario/30 border-t-rosa-oscuro rounded-full animate-spin" />
            <p className="text-rosa-oscuro font-bold animate-pulse">Cargando comunidad... 💖</p>
        </div>
    );

    return (
        <div className="space-y-10 pb-12 animate-in fade-in duration-700">
            {/* Header section with Stats & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
                        Mis <span className="text-gradient">Clientes</span> 👥
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 font-medium">Gestiona tu base de datos de compradores fieles</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-64 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-rosa-oscuro transition-colors" />
                        <Input
                            placeholder="Buscar cliente..."
                            className="pl-11 h-12 bg-white/50 dark:bg-white/5 border-white/20 rounded-2xl font-bold transition-all focus:ring-2 focus:ring-rosa-primario/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        className="w-full sm:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-12 px-8 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        onClick={handleCreate}
                    >
                        <UserPlus className="h-5 w-5" /> NUEVO CLIENTE
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            {filteredClientes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredClientes.map((cliente) => (
                        <Card key={cliente.id_cliente} className="glass glass-dark border-none premium-shadow relative group overflow-hidden transition-all duration-500 hover:-translate-y-2">
                            {/* Decorative elements */}
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-rosa-primario/20 to-purple-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

                            <CardHeader className="pb-4 relative">
                                <div className="flex items-center gap-5">
                                    <div className="relative group-hover:rotate-6 transition-transform duration-300">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rosa-primario to-rosa-oscuro flex items-center justify-center text-white font-black text-2xl shadow-lg border border-white/30">
                                            {cliente.nombre_cliente.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-sm">
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white truncate tracking-tight">{cliente.nombre_cliente}</h3>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-rosa-oscuro dark:text-rosa-primario opacity-70">Cliente Verificado</span>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6 relative pt-2">
                                <div className="space-y-3 bg-white/30 dark:bg-white/5 p-4 rounded-2xl border border-white/20">
                                    <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-gray-300">
                                        <div className="p-1.5 rounded-lg bg-rosa-primario/10 text-rosa-oscuro dark:text-rosa-primario">
                                            <Phone className="h-3.5 w-3.5" />
                                        </div>
                                        <span>{cliente.telefono || 'Sin teléfono registrado'}</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm font-bold text-slate-600 dark:text-gray-300">
                                        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                            <MapPin className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="line-clamp-2 leading-tight">{cliente.direccion || 'Sin dirección registrada'}</span>
                                    </div>
                                </div>

                                {cliente.notas && (
                                    <div className="px-1">
                                        <p className="text-xs text-slate-500 dark:text-gray-400 font-medium italic line-clamp-2 leading-relaxed">
                                            "{cliente.notas}"
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => handleEdit(cliente)}
                                        className="flex-1 h-11 bg-white dark:bg-white/10 hover:bg-rosa-primario/20 dark:hover:bg-rosa-primario/20 text-slate-700 dark:text-white font-black text-xs uppercase tracking-widest rounded-xl border border-slate-100 dark:border-white/5 transition-all flex items-center justify-center gap-2 group/btn"
                                    >
                                        <Edit className="h-4 w-4 group-hover/btn:scale-110 transition-transform" /> EDITAR
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cliente.id_cliente)}
                                        className="w-11 h-11 bg-rose-500/5 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all flex items-center justify-center border border-rose-500/10 group/del"
                                    >
                                        <Trash2 className="h-4 w-4 group-hover/del:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 glass glass-dark rounded-3xl border-2 border-dashed border-white/20">
                    <div className="p-6 rounded-full bg-rosa-primario/10 text-rosa-oscuro dark:text-rosa-primario animate-bounce">
                        <UserPlus className="h-10 w-10" />
                    </div>
                    <div className="space-y-1 max-w-sm px-6">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">¿Aún no tienes clientes?</h3>
                        <p className="text-sm text-slate-500 font-medium">Registra tu primer cliente para empezar a registrar pedidos y hacer crecer tu negocio.</p>
                    </div>
                    <Button
                        className="mt-4 bg-rosa-oscuro hover:bg-rosa-primario text-white px-8 h-12 rounded-2xl font-black shadow-lg shadow-rosa-oscuro/20"
                        onClick={handleCreate}
                    >
                        EMPEZAR AHORA ✨
                    </Button>
                </div>
            )}

            {/* Elegant Creation/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Actualizar Perfil de Cliente" : "Nuevo Cliente para MiniStore ✨"}>
                <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                    <div className="space-y-4 bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-white/20">
                        <div className="space-y-2">
                            <Label htmlFor="nombre_cliente" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Nombre Completo</Label>
                            <Input
                                id="nombre_cliente"
                                name="nombre_cliente"
                                value={formData.nombre_cliente}
                                onChange={handleInputChange}
                                required
                                className="h-12 bg-white dark:bg-slate-900/50 border-white/20 rounded-xl font-bold"
                                placeholder="Ej: Diana Prince"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="telefono" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">WhatsApp / Teléfono</Label>
                                <Input
                                    id="telefono"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleInputChange}
                                    placeholder="300 123 4567"
                                    className="h-12 bg-white dark:bg-slate-900/50 border-white/20 rounded-xl font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="direccion" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Dirección de Envío</Label>
                                <Input
                                    id="direccion"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleInputChange}
                                    placeholder="Calle 123 #45-67"
                                    className="h-12 bg-white dark:bg-slate-900/50 border-white/20 rounded-xl font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notas" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Notas de Preferencia</Label>
                            <textarea
                                id="notas"
                                name="notas"
                                value={formData.notas}
                                onChange={handleInputChange}
                                className="w-full min-h-[100px] p-4 bg-white dark:bg-slate-900/50 border border-white/10 rounded-xl font-medium text-sm focus:ring-2 focus:ring-rosa-primario/50 focus:border-rosa-primario outline-none transition-all placeholder:text-slate-400 resize-none"
                                placeholder="Ej: Prefiere empaques dorados, le gusta la bisutería minimalista..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 h-14 rounded-2xl font-black text-slate-500 uppercase tracking-widest"
                        >
                            CANCELAR
                        </Button>
                        <Button
                            type="submit"
                            className="flex-[2] h-14 bg-rosa-secundario hover:bg-rosa-oscuro text-white font-black rounded-2xl shadow-xl shadow-rosa-secundario/20 transition-all active:scale-95 uppercase tracking-widest"
                        >
                            {editingId ? 'GUARDAR CAMBIOS' : 'REGISTRAR CLIENTE ✨'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Clientes;
