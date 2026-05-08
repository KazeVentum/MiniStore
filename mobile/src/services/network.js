import NetInfo from '@react-native-community/netinfo';
import supabase from './supabase';
import { db, updatePedidoId, updateEntidadSync } from './database';

/**
 * Service to manage network status and automated synchronization
 */
export const startNetworkMonitoring = (onStatusChange) => {
    return NetInfo.addEventListener(state => {
        const isConnected = !!state.isConnected && !!state.isInternetReachable;
        console.log('Network status changed:', isConnected ? 'Online' : 'Offline');

        if (isConnected) {
            processAutoSync();
        }

        if (onStatusChange) {
            onStatusChange(isConnected);
        }
    });
};

const syncPendingProducts = async () => {
    const pending = await db.getAllAsync('SELECT * FROM PRODUCTOS WHERE sincronizado = 0');
    if (pending.length === 0) return;

    console.log(`Syncing ${pending.length} pending products...`);
    for (const prod of pending) {
        try {
            // Skip products missing mandatory fields to avoid repeated Supabase errors
            if (prod.id_categoria === null || prod.id_categoria === undefined) {
                console.warn(`Skipping product ${prod.id_producto} (${prod.nombre_producto}): missing id_categoria. Please edit this product to assign a category.`);
                continue;
            }

            const productData = {
                nombre_producto: prod.nombre_producto,
                descripcion: prod.descripcion,
                precio: prod.precio,
                id_categoria: prod.id_categoria,
                activo: !!prod.activo
            };

            let result;
            if (prod.id_producto > 100000) {
                // NEW LOCAL PRODUCT
                result = await supabase.from('productos').insert(productData).select();
            } else {
                // EXISTING PRODUCT EDIT
                result = await supabase.from('productos').update(productData).eq('id_producto', prod.id_producto).select();
            }

            if (result.error) throw result.error;

            if (prod.id_producto > 100000 && result.data?.length > 0) {
                const newId = result.data[0].id_producto;
                await updateEntidadSync('PRODUCTOS', prod.id_producto, newId);
            } else {
                await db.runAsync('UPDATE PRODUCTOS SET sincronizado = 1 WHERE id_producto = ?', [prod.id_producto]);
            }
        } catch (err) {
            console.error(`Error syncing product ${prod.id_producto}:`, err);
        }
    }
};

const syncPendingClients = async () => {
    const pending = await db.getAllAsync('SELECT * FROM CLIENTES WHERE sincronizado = 0');
    if (pending.length === 0) return;

    console.log(`Syncing ${pending.length} pending clients...`);
    for (const client of pending) {
        try {
            const clientData = {
                nombre_cliente: client.nombre_cliente,
                telefono: client.telefono,
                direccion: client.direccion,
                notas: client.notas,
                activo: !!client.activo
            };

            let result;
            if (client.id_cliente > 100000) {
                result = await supabase.from('clientes').insert(clientData).select();
            } else {
                result = await supabase.from('clientes').update(clientData).eq('id_cliente', client.id_cliente).select();
            }

            if (result.error) throw result.error;

            if (client.id_cliente > 100000 && result.data?.length > 0) {
                const newId = result.data[0].id_cliente;
                await updateEntidadSync('CLIENTES', client.id_cliente, newId);
            } else {
                await db.runAsync('UPDATE CLIENTES SET sincronizado = 1 WHERE id_cliente = ?', [client.id_cliente]);
            }
        } catch (err) {
            console.error(`Error syncing client ${client.id_cliente}:`, err);
        }
    }
};

const syncListeners = new Set();

export const addSyncListener = (callback) => {
    syncListeners.add(callback);
    return () => syncListeners.delete(callback);
};

const notifySyncListeners = () => {
    syncListeners.forEach(cb => cb());
};

/**
 * Automatically uploads pending data to Supabase
 */
export const processAutoSync = async () => {
    try {
        console.log('Starting automated background sync...');

        // 1. Sync Catalog first
        try {
            await syncPendingClients();
        } catch (err) { console.error('Clients sync error:', err); }

        try {
            await syncPendingProducts();
        } catch (err) { console.error('Products sync error:', err); }

        // 2. Fetch pending orders
        const pendingPedidos = await db.getAllAsync('SELECT * FROM PEDIDOS WHERE sincronizado = 0');
        if (pendingPedidos.length === 0) {
            console.log('No pending orders to sync');
            notifySyncListeners();
            return;
        }

        console.log(`Found ${pendingPedidos.length} pending orders to upload...`);

        for (const pedido of pendingPedidos) {
            try {
                const items = await db.getAllAsync(
                    'SELECT * FROM DETALLE_PEDIDOS WHERE id_pedido = ?',
                    [pedido.id_pedido]
                );

                console.log(`Syncing order ${pedido.id_pedido} with ${items.length} items...`);

                let supabasePedidoId = pedido.id_pedido;
                let isNewOrder = pedido.id_pedido > 100000;

                // Even if ID is small, if it's not synced (sincronizado=0) we might 
                // need to verify if it exists in Supabase before deciding to INSERT or UPDATE.
                // But the ID range approach is usually enough if we start using high IDs for all local records.
                // To handle legacy small-ID orders created before the fix:
                if (!isNewOrder) {
                    const { data: remoteOrder } = await supabase.from('pedidos').select('id_pedido').eq('id_pedido', pedido.id_pedido).single();
                    if (!remoteOrder) {
                        isNewOrder = true;
                    }
                }

                if (isNewOrder) {
                    const { data: spId, error: headerError } = await supabase
                        .rpc('sp_crear_pedido', {
                            p_fecha_pedido: pedido.fecha_pedido,
                            p_id_cliente: pedido.id_cliente,
                            p_id_canal: pedido.id_canal,
                            p_costo_envio: pedido.costo_envio || 0,
                            p_requiere_envio: !!pedido.requiere_envio,
                            p_direccion_envio: pedido.direccion_envio || '',
                            p_notas: pedido.notas || ''
                        });

                    if (headerError) throw headerError;
                    supabasePedidoId = spId;
                } else {
                    const { data, error: updateError, count } = await supabase
                        .from('pedidos')
                        .update({
                            id_cliente: pedido.id_cliente,
                            id_canal: pedido.id_canal,
                            costo_envio: pedido.costo_envio,
                            requiere_envio: !!pedido.requiere_envio,
                            direccion_envio: pedido.direccion_envio,
                            notas: pedido.notas
                        })
                        .eq('id_pedido', pedido.id_pedido)
                        .select(); // select to verify existence

                    if (updateError) throw updateError;
                    if (!data || data.length === 0) {
                        console.warn(`Order ${pedido.id_pedido} not found in Supabase. Treating as new...`);
                        // Fallback: create as new or just skip if it's already "gone" from cloud
                        // For now we skip to avoid creating garbage if it was actually deleted intentionally in cloud
                        continue;
                    }
                }

                // 4. Update status and other fields
                const { error: statusError } = await supabase
                    .from('pedidos')
                    .update({
                        metodo_pago: pedido.metodo_pago || 'Efectivo',
                        estado: pedido.estado || 'pendiente',
                        fecha_limite: pedido.fecha_limite
                    })
                    .eq('id_pedido', supabasePedidoId);

                if (statusError) throw statusError;

                // 5. Sync order items
                if (!isNewOrder) {
                    const { error: delError } = await supabase.from('detalle_pedidos').delete().eq('id_pedido', supabasePedidoId);
                    if (delError) throw delError;
                }

                for (const item of items) {
                    const { error: itemError } = await supabase
                        .rpc('sp_agregar_producto_pedido', {
                            p_id_pedido: supabasePedidoId,
                            p_id_producto: item.id_producto,
                            p_cantidad: item.cantidad
                        });

                    if (itemError) {
                        // CRITICAL: if items fail, do NOT mark as synced
                        throw new Error(`Item sync failed: ${itemError.message}`);
                    }
                }

                // 6. Finalize local state
                if (isNewOrder) {
                    await updatePedidoId(pedido.id_pedido, supabasePedidoId);
                } else {
                    await db.runAsync('UPDATE PEDIDOS SET sincronizado = 1 WHERE id_pedido = ?', [pedido.id_pedido]);
                }

                console.log(`Order ${pedido.id_pedido} synced successfully`);

            } catch (err) {
                console.error(`Failed to sync order ${pedido.id_pedido}:`, err.message);
            }
        }

        console.log('Auto-sync completed');
        notifySyncListeners();
    } catch (error) {
        console.error('Auto-sync process failed:', error);
    }
};
