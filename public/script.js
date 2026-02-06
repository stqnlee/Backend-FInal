// const notesList = document.getElementById('notesList');
// // auth
// const emailEl = document.getElementById('email');
// const passwordEl = document.getElementById('password');
// const btnRegister = document.getElementById('btnRegister');
// const btnLogin = document.getElementById('btnLogin');
// const btnLogout = document.getElementById('btnLogout');
// const authStatus = document.getElementById('authStatus');
// // categ
// const categoryNameEl = document.getElementById('categoryName');
// const btnAddCategory = document.getElementById('btnAddCategory');
// const categorySelect = document.getElementById('categorySelect');
// categorySelect.addEventListener('change', () => {
//   loadNotes();
// });
// // filter
// const searchInput = document.getElementById('search');
// const filterPriority = document.getElementById('filterPriority');
// const filterStatus = document.getElementById('filterStatus');
// const sortSelect = document.getElementById('sort');
// const applyFiltersBtn = document.getElementById('applyFilters');
// const resetFiltersBtn = document.getElementById('resetFilters');
// // note form
// const form = document.getElementById('noteForm');
// const titleEl = document.getElementById('title');
// const contentEl = document.getElementById('content');
// const priorityEl = document.getElementById('priority');
// const dueDateEl = document.getElementById('dueDate');
// const tagsEl = document.getElementById('tags');
// const submitBtn = document.getElementById('submitBtn');
// const cancelEditBtn = document.getElementById('cancelEdit');
// const formTitle = document.getElementById('formTitle');

// let editingId = null;
// let editingCategoryId = '';

// function getToken() {
//   return localStorage.getItem('token') || '';
// }
// function setToken(token) {
//   localStorage.setItem('token', token);
// }
// function clearToken() {
//   localStorage.removeItem('token');
// }

// function authHeaders() {
//   const token = getToken();
//   return token ? { Authorization: `Bearer ${token}` } : {};
// }

// function setStatus(text) {
//   authStatus.textContent = text;
// }

// btnRegister.addEventListener('click', async () => {
//   const email = emailEl.value.trim();
//   const password = passwordEl.value.trim();

//   if (!email || !password) return alert('Enter email and password');

//   const res = await fetch('/auth/register', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email, password })
//   });

//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) return alert(data.message || 'Register failed');

//   setToken(data.token);
//   setStatus(`Logged in as ${data.user.email} (${data.user.role})`);
//   await loadCategories();
//   loadNotes();
// });

// btnLogin.addEventListener('click', async () => {
//   const email = emailEl.value.trim();
//   const password = passwordEl.value.trim();

//   if (!email || !password) return alert('Enter email and password');

//   const res = await fetch('/auth/login', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email, password })
//   });

//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) return alert(data.message || 'Login failed');

//   setToken(data.token);
//   setStatus(`Logged in as ${data.user.email} (${data.user.role})`);
//   await loadCategories();
//   loadNotes();
// });

// btnLogout.addEventListener('click', () => {
//   clearToken();
//   setStatus('Not logged in');
//   loadNotes();
// });

// async function loadCategories() {
//   const res = await fetch('/categories');
//   const categories = await res.json().catch(() => []);

//   categorySelect.innerHTML = '';
//   if (!Array.isArray(categories) || categories.length === 0) {
//     const opt = document.createElement('option');
//     opt.value = '';
//     opt.textContent = 'No categories';
//     categorySelect.appendChild(opt);
//     return;
//   }

//   categories.forEach((c) => {
//     const opt = document.createElement('option');
//     opt.value = c._id;
//     opt.textContent = c.name;
//     categorySelect.appendChild(opt);
//   });
// }

// async function loadCategories() {
//   try {
//     const previouslySelected = categorySelect.value; 

//     const res = await fetch('/categories');
//     if (!res.ok) {
//       const text = await res.text().catch(() => '');
//       throw new Error(`GET /categories failed: ${res.status} ${text.slice(0, 120)}`);
//     }

//     const categories = await res.json().catch(() => []);

//     categorySelect.innerHTML = '';
//     const allOpt = document.createElement('option');
//     allOpt.value = '';
//     allOpt.textContent = 'All categories';
//     categorySelect.appendChild(allOpt);
//     if (!Array.isArray(categories) || categories.length === 0) {
//       categorySelect.value = ''; 
//       return;
//     }
//     categories.forEach((c) => {
//       const opt = document.createElement('option');
//       opt.value = c._id;
//       opt.textContent = c.name;
//       categorySelect.appendChild(opt);
//     });
//     const stillExists = categories.some((c) => c._id === previouslySelected);

//     if (previouslySelected === '') {
//       categorySelect.value = '';
//     } else if (stillExists) {
//       categorySelect.value = previouslySelected;
//     } else {

//       categorySelect.value = '';
//     }
//   } catch (err) {
//     console.error('loadCategories error:', err);
//     alert(err.message);
//   }
// }

// btnAddCategory.addEventListener('click', async () => {
//   const name = categoryNameEl.value.trim();
//   if (!name) return alert('Enter category name');

//   const res = await fetch('/categories', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json', ...authHeaders() },
//     body: JSON.stringify({ name })
//   });

//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) return alert(data.message || 'Add category failed (admin only)');

//   categoryNameEl.value = '';
//   await loadCategories();
// });

// function buildQueryParams() {
//   const params = new URLSearchParams();

//   const search = searchInput.value.trim();
//   const pr = filterPriority.value;
//   const st = filterStatus.value || 'all';
//   const sort = sortSelect.value || 'newest';

//   if (search) params.set('search', search);
//   if (pr) params.set('priority', pr);
//   if (st) params.set('status', st);
//   if (sort) params.set('sort', sort);

//   const catId = categorySelect.value;
//   if (catId) params.set('categoryId', catId);

//   return params.toString();
// }

// applyFiltersBtn.addEventListener('click', loadNotes);

// resetFiltersBtn.addEventListener('click', () => {
//   searchInput.value = '';
//   filterPriority.value = '';
//   filterStatus.value = 'all';
//   sortSelect.value = 'newest';
//   loadNotes();
// });

// function escapeHtml(str) {
//   return String(str ?? '')
//     .replaceAll('&', '&amp;')
//     .replaceAll('<', '&lt;')
//     .replaceAll('>', '&gt;')
//     .replaceAll('"', '&quot;')
//     .replaceAll("'", '&#039;');
// }

// function parseTags(tagsRaw) {
//   if (!tagsRaw) return [];
//   return tagsRaw
//     .split(',')
//     .map((t) => t.trim().toLowerCase())
//     .filter(Boolean)
//     .slice(0, 20);
// }

// function resetFormToAdd() {
//   editingId = null;
//   editingCategoryId = '';
//   formTitle.textContent = 'Add Note';
//   submitBtn.textContent = 'Add Note';
//   cancelEditBtn.classList.add('hidden');
//   form.reset();
//   priorityEl.value = 'medium';
// }

// async function loadNotes() {
//   try {
//     const qs = buildQueryParams();
//     const url = qs ? `/notes?${qs}` : '/notes';

//     const res = await fetch(url);
//     if (!res.ok) {
//       const text = await res.text().catch(() => '');
//       throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`);
//     }

//     const notes = await res.json();

//     notesList.innerHTML = '';

//     if (!Array.isArray(notes) || notes.length === 0) {
//       const empty = document.createElement('div');
//       empty.className = 'empty';
//       empty.textContent = 'No notes found.';
//       notesList.appendChild(empty);
//       return;
//     }

//     notes.forEach((note) => {
//       const li = document.createElement('li');
//       li.className = note.isDone ? 'done' : '';

//       const created = note.createdAt ? new Date(note.createdAt).toLocaleString() : '—';
//       const due = note.dueDate ? new Date(note.dueDate).toLocaleDateString() : '—';

//       const tags = Array.isArray(note.tags) && note.tags.length > 0
//         ? note.tags.map(t => `#${t}`).join(' ')
//         : '';

//       const categoryName = note.category?.name || '—';

//       li.innerHTML = `
//         <div class="note-text">
//           <div class="top-line">
//             <strong>${escapeHtml(note.title)}</strong>
//             <span class="badge ${escapeHtml(note.priority)}">${escapeHtml(note.priority)}</span>
//           </div>

//           <p>${escapeHtml(note.content)}</p>

//           <div class="meta">
//             <em>Created: ${created}</em>
//             <em>Due: ${due}</em>
//             <em>Category: ${escapeHtml(categoryName)}</em>
//           </div>

//           <div class="tags">${escapeHtml(tags)}</div>
//         </div>

//         <div class="actions">
//           <button class="btn-done" onclick="toggleDone('${note._id}')">
//             ${note.isDone ? 'Undo' : 'Done'}
//           </button>
//           <button class="btn-edit" onclick="startEdit('${note._id}')">Edit</button>
//           <button class="btn-delete" onclick="deleteNote('${note._id}')">Delete</button>
//         </div>
//       `;

//       notesList.appendChild(li);
//     });
//   } catch (err) {
//     console.error(err);
//     notesList.innerHTML = `<div class="empty">Failed to load notes.<br><small>${escapeHtml(err.message)}</small></div>`;
//   }
// }

// form.addEventListener('submit', async (e) => {
//   e.preventDefault();

//   const categoryId = (editingId && categorySelect.value === '')
//     ? editingCategoryId
//     : categorySelect.value;

//   if (!categoryId) return alert('Create/select a category first');

//   const payload = {
//     title: titleEl.value.trim(),
//     content: contentEl.value.trim(),
//     priority: priorityEl.value,
//     dueDate: dueDateEl.value ? dueDateEl.value : null,
//     tags: parseTags(tagsEl.value.trim()),
//     categoryId
//   };

//   if (!payload.title || !payload.content) return alert('Title and content are required');

//   const url = editingId ? `/notes/${editingId}` : '/notes';
//   const method = editingId ? 'PUT' : 'POST';

//   const res = await fetch(url, {
//     method,
//     headers: { 'Content-Type': 'application/json', ...authHeaders() },
//     body: JSON.stringify(payload)
//   });

//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) return alert(data.message || 'Action failed (admin only)');

//   resetFormToAdd();
//   loadNotes();
// });

// cancelEditBtn.addEventListener('click', resetFormToAdd);

// window.startEdit = async function (id) {
//   const res = await fetch(`/notes/${id}`);
//   const note = await res.json().catch(() => null);
//   if (!note) return alert('Failed to load note');

//   editingId = id;
//   formTitle.textContent = 'Edit Note';
//   submitBtn.textContent = 'Save Changes';
//   cancelEditBtn.classList.remove('hidden');

//   titleEl.value = note.title || '';
//   contentEl.value = note.content || '';
//   priorityEl.value = note.priority || 'medium';
//   dueDateEl.value = note.dueDate ? note.dueDate.slice(0, 10) : '';
//   tagsEl.value = Array.isArray(note.tags) ? note.tags.join(', ') : '';

//   editingCategoryId = note.category?._id || '';
//   if (categorySelect.value !== '') {
//     if (editingCategoryId) categorySelect.value = editingCategoryId;
// }

//   window.scrollTo({ top: 0, behavior: 'smooth' });
// };

// window.toggleDone = async function (id) {
//   const res = await fetch(`/notes/${id}/toggle`, {
//     method: 'PATCH',
//     headers: { ...authHeaders() }
//   });

//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) return alert(data.message || 'Toggle failed (admin only)');

//   loadNotes();
// };

// window.deleteNote = async function (id) {
//   const res = await fetch(`/notes/${id}`, {
//     method: 'DELETE',
//     headers: { ...authHeaders() }
//   });

//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) return alert(data.message || 'Delete failed (admin only)');

//   loadNotes();
// };

// (async function init() {
//   const token = getToken();ß
//   if (token) setStatus('Token found (try actions). If expired, login again.');
//   else setStatus('Not logged in');

//   await loadCategories();
//   loadNotes();
// })();