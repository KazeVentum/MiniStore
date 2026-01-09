import React, { useEffect, useState } from 'react';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import Modal from './ui/modal';
import { Plus, Trash2, Edit, Phone, MapPin, User } from 'lucide-react';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
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

    if (loading) return <div className="p-8 text-rosa-oscuro">Cargando clientes... 💖</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-rosa-oscuro dark:text-white">Mis Clientes 👥</h1>
                <Button
                    className="bg-rosa-oscuro hover:bg-rosa-primario text-white px-6 py-6 text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                    onClick={handleCreate}
                >
                    <Plus className="mr-2 h-6 w-6" /> Nuevo Cliente
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clientes.map((cliente) => (
                    <Card key={cliente.id_cliente} className="hover:shadow-lg transition-all border-none bg-white/70 dark:bg-dark-surface/50 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rosa-primario/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-14 h-14 rounded-2xl bg-rosa-primario flex items-center justify-center text-rosa-oscuro font-bold text-xl shadow-sm border border-white/50">
                                    {cliente.nombre_cliente.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{cliente.nombre_cliente}</h3>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-sm text-gray-700 dark:text-gray-200 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-rosa-oscuro dark:text-rosa-primario" />
                                    <span>{cliente.telefono || 'Sin teléfono'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-rosa-oscuro dark:text-rosa-primario" />
                                    <span className="line-clamp-2">{cliente.direccion || 'Sin dirección'}</span>
                                </div>
                            </div>

                            {cliente.notas && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 italic border-t pt-2 mt-2">
                                    "{cliente.notas}"
                                </p>
                            )}

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-gray-100 dark:border-gray-700 hover:bg-rosa-primario/30 hover:text-rosa-oscuro dark:hover:bg-rosa-primario/10 transition-colors"
                                    onClick={() => handleEdit(cliente)}
                                >
                                    <Edit className="h-4 w-4 mr-2" /> Editar
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    onClick={() => handleDelete(cliente.id_cliente)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Cliente" : "Nuevo Cliente ✨"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="nombre_cliente">Nombre Completo</Label>
                        <Input id="nombre_cliente" name="nombre_cliente" value={formData.nombre_cliente} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="300 123 4567" />
                    </div>
                    <div>
                        <Label htmlFor="direccion">Dirección</Label>
                        <Input id="direccion" name="direccion" value={formData.direccion} onChange={handleInputChange} />
                    </div>
                    <div>
                        <Label htmlFor="notas">Notas</Label>
                        <Input id="notas" name="notas" value={formData.notas} onChange={handleInputChange} />
                    </div>
                    <Button type="submit" className="w-full mt-4 bg-rosa-secundario hover:bg-rosa-oscuro text-white shadow-md shadow-rosa-secundario/20">
                        Guardar Cliente 👥
                    </Button>
                </form>
            </Modal>
        </div>
    );
};

export default Clientes;
