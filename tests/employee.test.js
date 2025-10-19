const request = require('supertest');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a test database in memory
const TEST_DB = ':memory:';
let db;
let app;

// Setup test app and database
beforeAll((done) => {
    // Create in-memory database for testing
    db = new sqlite3.Database(TEST_DB, (err) => {
        if (err) {
            return done(err);
        }
        
        // Create employees table
        db.run(`CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            department TEXT,
            salary REAL,
            mobile TEXT
        )`, (err) => {
            if (err) return done(err);
            
            // Setup Express app with test database
            app = express();
            app.set('view engine', 'ejs');
            app.use(express.urlencoded({ extended: true }));
            app.use(express.json());
            
            // READ: Display all employees
            app.get('/', (req, res) => {
                const sql = "SELECT * FROM employees ORDER BY id DESC";
                db.all(sql, [], (err, rows) => {
                    if (err) {
                        res.status(500).json({"error": err.message});
                        return;
                    }
                    res.json({ employees: rows });
                });
            });
            
            // CREATE: Add a new employee
            app.post('/add', (req, res) => {
                const { name, email, department, salary, mobile } = req.body;
                
                if (!name || !department) {
                    return res.status(400).send("Name and Department are required.");
                }
                
                const sql = 'INSERT INTO employees (name, email, department, salary, mobile) VALUES (?, ?, ?, ?, ?)';
                const params = [name, email || null, department, parseFloat(salary) || 0, mobile || null];
                
                db.run(sql, params, function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.status(201).json({ 
                        id: this.lastID, 
                        message: `Employee added with ID: ${this.lastID}` 
                    });
                });
            });
            
            // UPDATE: Edit an existing employee
            app.post('/update/:id', (req, res) => {
                const id = req.params.id;
                const { name, email, department, salary, mobile } = req.body;
                
                if (!name || !department) {
                    return res.status(400).send("Name and Department are required for update.");
                }
                
                const sql = 'UPDATE employees SET name = ?, email = ?, department = ?, salary = ?, mobile = ? WHERE id = ?';
                const params = [name, email || null, department, parseFloat(salary) || 0, mobile || null, id];
                
                db.run(sql, params, function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    if (this.changes === 0) {
                        return res.status(404).json({ message: `No employee found with ID ${id}` });
                    }
                    res.json({ message: `Employee ${id} updated.`, changes: this.changes });
                });
            });
            
            // DELETE: Remove an employee
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
                    res.json({ message: `Employee ${id} deleted.`, changes: this.changes });
                });
            });
            
            done();
        });
    });
});

// Clear database after each test
afterEach((done) => {
    db.run('DELETE FROM employees', done);
});

// Close database connection after all tests
afterAll((done) => {
    db.close(done);
});

// ============ TEST SUITES ============

describe('Employee CRUD API Tests', () => {
    
    // ========== CREATE Tests ==========
    describe('POST /add - Create Employee', () => {
        
        test('should create a new employee with all fields', async () => {
                const response = await request(app)
                .post('/add')
                .send({
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    department: 'Engineering',
                    salary: 75000,
                    mobile: '+1 555-000-0000'
                });
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('message');
            expect(response.body.id).toBe(1);
        });
        
        test('should create employee without optional email', async () => {
            const response = await request(app)
                .post('/add')
                .send({
                    name: 'Jane Smith',
                    department: 'Marketing',
                    salary: 65000
                });
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.id).toBeGreaterThan(0);
        });
        
        test('should create employee without optional salary', async () => {
            const response = await request(app)
                .post('/add')
                .send({
                    name: 'Bob Johnson',
                    email: 'bob@example.com',
                    department: 'Sales'
                });
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.id).toBeGreaterThan(0);
        });
        
        test('should return 400 if name is missing', async () => {
            const response = await request(app)
                .post('/add')
                .send({
                    department: 'HR',
                    salary: 50000
                });
            
            expect(response.status).toBe(400);
            expect(response.text).toContain('Name and Department are required');
        });
        
        test('should return 400 if department is missing', async () => {
            const response = await request(app)
                .post('/add')
                .send({
                    name: 'Alice Brown',
                    salary: 80000
                });
            
            expect(response.status).toBe(400);
            expect(response.text).toContain('Name and Department are required');
        });
    });
    
    // ========== READ Tests ==========
    describe('GET / - Read Employees', () => {
        
        test('should return empty array when no employees exist', async () => {
            const response = await request(app).get('/');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('employees');
            expect(response.body.employees).toEqual([]);
        });
        
        test('should return all employees', async () => {
            // Add test employees
            await request(app).post('/add').send({
                name: 'Employee 1',
                email: 'emp1@example.com',
                department: 'IT',
                salary: 70000,
                mobile: '+1 555-111-1111'
            });
            
            await request(app).post('/add').send({
                name: 'Employee 2',
                email: 'emp2@example.com',
                department: 'Finance',
                salary: 80000,
                mobile: '+1 555-222-2222'
            });
            
            const response = await request(app).get('/');
            
            expect(response.status).toBe(200);
            expect(response.body.employees).toHaveLength(2);
            expect(response.body.employees[0].name).toBe('Employee 2'); // DESC order
            expect(response.body.employees[1].name).toBe('Employee 1');
        });
        
        test('should return employees in DESC order by id', async () => {
            await request(app).post('/add').send({ name: 'First', department: 'A', mobile: '+1 555-101-0101' });
            await request(app).post('/add').send({ name: 'Second', department: 'B', mobile: '+1 555-202-0202' });
            await request(app).post('/add').send({ name: 'Third', department: 'C', mobile: '+1 555-303-0303' });
            
            const response = await request(app).get('/');
            
            expect(response.body.employees[0].name).toBe('Third');
            expect(response.body.employees[1].name).toBe('Second');
            expect(response.body.employees[2].name).toBe('First');
        });
    });
    
    // ========== UPDATE Tests ==========
    describe('POST /update/:id - Update Employee', () => {
        
        test('should update employee with all fields', async () => {
            // Create employee first
            const createRes = await request(app).post('/add').send({
                name: 'Original Name',
                email: 'original@example.com',
                department: 'Original Dept',
                salary: 50000
            });
            
            const employeeId = createRes.body.id;
            
            // Update employee
            const updateRes = await request(app)
                .post(`/update/${employeeId}`)
                .send({
                    name: 'Updated Name',
                    email: 'updated@example.com',
                    department: 'Updated Dept',
                    salary: 60000,
                    mobile: '+1 555-999-9999'
                });
            
            expect(updateRes.status).toBe(200);
            expect(updateRes.body.message).toContain('updated');
            expect(updateRes.body.changes).toBe(1);
            
            // Verify update
            const getRes = await request(app).get('/');
            const employee = getRes.body.employees[0];
            expect(employee.name).toBe('Updated Name');
            expect(employee.email).toBe('updated@example.com');
            expect(employee.department).toBe('Updated Dept');
            expect(employee.salary).toBe(60000);
        });
        
        test('should update employee and clear email', async () => {
            const createRes = await request(app).post('/add').send({
                name: 'Test User',
                email: 'test@example.com',
                department: 'Testing',
                mobile: '+1 555-111-2222'
            });
            
            const employeeId = createRes.body.id;
            
            const updateRes = await request(app)
                .post(`/update/${employeeId}`)
                .send({
                    name: 'Test User',
                    email: '',
                    department: 'Testing',
                    mobile: ''
                });
            
            expect(updateRes.status).toBe(200);
            
            const getRes = await request(app).get('/');
            expect(getRes.body.employees[0].email).toBeNull();
        });
        
        test('should return 400 if name is missing in update', async () => {
            const createRes = await request(app).post('/add').send({
                name: 'Test',
                department: 'Test Dept'
            });
            
            const updateRes = await request(app)
                .post(`/update/${createRes.body.id}`)
                .send({
                    department: 'New Dept',
                    salary: 55000
                });
            
            expect(updateRes.status).toBe(400);
            expect(updateRes.text).toContain('Name and Department are required');
        });
        
        test('should return 400 if department is missing in update', async () => {
            const createRes = await request(app).post('/add').send({
                name: 'Test',
                department: 'Test Dept'
            });
            
            const updateRes = await request(app)
                .post(`/update/${createRes.body.id}`)
                .send({
                    name: 'Updated Name',
                    salary: 55000
                });
            
            expect(updateRes.status).toBe(400);
            expect(updateRes.text).toContain('Name and Department are required');
        });
        
        test('should return 404 when updating non-existent employee', async () => {
            const response = await request(app)
                .post('/update/999')
                .send({
                    name: 'Ghost Employee',
                    department: 'Nowhere',
                    salary: 0,
                    mobile: '+1 555-000-9999'
                });
            
            expect(response.status).toBe(404);
            expect(response.body.message).toContain('No employee found');
        });
    });
    
    // ========== DELETE Tests ==========
    describe('POST /delete/:id - Delete Employee', () => {
        
        test('should delete an existing employee', async () => {
            // Create employee
            const createRes = await request(app).post('/add').send({
                name: 'To Be Deleted',
                department: 'Temporary',
                mobile: '+1 555-000-1234'
            });
            
            const employeeId = createRes.body.id;
            
            // Delete employee
            const deleteRes = await request(app).post(`/delete/${employeeId}`);
            
            expect(deleteRes.status).toBe(200);
            expect(deleteRes.body.message).toContain('deleted');
            expect(deleteRes.body.changes).toBe(1);
            
            // Verify deletion
            const getRes = await request(app).get('/');
            expect(getRes.body.employees).toHaveLength(0);
        });
        
        test('should return 404 when deleting non-existent employee', async () => {
            const response = await request(app).post('/delete/999');
            
            expect(response.status).toBe(404);
            expect(response.body.message).toContain('No employee found');
        });
        
        test('should delete correct employee from multiple records', async () => {
            // Create 3 employees
            await request(app).post('/add').send({ name: 'Emp 1', department: 'A', mobile: '+1 555-0101-0101' });
            const emp2 = await request(app).post('/add').send({ name: 'Emp 2', department: 'B', mobile: '+1 555-0202-0202' });
            await request(app).post('/add').send({ name: 'Emp 3', department: 'C', mobile: '+1 555-0303-0303' });
            
            // Delete middle employee
            await request(app).post(`/delete/${emp2.body.id}`);
            
            // Verify only 2 remain
            const getRes = await request(app).get('/');
            expect(getRes.body.employees).toHaveLength(2);
            expect(getRes.body.employees.find(e => e.name === 'Emp 2')).toBeUndefined();
        });
    });
    
    // ========== Integration Tests ==========
    describe('Full CRUD Workflow Integration', () => {
        
        test('should perform complete CRUD cycle', async () => {
            // 1. CREATE
            const createRes = await request(app).post('/add').send({
                name: 'Integration Test User',
                email: 'integration@test.com',
                department: 'QA',
                salary: 70000,
                mobile: '+1 555-777-7777'
            });
            expect(createRes.status).toBe(201);
            const employeeId = createRes.body.id;
            
            // 2. READ
            let getRes = await request(app).get('/');
            expect(getRes.body.employees).toHaveLength(1);
            expect(getRes.body.employees[0].name).toBe('Integration Test User');
            
            // 3. UPDATE
            const updateRes = await request(app)
                .post(`/update/${employeeId}`)
                .send({
                    name: 'Updated Integration User',
                    email: 'updated@test.com',
                    department: 'QA',
                    salary: 75000,
                    mobile: '+1 555-888-8888'
                });
            expect(updateRes.status).toBe(200);
            
            // Verify update
            getRes = await request(app).get('/');
            expect(getRes.body.employees[0].name).toBe('Updated Integration User');
            expect(getRes.body.employees[0].salary).toBe(75000);
            
            // 4. DELETE
            const deleteRes = await request(app).post(`/delete/${employeeId}`);
            expect(deleteRes.status).toBe(200);
            
            // Verify deletion
            getRes = await request(app).get('/');
            expect(getRes.body.employees).toHaveLength(0);
        });
    });
});
