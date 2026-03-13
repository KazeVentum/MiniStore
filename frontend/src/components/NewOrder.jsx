import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getProductos, getClientes, getCanales,
  createPedido, updatePedido, getPedidoById,
  createCliente, createProducto, getCategorias,
} from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import Modal from './ui/modal';
import { Plus, Trash2, Save, ArrowLeft, UserPlus, Clock } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// NewOrder — dual-purpose create / edit form
//
// React concepts demonstrated:
//
// 1. useParams — reads the `:id` segment from the URL (/orders/edit/:id).
//    When `id` is undefined the component is in create mode;
//    when it has a value it's in edit mode.
//
// 2. useRef — used to get a direct reference to a DOM node (the client
//    search container). This lets us detect clicks outside the dropdown
//    without any state change on every mouse move.
//
// 3. Multiple useEffect calls — each effect has a clear, single purpose:
//      a) Load dropdown data (clients, channels, products, categories)
//      b) Auto-fill shipping address when client + shipping are selected
//      c) Compute deadline countdown
//      d) Load existing order when in edit mode
//
// 4. Nested object state — formData.productos is an array inside the
//    form object. Immutable update pattern: spread prev, replace the key.
//
// 5. Synthetic event simulation — when selecting a client from the custom
//    dropdown we call handleInputChange with a plain object that mimics
//    the structure of a real DOM event ({ target: { name, value } }).
// ─────────────────────────────────────────────────────────────────────────────
const NewOrder = () => {
  const navigate  = useNavigate();
  const { id }    = useParams();               // undefined in create mode
  const isEdit    = Boolean(id);

  // -- Loading and lookup data --
  const [loading, setLoading]       = useState(true);
  const [clients, setClients]       = useState([]);
  const [channels, setChannels]     = useState([]);
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);

  // -- Main form state --
  const [formData, setFormData] = useState({
    id_cliente:      '',
    id_canal:        '',
    fecha_pedido:    new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
    fecha_limite:    '',
    costo_envio:     0,
    requiere_envio:  false,
    direccion_envio: '',
    notas:           '',
    metodo_pago:     'Efectivo',
    productos:       [], // [{ id_producto, nombre, precio, cantidad }]
  });

  // -- Product selector state --
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity]               = useState(1);
  const [daysRemaining, setDaysRemaining]     = useState(null);

  // -- Client search dropdown state --
  const [clientSearch, setClientSearch]       = useState('');
  const [isDropdownOpen, setIsDropdownOpen]   = useState(false);
  const dropdownRef                           = useRef(null); // ref for click-outside detection

  // -- Quick-create modals --
  const [isClientModalOpen, setIsClientModalOpen]   = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState({ nombre_cliente: '', telefono: '', direccion: '', notas: '' });
  const [productForm, setProductForm] = useState({
    nombre_producto: '', descripcion: '', precio: '', tamano: 'unico', imagen_url: '', id_categoria: '',
  });

  // ── Effect: close dropdown on outside click ────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler); // cleanup on unmount
  }, []);

  // ── Effect: load dropdown data on mount ───────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cliData, canData, prodData, catData] = await Promise.all([
          getClientes(), getCanales(), getProductos(), getCategorias(),
        ]);
        setClients(cliData);
        setChannels(canData);
        setProducts(prodData);
        setCategories(catData);
      } catch (error) {
        console.error('NewOrder: error loading form data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // once on mount

  // ── Effect: load existing order in edit mode ───────────────────────────────
  useEffect(() => {
    if (!isEdit) return; // skip in create mode
    const loadOrder = async () => {
      try {
        const order = await getPedidoById(id);
        setFormData({
          fecha_pedido:    order.fecha_pedido.split('T')[0],
          fecha_limite:    order.fecha_limite ? order.fecha_limite.split('T')[0] : '',
          id_cliente:      order.id_cliente,
          id_canal:        order.id_canal,
          costo_envio:     order.costo_envio,
          requiere_envio:  order.requiere_envio === 1,
          direccion_envio: order.direccion_envio || '',
          notas:           order.notas || '',
          metodo_pago:     order.metodo_pago,
          estado:          order.estado,
          updated_at:      order.ultima_edicion,
          productos:       order.detalles.map((d) => ({
            id_producto: d.id_producto,
            nombre:      d.nombre_producto,
            precio:      d.precio_unitario,
            cantidad:    d.cantidad,
          })),
        });
      } catch (error) {
        alert('Error loading order');
        navigate('/orders');
      }
    };
    loadOrder();
  }, [id, isEdit, navigate]);

  // ── Effect: compute deadline countdown ────────────────────────────────────
  useEffect(() => {
    if (!formData.fecha_limite) { setDaysRemaining(null); return; }
    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const deadline = new Date(formData.fecha_limite); deadline.setHours(0, 0, 0, 0);
    setDaysRemaining(Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)));
  }, [formData.fecha_limite]);

  // ── Effect: auto-fill shipping address ────────────────────────────────────
  useEffect(() => {
    if (!formData.id_cliente || !formData.requiere_envio) return;
    const client = clients.find((c) => c.id_cliente === parseInt(formData.id_cliente));
    if (client?.direccion) {
      setFormData((prev) => ({ ...prev, direccion_envio: client.direccion }));
    }
  }, [formData.id_cliente, formData.requiere_envio, clients]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addProduct = () => {
    const product = products.find((p) => p.id_producto === parseInt(selectedProduct));
    if (!product) return;
    setFormData((prev) => ({
      ...prev,
      productos: [
        ...prev.productos,
        { id_producto: product.id_producto, nombre: product.nombre_producto, precio: product.precio, cantidad: parseInt(quantity) },
      ],
    }));
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeProduct = (index) => {
    setFormData((prev) => ({ ...prev, productos: prev.productos.filter((_, i) => i !== index) }));
  };

  const calculateTotal = () =>
    formData.productos.reduce((sum, item) => sum + item.precio * item.cantidad, 0) +
    parseFloat(formData.costo_envio || 0);

  const handleSubmit = async (e, forcedStatus = null) => {
    if (e) e.preventDefault();
    if (formData.productos.length === 0) { alert('Add at least one product'); return; }
    try {
      const payload = { ...formData, estado: forcedStatus || (isEdit ? formData.estado : 'pendiente') };
      if (isEdit) {
        await updatePedido(id, payload);
      } else {
        await createPedido(payload);
      }
      navigate('/orders');
    } catch (error) {
      alert(error.response?.data?.message || 'Error processing order');
    }
  };

  // -- Quick-create handlers --
  const handleClientSubmit = async (e) => {
    e.preventDefault();
    try {
      const newClient = await createCliente(clientForm);
      const updated   = await getClientes();
      setClients(updated);
      setFormData((prev) => ({ ...prev, id_cliente: newClient.id }));
      setIsClientModalOpen(false);
      setClientForm({ nombre_cliente: '', telefono: '', direccion: '', notas: '' });
    } catch { alert('Error creating client'); }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const newProduct = await createProducto(productForm);
      const updated    = await getProductos();
      setProducts(updated);
      setSelectedProduct(newProduct.id);
      setIsProductModalOpen(false);
      setProductForm({ nombre_producto: '', descripcion: '', precio: '', tamano: 'unico', imagen_url: '', id_categoria: '' });
    } catch { alert('Error creating product'); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 spinner animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">

      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-brand-default transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Orders
          </button>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white tracking-tight">
            {isEdit ? 'Edit' : 'New'} <span className="text-gradient">Order</span>
          </h1>
        </div>

        {isEdit && formData.estado && (
          <span className={cn(
            'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border',
            formData.estado === 'completado' ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
            formData.estado === 'pendiente'  ? 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                                              'text-text-muted bg-surface-muted border-surface-border dark:border-dark-border'
          )}>
            {formData.estado}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── Left column: order details ── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Customer & metadata card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-brand-light dark:bg-brand-default/10 text-brand-default">
                  <UserPlus className="h-4 w-4" />
                </span>
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Searchable client dropdown */}
              <div className="space-y-2">
                <Label className="flex justify-between items-center text-xs font-semibold text-text-muted uppercase tracking-widest">
                  Customer
                  <button
                    type="button"
                    onClick={() => setIsClientModalOpen(true)}
                    className="text-brand-default hover:underline text-xs flex items-center gap-1 font-semibold normal-case tracking-normal"
                  >
                    <Plus className="h-3 w-3" /> New
                  </button>
                </Label>
                {/*
                  React concept: useRef for DOM access.
                  dropdownRef points to this div. The mousedown listener
                  checks if the click was inside this container.
                */}
                <div className="relative" ref={dropdownRef}>
                  <Input
                    placeholder="Search or select client..."
                    value={clientSearch || (clients.find((c) => c.id_cliente === parseInt(formData.id_cliente))?.nombre_cliente || '')}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setIsDropdownOpen(true);
                      if (!e.target.value) setFormData((prev) => ({ ...prev, id_cliente: '' }));
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                  />
                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-surface-card dark:bg-dark-surface border border-surface-border dark:border-dark-border rounded-xl shadow-lg max-h-52 overflow-y-auto">
                      {clients
                        .filter((c) => !clientSearch || c.nombre_cliente.toLowerCase().includes(clientSearch.toLowerCase()))
                        .slice(0, clientSearch ? undefined : 10)
                        .map((c) => (
                          <div
                            key={c.id_cliente}
                            className="px-4 py-2.5 hover:bg-brand-light dark:hover:bg-brand-default/10 cursor-pointer text-sm text-text-secondary dark:text-slate-300 transition-colors"
                            onClick={() => {
                              handleInputChange({ target: { name: 'id_cliente', value: c.id_cliente.toString() } });
                              setClientSearch('');
                              setIsDropdownOpen(false);
                            }}
                          >
                            {c.nombre_cliente}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sales channel */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-text-muted uppercase tracking-widest">Sales Channel</Label>
                <Select name="id_canal" value={formData.id_canal} onChange={handleInputChange} required>
                  <option value="">Select channel...</option>
                  {channels.map((c) => (
                    <option key={c.id_canal} value={c.id_canal}>{c.nombre_canal}</option>
                  ))}
                </Select>
              </div>

              {/* Order date */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-text-muted uppercase tracking-widest">Order Date</Label>
                <Input type="date" name="fecha_pedido" value={formData.fecha_pedido} onChange={handleInputChange} required />
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-text-muted uppercase tracking-widest">Deadline (optional)</Label>
                <Input type="date" name="fecha_limite" value={formData.fecha_limite} onChange={handleInputChange} />
                {daysRemaining !== null && (
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                    daysRemaining < 0  ? 'bg-danger/10 text-danger' :
                    daysRemaining < 3  ? 'bg-warning/10 text-warning' :
                                         'bg-success/10 text-success'
                  )}>
                    <Clock className="h-3 w-3" />
                    {daysRemaining < 0 ? `Overdue (${Math.abs(daysRemaining)}d)` :
                     daysRemaining === 0 ? 'Due today' :
                     `${daysRemaining} days remaining`}
                  </span>
                )}
              </div>

              {/* Shipping toggle */}
              <div className="md:col-span-2 space-y-3">
                <label className="flex items-center gap-3 p-3 bg-surface-muted dark:bg-dark-bg/40 rounded-xl cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="requiere_envio"
                    checked={formData.requiere_envio}
                    onChange={handleInputChange}
                    className="h-4 w-4 accent-brand-default rounded"
                  />
                  <span className="text-sm font-medium text-text-secondary dark:text-slate-300">
                    This order requires home delivery
                  </span>
                </label>

                {formData.requiere_envio && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-text-muted uppercase tracking-widest">Shipping Address</Label>
                    <Input
                      name="direccion_envio"
                      value={formData.direccion_envio}
                      onChange={handleInputChange}
                      placeholder="Street, Number, City..."
                    />
                  </div>
                )}
              </div>

              {/* Payment method toggle buttons */}
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-semibold text-text-muted uppercase tracking-widest">Payment Method</Label>
                <div className="flex flex-wrap gap-2">
                  {['Efectivo', 'Nequi', 'Daviplata', 'Transferencia', 'Otro'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, metodo_pago: method }))}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-semibold border transition-all',
                        formData.metodo_pago === method
                          ? 'bg-brand-default text-white border-brand-default shadow-sm'
                          : 'bg-transparent text-text-secondary border-surface-border dark:border-dark-border hover:border-brand-soft dark:text-slate-300'
                      )}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-semibold text-text-muted uppercase tracking-widest">Notes</Label>
                <textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleInputChange}
                  className="w-full min-h-[80px] p-3 bg-white dark:bg-dark-surface border border-surface-border dark:border-dark-border rounded-xl text-sm text-text-primary dark:text-slate-200 focus:ring-2 focus:ring-brand-default outline-none transition-all placeholder:text-text-muted resize-none"
                  placeholder="Special instructions..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Product selection card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-500">
                  <Plus className="h-4 w-4" />
                </span>
                Product Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <Label className="text-xs font-semibold text-text-muted uppercase tracking-widest flex justify-between">
                    Product
                    <button
                      type="button"
                      onClick={() => setIsProductModalOpen(true)}
                      className="text-brand-default hover:underline text-xs flex items-center gap-1 font-semibold normal-case tracking-normal"
                    >
                      <Plus className="h-3 w-3" /> New
                    </button>
                  </Label>
                  <Select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                      <option key={p.id_producto} value={p.id_producto}>
                        {p.nombre_producto} — {formatCurrency(p.precio)}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-text-muted uppercase tracking-widest">Qty</Label>
                  <div className="flex items-center h-10 border border-surface-border dark:border-dark-border rounded-xl overflow-hidden bg-white dark:bg-dark-surface">
                    <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 h-full hover:bg-surface-muted dark:hover:bg-dark-border transition-colors font-bold text-text-muted">−</button>
                    <input
                      type="number" min="1" value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-10 text-center bg-transparent border-none focus:ring-0 font-bold text-text-primary dark:text-white text-sm"
                    />
                    <button type="button" onClick={() => setQuantity((q) => q + 1)} className="px-3 h-full hover:bg-surface-muted dark:hover:bg-dark-border transition-colors font-bold text-text-muted">+</button>
                  </div>
                </div>

                <Button type="button" onClick={addProduct} disabled={!selectedProduct} className="gap-2">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>

              {formData.productos.length > 0 ? (
                <div className="rounded-xl border border-surface-border dark:border-dark-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-muted dark:bg-dark-border">
                      <tr className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        <th className="text-left px-4 py-3">Product</th>
                        <th className="text-center px-4 py-3">Qty</th>
                        <th className="text-right px-4 py-3">Unit Price</th>
                        <th className="text-right px-4 py-3">Subtotal</th>
                        <th className="w-12" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border dark:divide-dark-border">
                      {formData.productos.map((item, index) => (
                        <tr key={index} className="hover:bg-surface-muted/50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-medium text-text-primary dark:text-white">{item.nombre}</td>
                          <td className="px-4 py-3 text-center text-text-muted">{item.cantidad}</td>
                          <td className="px-4 py-3 text-right text-text-muted">{formatCurrency(item.precio)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-brand-default dark:text-dark-accent">
                            {formatCurrency(item.precio * item.cantidad)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button type="button" onClick={() => removeProduct(index)} className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center text-center space-y-2 border-2 border-dashed border-surface-border dark:border-dark-border rounded-xl">
                  <Plus className="h-6 w-6 text-text-muted opacity-50" />
                  <p className="text-sm text-text-muted">No products added yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right column: order summary ── */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-8">
          <Card>
            <div className="h-1 bg-brand-default rounded-t-2xl" />
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Subtotal</span>
                <span className="font-semibold text-text-primary dark:text-white">
                  {formatCurrency(formData.productos.reduce((s, i) => s + i.precio * i.cantidad, 0))}
                </span>
              </div>

              <div className="flex justify-between items-center px-3 py-2.5 bg-surface-muted dark:bg-dark-bg/40 rounded-xl">
                <span className="text-sm text-text-muted">Shipping cost</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-text-muted">$</span>
                  <input
                    type="number"
                    className="w-20 bg-transparent text-right font-semibold text-text-primary dark:text-white focus:ring-0 focus:outline-none text-sm"
                    value={formData.costo_envio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, costo_envio: e.target.value }))}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-surface-border dark:border-dark-border">
                <div className="flex justify-between items-center p-4 bg-brand-light dark:bg-brand-default/10 rounded-xl border border-brand-soft dark:border-brand-default/20 mb-4">
                  <span className="text-sm font-semibold text-text-primary dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-brand-default dark:text-dark-accent">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-default hover:bg-brand-hover text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                  >
                    <Save className="h-4 w-4" />
                    {isEdit ? 'Save Changes' : 'Confirm Order'}
                  </button>

                  {!isEdit && (
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, 'borrador')}
                      className="w-full py-3 bg-surface-muted dark:bg-dark-border hover:bg-surface-border dark:hover:bg-dark-border/80 text-text-secondary dark:text-slate-300 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      Save as Draft
                    </button>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-text-muted text-center pt-2 italic">
                Draft orders do not affect stock until confirmed.
              </p>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* ── Quick client modal ── */}
      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Quick Customer Registration">
        <form onSubmit={handleClientSubmit} className="space-y-4">
          <div><Label>Full Name</Label><Input name="nombre_cliente" value={clientForm.nombre_cliente} onChange={(e) => setClientForm((p) => ({ ...p, [e.target.name]: e.target.value }))} required placeholder="Jane Smith" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Phone</Label><Input name="telefono" value={clientForm.telefono} onChange={(e) => setClientForm((p) => ({ ...p, [e.target.name]: e.target.value }))} placeholder="300 123 4567" /></div>
            <div><Label>Address</Label><Input name="direccion" value={clientForm.direccion} onChange={(e) => setClientForm((p) => ({ ...p, [e.target.name]: e.target.value }))} placeholder="Street 123" /></div>
          </div>
          <div><Label>Notes</Label><Input name="notas" value={clientForm.notas} onChange={(e) => setClientForm((p) => ({ ...p, [e.target.name]: e.target.value }))} placeholder="Morning deliveries preferred" /></div>
          <Button type="submit" className="w-full gap-2"><UserPlus className="h-4 w-4" /> Register & Select</Button>
        </form>
      </Modal>

      {/* ── Quick product modal ── */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Quick Product Registration">
        <form onSubmit={handleProductSubmit} className="space-y-4">
          <div><Label>Name</Label><Input name="nombre_producto" value={productForm.nombre_producto} onChange={(e) => setProductForm((p) => ({ ...p, [e.target.name]: e.target.value }))} required placeholder="Silver Ring" /></div>
          <div><Label>Description</Label><Input name="descripcion" value={productForm.descripcion} onChange={(e) => setProductForm((p) => ({ ...p, [e.target.name]: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Price</Label><Input name="precio" type="number" step="1" value={productForm.precio} onChange={(e) => setProductForm((p) => ({ ...p, [e.target.name]: e.target.value }))} required /></div>
            <div><Label>Size</Label>
              <Select name="tamano" value={productForm.tamano} onChange={(e) => setProductForm((p) => ({ ...p, [e.target.name]: e.target.value }))}>
                <option value="unico">One size</option>
                <option value="pequeño">Small</option>
                <option value="mediano">Medium</option>
                <option value="grande">Large</option>
              </Select>
            </div>
          </div>
          <div><Label>Category</Label>
            <Select name="id_categoria" value={productForm.id_categoria} onChange={(e) => setProductForm((p) => ({ ...p, [e.target.name]: e.target.value }))} required>
              <option value="">Select...</option>
              {categories.map((c) => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>)}
            </Select>
          </div>
          <div><Label>Image URL</Label><Input name="imagen_url" value={productForm.imagen_url} onChange={(e) => setProductForm((p) => ({ ...p, [e.target.name]: e.target.value }))} placeholder="https://..." /></div>
          <Button type="submit" className="w-full gap-2"><Save className="h-4 w-4" /> Save & Add</Button>
        </form>
      </Modal>
    </div>
  );
};

export default NewOrder;
