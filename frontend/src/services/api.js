import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export const getDashboardStats = async () => {
    const response = await api.get('/reportes/stats');
    return response.data;
};

export const getGanancias = async () => {
    const response = await api.get('/reportes/ganancias');
    return response.data;
};

export const getVentasRecientes = async (periodo = '7') => {
    const response = await api.get(`/reportes/ventas-recientes?periodo=${periodo}`);
    return response.data;
};

export const getProductosTop = async () => {
    const response = await api.get('/reportes/productos-top');
    return response.data;
};

export const getProductos = async (categoria) => {
    const params = categoria ? { categoria } : {};
    const response = await api.get('/productos', { params });
    return response.data;
};

export const createProducto = async (producto) => {
    const response = await api.post('/productos', producto);
    return response.data;
};

export const updateProducto = async (id, producto) => {
    const response = await api.put(`/productos/${id}`, producto);
    return response.data;
};

export const deleteProducto = async (id) => {
    const response = await api.delete(`/productos/${id}`);
    return response.data;
};

export const getPedidos = async () => {
    const response = await api.get('/pedidos');
    return response.data;
};

export const getPedidoById = async (id) => {
    const response = await api.get(`/pedidos/${id}`);
    return response.data;
};

export const updateEstadoPedido = async (id, estado) => {
    const response = await api.patch(`/pedidos/${id}/estado`, { estado });
    return response.data;
};

export const createPedido = async (pedido) => {
    const response = await api.post('/pedidos', pedido);
    return response.data;
};

export const getCategorias = async () => {
    const response = await api.get('/common/categorias');
    return response.data;
};

export const getClientes = async () => {
    const response = await api.get('/common/clientes');
    return response.data;
};

export const getCanales = async () => {
    const response = await api.get('/common/canales');
    return response.data;
};

export const createCliente = async (cliente) => {
    const response = await api.post('/clientes', cliente);
    return response.data;
};

export const updateCliente = async (id, cliente) => {
    const response = await api.put(`/clientes/${id}`, cliente);
    return response.data;
};

export const deleteCliente = async (id) => {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
};

export default api;
