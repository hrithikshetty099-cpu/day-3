/*
  public/script.js
  ----------------
  Beginner-friendly frontend logic. Uses fetch() to call backend endpoints and updates the DOM.

  Beginner notes:
  - The frontend expects the backend APIs under /api (see server.js).
  - Keep element IDs the same if you want the JS to work without changes.
  - This file focuses on clarity over cleverness: simple functions and small helpers.
*/

// A tiny wrapper for calling the backend API endpoints.
// - `path` is appended to /api (for example, api('/students') calls GET /api/students)
// - `opts` lets you pass fetch options like method, headers, body
async function api(path, opts = {}){
  const res = await fetch(`/api${path}` , opts);
  // We expect JSON responses from the server, so parse and return them.
  return res.json();
}

// showMsg: a non-intrusive helper. For beginners it's useful to keep logs visible.
function showMsg(msg){
  console.log(msg);
  // In a real app you might show an on-screen toast. For this demo, console logs are fine.
}

// -------------------- Data loading and rendering -------------------- //

// loadStudents: fetches students from GET /api/students and updates the students list and issue dropdown.
async function loadStudents(){
  const r = await api('/students');
  const container = document.getElementById('students-list');
  const select = document.getElementById('issue-student');
  container.innerHTML = ''; // clear previous list
  select.innerHTML = '';    // clear dropdown

  if (r.success){
    // For each student, create a display row and add an option to the issue select
    r.data.forEach(s => {
      const div = document.createElement('div');
      div.className = 'item';
      // Use escapeHtml to avoid inserting untrusted HTML (basic XSS prevention)
      div.innerHTML = `<div class="meta"><strong>${escapeHtml(s.name)}</strong><br>${escapeHtml(s.department)}${s.phone? ' • '+escapeHtml(s.phone):''}</div>`;
      container.appendChild(div);

      const opt = document.createElement('option');
      opt.value = s.student_id;
      opt.textContent = `${s.name} (${s.department})`;
      select.appendChild(opt);
    });
  } else {
    // Basic error handling: inform the beginner what went wrong
    console.error('Could not load students:', r.message);
  }
}

// loadBooks: fetches books (optionally search) and updates the books list and issue dropdown.
async function loadBooks(query){
  const container = document.getElementById('books-list');
  const select = document.getElementById('issue-book');
  container.innerHTML = '';
  select.innerHTML = '';

  // If query is provided, call the search endpoint; otherwise list all books
  const url = query ? `/books/search?q=${encodeURIComponent(query)}` : '/books';
  const r = await api(url);

  if (r.success){
    r.data.forEach(b => {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `<div class="meta"><strong>${escapeHtml(b.book_name)}</strong><br>${escapeHtml(b.author)} • Qty: ${b.quantity}</div>`;
      container.appendChild(div);

      const opt = document.createElement('option');
      opt.value = b.book_id;
      opt.textContent = `${b.book_name} — ${b.author} (qty ${b.quantity})`;
      select.appendChild(opt);
    });
  } else {
    console.error('Could not load books:', r.message);
  }
}

// loadIssued: fetches current issued records (return_date IS NULL) and shows them with a Return button.
async function loadIssued(){
  const container = document.getElementById('issued-list');
  container.innerHTML = '';
  const r = await api('/issued');

  if (r.success){
    r.data.forEach(ir => {
      const div = document.createElement('div');
      div.className = 'item';
      const issuedOn = ir.issue_date ? ir.issue_date : '';
      div.innerHTML = `<div class="meta"><strong>${escapeHtml(ir.book_name)}</strong> — ${escapeHtml(ir.student_name)}<br>Issued: ${issuedOn}</div>`;

      // Return button: calls PUT /api/return/:issue_id
      const btn = document.createElement('button');
      btn.className = 'small';
      btn.textContent = 'Return';
      btn.onclick = async ()=>{
        if (!confirm('Mark this book as returned?')) return; // basic confirmation for beginners
        const resp = await api(`/return/${ir.issue_id}`, { method: 'PUT' });
        if (resp.success){
          showMsg('Book returned');
          await refreshAll(); // refresh data after returning
        } else {
          alert(resp.message || 'Error');
        }
      };
      div.appendChild(btn);
      container.appendChild(div);
    });
  } else {
    console.error('Could not load issued records:', r.message);
  }
}

// refreshAll: helper to reload students, books and issued lists in parallel
async function refreshAll(){
  await Promise.all([loadStudents(), loadBooks(), loadIssued()]);
}

// -------------------- Form handlers -------------------- //

// Add student form: gathers form data and posts to /api/students
document.getElementById('add-student-form').addEventListener('submit', async function(e){
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = { name: fd.get('name'), department: fd.get('department'), phone: fd.get('phone') };

  // POST request with JSON body
  const r = await api('/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (r.success){
    e.target.reset(); // clear the form on success
    await loadStudents(); // update the student list
  } else {
    alert(r.message || 'Error adding student');
  }
});

// Add book form: posts to /api/books
document.getElementById('add-book-form').addEventListener('submit', async function(e){
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = { book_name: fd.get('book_name'), author: fd.get('author'), quantity: parseInt(fd.get('quantity'), 10) || 0 };

  const r = await api('/books', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (r.success){
    e.target.reset();
    await loadBooks();
  } else {
    alert(r.message || 'Error adding book');
  }
});

// Issue book form: sends student_id and book_id to POST /api/issue
document.getElementById('issue-form').addEventListener('submit', async function(e){
  e.preventDefault();
  const studentId = document.getElementById('issue-student').value;
  const bookId = document.getElementById('issue-book').value;

  const r = await api('/issue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ student_id: studentId, book_id: bookId }) });
  if (r.success){
    showMsg('Book issued');
    await refreshAll();
  } else {
    alert(r.message || 'Error issuing book');
  }
});

// Search button: calls loadBooks with a query so server-side search is used
document.getElementById('search-btn').addEventListener('click', async ()=>{
  const q = document.getElementById('search-q').value.trim();
  await loadBooks(q);
});

// -------------------- Helpers -------------------- //
// Small helper to escape text before inserting into the DOM (very basic XSS protection)
function escapeHtml(text){
  if (text === null || text === undefined) return '';
  return String(text).replace(/[&<>"']/g, function(s){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s];
  });
}

// Initial load: when the page is opened, fetch all data and populate the UI
refreshAll();
