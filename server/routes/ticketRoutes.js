const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Admin Client (Service Role) for backend operations
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
} else {
    console.warn("⚠️ [Tickets] Supabase URL or Key missing. Support routes will return errors.");
}

// GET /tickets/stats - Admin Dashboard Stats
router.get('/stats', async (req, res) => {
    if (!supabase) return res.status(503).json({ open: 0, urgent: 0, error: "Service unconfigured" });

    try {
        // Count open tickets
        const { count: openCount, error: openError } = await supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'open');

        // Count urgent tickets
        const { count: urgentCount, error: urgentError } = await supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('priority', 'high');

        if (openError) throw openError;

        res.json({
            open: openCount || 0,
            urgent: urgentCount || 0
        });
    } catch (error) {
        console.error('Error fetching ticket stats:', error.message);
        res.status(500).json({ open: 0, urgent: 0 });
    }
});

module.exports = router;
