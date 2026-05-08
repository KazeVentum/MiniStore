import supabase from './supabase';
import {
    saveProductosBulk,
    saveClientesBulk,
    savePedidosBulk,
    saveCanalesBulk,
    saveCategoriasBulk
} from './database';

/**
 * Service to centralize the download of data from Supabase to SQLite
 */
export const performFullSync = async () => {
    try {
        console.log('--- Starting Full Sync ---');

        // 1. Fetch Categories
        const { data: categories, error: catError } = await supabase
            .from('categorias')
            .select('*');
        if (catError) throw catError;

        // 2. Fetch Products
        const { data: products, error: pError } = await supabase
            .from('productos')
            .select('*');
        if (pError) throw pError;

        // 3. Fetch Clients
        const { data: clients, error: cError } = await supabase
            .from('clientes')
            .select('*');
        if (cError) throw cError;

        // 4. Fetch Orders (Headers)
        const { data: pedidos, error: oError } = await supabase
            .from('pedidos')
            .select('*');
        if (oError) throw oError;

        // 5. Fetch Order Details (Items)
        const { data: orderDetails, error: odError } = await supabase
            .from('detalle_pedidos')
            .select('*');
        if (odError) throw odError;

        // 6. Fetch Sales Channels
        const { data: channels, error: chError } = await supabase
            .from('canales_venta')
            .select('*');
        if (chError) throw chError;

        // Save everything to SQLite (order matters for FK constraints)
        console.log('Saving downloaded data to local database...');
        await saveCategoriasBulk(categories || []);
        await saveCanalesBulk(channels || []);
        await saveClientesBulk(clients || []);
        await saveProductosBulk(products || []);
        await savePedidosBulk(pedidos || [], orderDetails || []);

        console.log('--- Full Sync Completed Successfully ---');
        return { success: true };
    } catch (error) {
        console.error('Sync service failed:', error);
        throw error;
    }
};
