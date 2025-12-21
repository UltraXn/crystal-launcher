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

const getDonations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        
        const result = await donationService.getDonations({ page, limit, search });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createDonation = async (req, res) => {
    try {
        const result = await donationService.createDonation(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateDonation = async (req, res) => {
    try {
        const result = await donationService.updateDonation(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteDonation = async (req, res) => {
    try {
        await donationService.deleteDonation(req.params.id);
        res.json({ message: 'Donation deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    getStats,
    getDonations,
    createDonation,
    updateDonation,
    deleteDonation
};
