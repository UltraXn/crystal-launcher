
import pool from './config/database.ts';

async function checkTables() {
    try {
        const [rows] = await pool.query("SHOW TABLES");
        console.log("Tables:", rows);
        
        // Check if donations table exists and describe it
        const [tables] = await pool.query("SHOW TABLES LIKE 'donations'");
        if ((tables as unknown[]).length > 0) {
            console.log("Found 'donations' table. Describing...");
            const [columns] = await pool.query("DESCRIBE donations");
            console.log("Columns:", columns);
        } else {
            console.log("'donations' table NOT found.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
    process.exit();
}

checkTables();
