// server.js
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const db = require('./database');

// Configure Express
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- C R U D   O P E R A T I O N S ---

// 1. READ: Display all employees (R)
app.get('/', (req, res) => {
    const sql = "SELECT * FROM employees ORDER BY id DESC";
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({"error": err.message});
        }
        if (process.env.NODE_ENV === 'test') {
            return res.status(200).json({ employees: rows });
        }
        // Render the index.ejs template and pass the employee data (rows) to it
        res.render('index', { employees: rows });
    });
});

// 2. CREATE: Add a new employee (C)
app.post('/add', (req, res) => {
    const { name, email, department, salary } = req.body;
    
    // Basic validation
    if (!name || !department) {
        return res.status(400).json({ error: "Name and Department are required."});
    }

    const sql = 'INSERT INTO employees (name, email, department, salary) VALUES (?, ?, ?, ?)';
    const params = [name, email || null, department, parseFloat(salary) || 0];

    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        console.log(`Employee added with ID: ${this.lastID}`);
        if (process.env.NODE_ENV === 'test') {
            return res.status(201).json({
                id: this.lastID,
                message: `Employee added with ID: ${this.lastID}`
            });
        }
        res.redirect('/'); // Go back to the list
    });
});

// 3. UPDATE: Edit an existing employee (U)
app.post('/update/:id', (req, res) => {
    const id = req.params.id;
    const { name, email, department, salary } = req.body;

    // Basic validation
    if (!name || !department) {
        return res.status(400).json({ error: "Name and Department are required for update."});
    }
    
    const sql = 'UPDATE employees SET name = ?, email = ?, department = ?, salary = ? WHERE id = ?';
    const params = [name, email || null, department, parseFloat(salary) || 0, id];

    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: `No employee found with ID ${id}` });
        }
        console.log(`Employee ${id} updated.`);
        if (process.env.NODE_ENV === 'test') {
            return res.status(200).json({ message: `Employee ${id} updated.`, changes: this.changes });
        }
        res.redirect('/'); // Go back to the list
    });
});

// 4. DELETE: Remove an employee (D)
app.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM employees WHERE id = ?';
    
    db.run(sql, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: `No employee found with ID ${id}` });
        }
        console.log(`Employee ${id} deleted.`);
        if (process.env.NODE_ENV === 'test') {
            return res.status(200).json({ message: `Employee ${id} deleted.`, changes: this.changes });
        }
        res.redirect('/'); // Go back to the list
    });
});


// Start server only if this file is run directly
if (require.main === module) {
    app.listen(port, '0.0.0.0', () => {
        console.log(`Server running at http://0.0.0.0:${port}`);
    });
}

module.exports = app;
