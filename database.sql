-- database.sql
-- Creates a library database with students, books and issue_return tables
-- Run as: mysql -u root -p < database.sql

CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- Students table
CREATE TABLE IF NOT EXISTS students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  phone VARCHAR(20)
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  book_id INT AUTO_INCREMENT PRIMARY KEY,
  book_name VARCHAR(200) NOT NULL,
  author VARCHAR(100) NOT NULL,
  quantity INT NOT NULL DEFAULT 0
);

-- Issue / Return table
CREATE TABLE IF NOT EXISTS issue_return (
  issue_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  book_id INT NOT NULL,
  issue_date DATE NOT NULL,
  return_date DATE DEFAULT NULL,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
);

-- Sample data
INSERT INTO students (name, department, phone) VALUES
  ('Alice Johnson', 'Computer Science', '555-0101'),
  ('Bob Smith', 'Mechanical', '555-0102'),
  ('Carol Lee', 'Electronics', '555-0103');

INSERT INTO books (book_name, author, quantity) VALUES
  ('Introduction to Algorithms', 'Cormen, Leiserson, Rivest', 3),
  ('Clean Code', 'Robert C. Martin', 2),
  ('Operating System Concepts', 'Silberschatz', 1);

-- Sample issued record: Alice borrowed 'Clean Code' (book_id = 2)
INSERT INTO issue_return (student_id, book_id, issue_date, return_date) VALUES
  (1, 2, CURDATE(), NULL);

-- Decrement the quantity for the sample issued book so counts match
UPDATE books SET quantity = quantity - 1 WHERE book_id = 2;
