
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Usar Service Role en Backend para permisos completos

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or Key missing in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
