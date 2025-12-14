require('dotenv').config();
const mysql = require('mysql2/promise');

async function check() {
    try {
        console.log('Connecting to DB...', process.env.DB_HOST);
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        console.log('Connected! Listing tables...');
        const [rows] = await connection.execute('SHOW TABLES');
        console.log('Tables:', rows);
        
        // Try to find a Skins table and select one row
        const skinsTable = rows.find(r => Object.values(r)[0].toLowerCase().includes('skin'));
        if (skinsTable) {
            const tableName = Object.values(skinsTable)[0];
            console.log(`Found possible skins table: ${tableName}`);
            const [data] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 1`);
            console.log('Sample Data:', data);
        } else {
            console.log("No table with 'skin' in name found.");
        }

        await connection.end();
    } catch (e) {
        console.error('Error:', e);
    }
}

check();
