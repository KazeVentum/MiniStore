import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_APIKEY
);

const server = new Server(
  { name: 'ariels-jewelry-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // --- PRODUCTOS ---
    {
      name: 'listar_productos',
      description: 'Obtiene todos los productos de la tienda',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'crear_producto',
      description: 'Crea un nuevo producto',
      inputSchema: {
        type: 'object',
        required: ['name', 'price'],
        properties: {
          name:      { type: 'string',  description: 'Nombre del producto' },
          price:     { type: 'number',  description: 'Precio en COP' },
          image_url: { type: 'string',  description: 'URL de la imagen (opcional)' },
          featured:  { type: 'boolean', description: 'Si es producto destacado (opcional)' }
        }
      }
    },
    {
      name: 'actualizar_producto',
      description: 'Actualiza un producto existente',
      inputSchema: {
        type: 'object',
        required: ['id'],
        properties: {
          id:        { type: 'number',  description: 'ID del producto' },
          name:      { type: 'string',  description: 'Nuevo nombre' },
          price:     { type: 'number',  description: 'Nuevo precio en COP' },
          image_url: { type: 'string',  description: 'Nueva URL de imagen' },
          featured:  { type: 'boolean', description: 'Si es destacado' }
        }
      }
    },
    {
      name: 'eliminar_producto',
      description: 'Elimina un producto por ID',
      inputSchema: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number', description: 'ID del producto a eliminar' }
        }
      }
    },
    // --- CLIENTES ---
    {
      name: 'listar_clientes',
      description: 'Obtiene todos los clientes registrados',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'crear_cliente',
      description: 'Registra un nuevo cliente',
      inputSchema: {
        type: 'object',
        required: ['name', 'phone', 'email'],
        properties: {
          name:  { type: 'string', description: 'Nombre completo' },
          phone: { type: 'string', description: 'Teléfono' },
          email: { type: 'string', description: 'Email único' }
        }
      }
    },
    {
      name: 'eliminar_cliente',
      description: 'Elimina un cliente por ID',
      inputSchema: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number', description: 'ID del cliente a eliminar' }
        }
      }
    },
    // --- PEDIDOS ---
    {
      name: 'listar_pedidos',
      description: 'Obtiene todos los pedidos con sus totales',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      name: 'crear_pedido',
      description: 'Crea un nuevo pedido calculando el total automáticamente',
      inputSchema: {
        type: 'object',
        required: ['id_producto', 'quantity'],
        properties: {
          id_producto: { type: 'number', description: 'ID del producto' },
          quantity:    { type: 'number', description: 'Cantidad' },
          id_cliente:  { type: 'number', description: 'ID del cliente (opcional)' },
          notes:       { type: 'string', description: 'Notas del pedido (opcional)' }
        }
      }
    },
    {
      name: 'eliminar_pedido',
      description: 'Elimina un pedido por ID',
      inputSchema: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'number', description: 'ID del pedido a eliminar' }
        }
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {

      case 'listar_productos': {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('activo', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }

      case 'crear_producto': {
        const { data, error } = await supabase
          .from('productos')
          .insert({ name: args.name, price: args.price, image_url: args.image_url || null, featured: args.featured || false })
          .select()
          .single();
        if (error) throw error;
        return { content: [{ type: 'text', text: `Producto creado: ${JSON.stringify(data, null, 2)}` }] };
      }

      case 'actualizar_producto': {
        const { id, ...fields } = args;
        const { data, error } = await supabase
          .from('productos')
          .update(fields)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return { content: [{ type: 'text', text: `Producto actualizado: ${JSON.stringify(data, null, 2)}` }] };
      }

      case 'eliminar_producto': {
        const { error } = await supabase.from('productos').delete().eq('id', args.id);
        if (error) throw error;
        return { content: [{ type: 'text', text: `Producto ${args.id} eliminado correctamente` }] };
      }

      case 'listar_clientes': {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }

      case 'crear_cliente': {
        const { data, error } = await supabase
          .from('clientes')
          .insert({ name: args.name, phone: args.phone, email: args.email })
          .select()
          .single();
        if (error) throw error;
        return { content: [{ type: 'text', text: `Cliente creado: ${JSON.stringify(data, null, 2)}` }] };
      }

      case 'eliminar_cliente': {
        const { error } = await supabase.from('clientes').delete().eq('id', args.id);
        if (error) throw error;
        return { content: [{ type: 'text', text: `Cliente ${args.id} eliminado correctamente` }] };
      }

      case 'listar_pedidos': {
        const { data, error } = await supabase
          .from('pedidos')
          .select('*, clientes(name, email)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
      }

      case 'crear_pedido': {
        const { data: producto, error: prodError } = await supabase
          .from('productos')
          .select('name, price')
          .eq('id', args.id_producto)
          .single();
        if (prodError) throw new Error('Producto no encontrado');

        const total = producto.price * args.quantity;
        const { data, error } = await supabase
          .from('pedidos')
          .insert({
            id_producto:  args.id_producto,
            product_name: producto.name,
            quantity:     args.quantity,
            total,
            id_cliente:   args.id_cliente || null,
            notes:        args.notes || null
          })
          .select()
          .single();
        if (error) throw error;
        return { content: [{ type: 'text', text: `Pedido creado: ${JSON.stringify(data, null, 2)}` }] };
      }

      case 'eliminar_pedido': {
        const { error } = await supabase.from('pedidos').delete().eq('id', args.id);
        if (error) throw error;
        return { content: [{ type: 'text', text: `Pedido ${args.id} eliminado correctamente` }] };
      }

      default:
        throw new Error(`Tool desconocida: ${name}`);
    }
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
