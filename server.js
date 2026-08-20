

const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Database configuration - prefers environment variables but provides sensible defaults
// connectionLimit controls the maximum number of active connections in the pool.
// For a small demo app, 10 is a reasonable default. Adjust via DB_CONNECTION_LIMIT env var if needed.
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'library_db',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10, // default 10
  queueLimit: 0
};

// Use a connection pool and the promise wrapper for easier async/await code
const pool = mysql.createPool(DB_CONFIG).promise();

// Helper for consistent JSON error responses
function errorRes(res, status, message) {
  return res.status(status).json({ success: false, message });
}

// GET /api/students - list all students
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY student_id');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    errorRes(res, 500, 'Database error while fetching students');
  }
});

// POST /api/students - add a student
app.post('/api/students', async (req, res) => {
  const { name, department, phone } = req.body;
  if (!name || !department) return errorRes(res, 400, 'name and department are required');
  try {
    const [result] = await pool.query('INSERT INTO students (name, department, phone) VALUES (?, ?, ?)', [name, department, phone || null]);
    res.json({ success: true, insertedId: result.insertId });
  } catch (err) {
    console.error(err);
    errorRes(res, 500, 'Database error while adding student');
  }
});

// GET /api/books - list all books
app.get('/api/books', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books ORDER BY book_id');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    errorRes(res, 500, 'Database error while fetching books');
  }
});

// POST /api/books - add a book
app.post('/api/books', async (req, res) => {
  const { book_name, author, quantity } = req.body;
  if (!book_name || !author) return errorRes(res, 400, 'book_name and author are required');
  const qty = parseInt(quantity, 10) || 0;
  try {
    const [result] = await pool.query('INSERT INTO books (book_name, author, quantity) VALUES (?, ?, ?)', [book_name, author, qty]);
    res.json({ success: true, insertedId: result.insertId });
  } catch (err) {
    console.error(err);
    errorRes(res, 500, 'Database error while adding book');
  }
});

// GET /api/books/search?q=... - search books by name or author (case-insensitive partial match)
app.get('/api/books/search', async (req, res) => {
  const q = req.query.q || '';
  try {
    const like = `%${q}%`;
    const [rows] = await pool.query('SELECT * FROM books WHERE book_name LIKE ? OR author LIKE ? ORDER BY book_id', [like, like]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    errorRes(res, 500, 'Database error while searching books');
  }
});

// POST /api/issue - issue a book to a student
// body: { student_id, book_id }
app.post('/api/issue', async (req, res) => {
  const { student_id, book_id } = req.body;
  if (!student_id || !book_id) return errorRes(res, 400, 'student_id and book_id are required');
  try {
    // Check book quantity
    const [[book]] = await pool.query('SELECT * FROM books WHERE book_id = ?', [book_id]);
    if (!book) return errorRes(res, 404, 'Book not found');
    if (book.quantity <= 0) return errorRes(res, 400, 'Book not available (quantity is 0)');

    // Insert issue record (issue_date = today), return_date is NULL
    const [insertResult] = await pool.query('INSERT INTO issue_return (student_id, book_id, issue_date) VALUES (?, ?, CURDATE())', [student_id, book_id]);

    // Decrement book quantity
    await pool.query('UPDATE books SET quantity = quantity - 1 WHERE book_id = ?', [book_id]);

    res.json({ success: true, issue_id: insertResult.insertId });
  } catch (err) {
    console.error(err);
    errorRes(res, 500, 'Database error while issuing book');
  }
});

// PUT /api/return/:issue_id - return a book (sets return_date and increments book quantity)
app.put('/api/return/:issue_id', async (req, res) => {
  const issue_id = req.params.issue_id;
  try {
    // Find the issue record
    const [[ir]] = await pool.query('SELECT * FROM issue_return WHERE issue_id = ?', [issue_id]);
    if (!ir) return errorRes(res, 404, 'Issue record not found');
    if (ir.return_date) return errorRes(res, 400, 'Book already returned');

    // Set return_date to today
    await pool.query('UPDATE issue_return SET return_date = CURDATE() WHERE issue_id = ?', [issue_id]);

    // Increment book quantity
    await pool.query('UPDATE books SET quantity = quantity + 1 WHERE book_id = ?', [ir.book_id]);

    res.json({ success: true, message: 'Book returned' });
  } catch (err) {
    console.error(err);
    errorRes(res, 500, 'Database error while returning book');
  }
});

// GET /api/issued - list currently issued books (those with return_date IS NULL)
app.get('/api/issued', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ir.issue_id, ir.student_id, s.name AS student_name, ir.book_id, b.book_name, ir.issue_date, ir.return_date
       FROM issue_return ir
       JOIN students s ON ir.student_id = s.student_id
       JOIN books b ON ir.book_id = b.book_id
       WHERE ir.return_date IS NULL
       ORDER BY ir.issue_id`);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    errorRes(res, 500, 'Database error while fetching issued books');
  }
});

// Basic health check
app.get('/api/ping', (req, res) => res.json({ success: true, message: 'pong' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
