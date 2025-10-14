// database.js
const sqlite3 = require('sqlite3').verbose();
const DB_SOURCE = 'employee.sqlite';

// Open or create the database file
let db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        console.error("Database connection error: " + err.message);
        throw err;
    } else {
        console.log('Connected to the Employee SQLite database.');
        // Create an 'employees' table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            department TEXT,
            salary REAL,
            mobile_no TEXT
        )`,
        (err) => {
            if (err) {
                console.error("Table creation error: " + err.message);
            } else {
                console.log('Employees table created or already exists.');
            }
        });
    }
});

module.exports = db;