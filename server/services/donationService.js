const supabase = require('./supabaseService');

const getMonthlyStats = async () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11

    // ISO Strings for Supabase comparison
    // Use UTC to ensure consistency
    const startOfCurrentMonth = new Date(Date.UTC(currentYear, currentMonth, 1)).toISOString();
    const startOfNextMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 1)).toISOString();
    const startOfPrevMonth = new Date(Date.UTC(currentYear, currentMonth - 1, 1)).toISOString();

    // Query Current Month
    const { data: currentData, error: currentError } = await supabase
        .from('donations')
        .select('amount')
        .gte('created_at', startOfCurrentMonth)
        .lt('created_at', startOfNextMonth);

    if (currentError) throw currentError;

    // Query Previous Month
    const { data: prevData, error: prevError } = await supabase
        .from('donations')
        .select('amount')
        .gte('created_at', startOfPrevMonth)
        .lt('created_at', startOfCurrentMonth);

    if (prevError) throw prevError;

    // Helper helper sum
    const sum = (rows) => rows.reduce((acc, row) => acc + parseFloat(row.amount || 0), 0);
    const currentTotal = sum(currentData);
    const prevTotal = sum(prevData);

    // Calculate percent change
    let percentChange = 0;
    if (prevTotal > 0) {
        percentChange = ((currentTotal - prevTotal) / prevTotal) * 100;
    } else if (currentTotal > 0) {
        percentChange = 100;
    }

    return {
        currentMonth: currentTotal.toFixed(2),
        previousMonth: prevTotal.toFixed(2),
        percentChange: percentChange.toFixed(1)
    };
};

module.exports = { getMonthlyStats };
