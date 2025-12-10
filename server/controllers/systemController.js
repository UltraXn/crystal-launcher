exports.getStatus = (req, res) => {
    res.json({
        success: true,
        message: 'CrystalTides Backend API is online',
        timestamp: new Date().toISOString()
    });
};
