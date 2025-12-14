const donationService = require('../services/donationService');

const getStats = async (req, res) => {
    try {
        const stats = await donationService.getMonthlyStats();
        res.json(stats);
    } catch (error) {
        // If table doesn't exist, return 0s instead of crashing
        if (error.message && error.message.includes('relation "public.donations" does not exist')) {
             return res.json({ currentMonth: "0.00", previousMonth: "0.00", percentChange: "0.0" });
        }
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getStats };
