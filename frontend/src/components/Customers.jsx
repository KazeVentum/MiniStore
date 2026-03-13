import React, { useEffect, useState } from 'react';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../services/api';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import Modal from './ui/modal';
import { Plus, Trash2, Edit, Phone, MapPin, Search, UserPlus } from 'lucide-react';
import { cn } from '../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Customers
//
// React concepts demonstrated:
//
// 1. Lifting state up — all CRUD state (list, modal open, editingId, form)
//    lives in this parent component. Child elements (buttons, inputs) receive
//    handlers via props. This is how siblings communicate in React.
//
// 2. Controlled textarea — the <textarea> below uses value + onChange like
//    any other input. React always drives the value.
//
// 3. Conditional rendering with && — `{customer.notes && <p>...</p>}` renders
//    the paragraph only when notes is a non-empty string.
// ─────────────────────────────────────────────────────────────────────────────
const Customers = () => {
  const [customers, setCustomers]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [searchTerm, setSearchTerm]   = useState('');

  const [formData, setFormData] = useState({
    nombre_cliente: '',
    telefono:       '',
    direccion:      '',
    notas:          '',
  });

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchCustomers = async () => {
    try {
      const data = await getClientes();
      setCustomers(data);
    } catch (error) {
      console.error('Customers: error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    await deleteCliente(id);
    fetchCustomers();
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id_cliente);
    setFormData({
      nombre_cliente: customer.nombre_cliente,
      telefono:       customer.telefono   || '',
      direccion:      customer.direccion  || '',
      notas:          customer.notas      || '',
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({ nombre_cliente: '', telefono: '', direccion: '', notas: '' });
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
      fetchCustomers();
    } catch (error) {
      alert('Error saving customer');
    }
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const filteredCustomers = customers.filter((c) =>
    c.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.telefono && c.telefono.includes(searchTerm))
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 spinner animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">

      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white tracking-tight">
            Customers
          </h1>
          <p className="text-sm text-text-muted mt-1">Manage your buyer database</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search customer..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleCreate} className="w-full sm:w-auto gap-2">
            <UserPlus className="h-4 w-4" /> New Customer
          </Button>
        </div>
      </div>

      {/* ── Customer cards ── */}
      {filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id_cliente} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                  {/* Avatar — first letter of name in a colored circle */}
                  <div className="w-12 h-12 rounded-xl bg-brand-default flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {customer.nombre_cliente.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-text-primary dark:text-white truncate">
                      {customer.nombre_cliente}
                    </h3>
                    <span className="text-xs text-text-muted">Registered customer</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 p-3 bg-surface-muted dark:bg-dark-bg/40 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-slate-300">
                    <Phone className="h-3.5 w-3.5 text-text-muted shrink-0" />
                    <span>{customer.telefono || 'No phone registered'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-text-secondary dark:text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-text-muted shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{customer.direccion || 'No address registered'}</span>
                  </div>
                </div>

                {/* React concept: short-circuit rendering with && */}
                {customer.notas && (
                  <p className="text-xs text-text-muted italic px-1 line-clamp-2">
                    "{customer.notas}"
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="flex-1 h-9 flex items-center justify-center gap-2 text-xs font-semibold text-text-secondary bg-surface-muted dark:bg-dark-bg/40 hover:bg-surface-border dark:hover:bg-dark-border rounded-xl transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id_cliente)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-danger bg-danger/5 hover:bg-danger hover:text-white border border-danger/10 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center text-center space-y-4 border-2 border-dashed border-surface-border dark:border-dark-border rounded-2xl">
          <div className="p-4 rounded-full bg-brand-light dark:bg-brand-default/10 text-brand-default">
            <UserPlus className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary dark:text-white">No customers yet</h3>
            <p className="text-sm text-text-muted mt-1">Register your first customer to start creating orders.</p>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add Customer
          </Button>
        </div>
      )}

      {/* ── Create / Edit modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Customer' : 'New Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="nombre_cliente">Full Name</Label>
            <Input
              id="nombre_cliente"
              name="nombre_cliente"
              value={formData.nombre_cliente}
              onChange={handleInputChange}
              required
              placeholder="e.g. Jane Smith"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Phone</Label>
              <Input
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="300 123 4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Address</Label>
              <Input
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                placeholder="Street 123 #45-67"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notes</Label>
            {/*
              Controlled textarea — same pattern as <Input>.
              value + onChange keeps React in control of the text.
            */}
            <textarea
              id="notas"
              name="notas"
              value={formData.notas}
              onChange={handleInputChange}
              className="w-full min-h-[80px] p-3 bg-white dark:bg-dark-surface border border-surface-border dark:border-dark-border rounded-xl text-sm text-text-primary dark:text-slate-200 focus:ring-2 focus:ring-brand-default outline-none transition-all placeholder:text-text-muted resize-none"
              placeholder="e.g. Prefers morning deliveries..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-[2]">
              {editingId ? 'Save Changes' : 'Register Customer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
