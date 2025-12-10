const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function clearHistorical() {
    console.log('Eliminando donaciones históricas de prueba...');

    // Eliminar las que tienen IDs que empiezan con "hist_" (son las que creamos nosotros)
    const { error, count } = await supabase
        .from('donations')
        .delete({ count: 'exact' })
        .like('message_id', 'hist_%');

    if (error) {
        console.error('Error eliminando:', error);
    } else {
        console.log(`¡Listo! Se eliminaron ${count} donaciones de prueba.`);
    }
}

clearHistorical();
