const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const historicalDonations = [
    {
        from_name: "DannielCookies",
        amount: 1.00,
        currency: "USD",
        message: "¡Para las galletitas del server!",
        created_at: "2025-12-10T00:00:00Z",
        is_public: true,
        type: "Donation",
        message_id: "hist_001"
    },
    {
        from_name: "zeta uwu",
        amount: 3.00,
        currency: "USD",
        message: "Mucho éxito con el proyecto ✨",
        created_at: "2025-08-19T00:00:00Z",
        is_public: true,
        type: "Donation",
        message_id: "hist_002"
    },
    {
        from_name: "Mochi",
        amount: 18.00,
        currency: "USD",
        message: "Support!! <3",
        created_at: "2025-08-18T12:00:00Z",
        is_public: true,
        type: "Donation",
        message_id: "hist_003"
    },
    {
        from_name: "erPanardo",
        amount: 20.00,
        currency: "USD",
        message: "Larga vida a CrystalTides",
        created_at: "2025-08-18T10:00:00Z",
        is_public: true,
        type: "Donation",
        message_id: "hist_004"
    }
];

async function seed() {
    console.log('Insertando donaciones históricas...');
    for (const donation of historicalDonations) {
        const { error } = await supabase.from('donations').upsert(donation, { onConflict: 'message_id' });
        if (error) console.error('Error:', error);
        else console.log(`Insertado: ${donation.from_name}`);
    }
}

seed();
