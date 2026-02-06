const API = "";
const app = document.getElementById("app");
const logoutBtn = document.getElementById("logoutBtn");

function getToken() { return localStorage.getItem("token"); }
function setToken(t) { localStorage.setItem("token", t); }
function clearToken() { localStorage.removeItem("token"); }

function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    clearToken();
    location.hash = "#/login";
    return Promise.reject(new Error("Unauthorized"));
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

function layoutAuthVisibility() {
  const loggedIn = !!getToken();
  document.getElementById("navNotes").style.display = loggedIn ? "inline" : "none";
  document.getElementById("navCategories").style.display = loggedIn ? "inline" : "none";
  logoutBtn.style.display = loggedIn ? "inline-flex" : "none";
}

logoutBtn.onclick = () => {
  clearToken();
  location.hash = "#/login";
};

function route() {
  layoutAuthVisibility();
  const h = location.hash || "";
  const loggedIn = !!getToken();

  if (!loggedIn && h !== "#/login" && h !== "#/register") {
    location.hash = "#/login";
    return;
  }

  if (loggedIn && (h === "" || h === "#/" || h === "#/login" || h === "#/register")) {
    location.hash = "#/notes";
    return;
  }

  if (h === "#/login") return renderLogin();
  if (h === "#/register") return renderRegister();
  if (h === "#/notes") return renderNotes();
  if (h === "#/categories") return renderCategories();

  location.hash = loggedIn ? "#/notes" : "#/login";
}

function renderLogin() {
  app.innerHTML = `
    <div class="card">
      <h2>Login</h2>
      <form id="loginForm" class="form">
        <input name="email" placeholder="Email" required />
        <input name="password" placeholder="Password" type="password" required />
        <button class="btn">Login</button>
      </form>
      <p class="muted">No account? <a href="#/register">Register</a></p>
      <div id="err" class="err"></div>
    </div>
  `;

  document.getElementById("loginForm").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    try {
      const data = await api("/auth/login", { method: "POST", body: JSON.stringify(body) });
      setToken(data.token);
      location.hash = "#/notes";
    } catch (err) {
      document.getElementById("err").textContent = err.message;
    }
  };
}

function renderRegister() {
  app.innerHTML = `
    <div class="card">
      <h2>Register</h2>
      <form id="regForm" class="form">
        <input name="name" placeholder="Name" required />
        <input name="email" placeholder="Email" required />
        <input name="password" placeholder="Password" type="password" required />
        <button class="btn">Create account</button>
      </form>
      <p class="muted">Have account? <a href="#/login">Login</a></p>
      <div id="err" class="err"></div>
    </div>
  `;

  document.getElementById("regForm").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    try {
      await api("/auth/register", { method: "POST", body: JSON.stringify(body) });
      location.hash = "#/login";
    } catch (err) {
      document.getElementById("err").textContent = err.message;
    }
  };
}

async function renderNotes() {
  app.innerHTML = `
    <div class="grid">
      <div class="card">
        <h2>Notes</h2>
        <div class="row">
          <input id="q" placeholder="Search..." />
          <select id="categoryFilter"></select>
          <button id="refresh" class="btn ghost">Refresh</button>
        </div>
        <div id="list" class="list"></div>
      </div>

      <div class="card">
        <h2 id="formTitle">New note</h2>
        <form id="noteForm" class="form">
          <input name="title" placeholder="Title" required />
          <textarea name="content" placeholder="Content" rows="6" required></textarea>
          <select name="category" id="noteCategory" required></select>
          <button class="btn" id="saveBtn">Save</button>
          <button type="button" class="btn ghost" id="cancelEdit" style="display:none;">Cancel</button>
        </form>
        <div id="err" class="err"></div>
      </div>
    </div>
  `;

  let editingId = null;

  const qEl = document.getElementById("q");
  const listEl = document.getElementById("list");
  const catFilterEl = document.getElementById("categoryFilter");
  const noteCatEl = document.getElementById("noteCategory");
  const errEl = document.getElementById("err");
  const formTitleEl = document.getElementById("formTitle");
  const cancelEditBtn = document.getElementById("cancelEdit");

  async function loadCategories() {
    const cats = await api("/categories");
    catFilterEl.innerHTML = `<option value="">All categories</option>` + cats.map(c => `<option value="${c._id}">${c.name}</option>`).join("");
    noteCatEl.innerHTML = cats.map(c => `<option value="${c._id}">${c.name}</option>`).join("");
  }

  async function loadNotes() {
    const params = new URLSearchParams();
    if (qEl.value.trim()) params.set("q", qEl.value.trim());
    if (catFilterEl.value) params.set("category", catFilterEl.value);

    const notes = await api("/notes" + (params.toString() ? `?${params}` : ""));
    listEl.innerHTML = notes.map(n => `
      <div class="item">
        <div class="itemHead">
          <div>
            <div class="itemTitle">${escapeHtml(n.title)}</div>
            <div class="muted small">${n.category?.name || "No category"}</div>
          </div>
          <div class="actions">
            <button class="btn xs ghost" data-edit="${n._id}">Edit</button>
            <button class="btn xs danger" data-del="${n._id}">Delete</button>
          </div>
        </div>
        <div class="itemBody">${escapeHtml(n.content)}</div>
      </div>
    `).join("");

    listEl.querySelectorAll("[data-edit]").forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute("data-edit");
        const note = await api(`/notes/${id}`);
        editingId = id;

        document.querySelector("#noteForm [name=title]").value = note.title;
        document.querySelector("#noteForm [name=content]").value = note.content;
        noteCatEl.value = note.category?._id || note.category;

        formTitleEl.textContent = "Edit note";
        cancelEditBtn.style.display = "inline-flex";
      };
    });

    listEl.querySelectorAll("[data-del]").forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute("data-del");
        if (!confirm("Delete this note?")) return;
        await api(`/notes/${id}`, { method: "DELETE" });
        await loadNotes();
      };
    });
  }

  document.getElementById("refresh").onclick = loadNotes;
  qEl.oninput = debounce(loadNotes, 300);
  catFilterEl.onchange = loadNotes;

  cancelEditBtn.onclick = () => {
    editingId = null;
    document.getElementById("noteForm").reset();
    formTitleEl.textContent = "New note";
    cancelEditBtn.style.display = "none";
  };

  document.getElementById("noteForm").onsubmit = async (e) => {
    e.preventDefault();
    errEl.textContent = "";

    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());

    try {
      if (editingId) {
        await api(`/notes/${editingId}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await api("/notes", { method: "POST", body: JSON.stringify(body) });
      }
      cancelEditBtn.onclick();
      await loadNotes();
    } catch (err) {
      errEl.textContent = err.message;
    }
  };

  await loadCategories();
  await loadNotes();
}

async function renderCategories() {
  app.innerHTML = `
    <div class="card">
      <h2>Categories</h2>
      <form id="catForm" class="row">
        <input name="name" placeholder="New category name" required />
        <button class="btn">Add</button>
      </form>
      <div id="err" class="err"></div>
      <div id="list" class="list"></div>
    </div>
  `;

  const errEl = document.getElementById("err");
  const listEl = document.getElementById("list");

  async function load() {
    const cats = await api("/categories");
    listEl.innerHTML = cats.map(c => `
      <div class="item">
        <div class="itemHead">
          <div class="itemTitle">${escapeHtml(c.name)}</div>
          <div class="actions">
            <button class="btn xs ghost" data-ren="${c._id}">Rename</button>
            <button class="btn xs danger" data-del="${c._id}">Delete</button>
          </div>
        </div>
      </div>
    `).join("");

    listEl.querySelectorAll("[data-del]").forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute("data-del");
        if (!confirm("Delete this category?")) return;
        await api(`/categories/${id}`, { method: "DELETE" });
        await load();
      };
    });

    listEl.querySelectorAll("[data-ren]").forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute("data-ren");
        const name = prompt("New name:");
        if (!name) return;
        await api(`/categories/${id}`, { method: "PUT", body: JSON.stringify({ name }) });
        await load();
      };
    });
  }

  document.getElementById("catForm").onsubmit = async (e) => {
    e.preventDefault();
    errEl.textContent = "";
    const fd = new FormData(e.target);
    try {
      await api("/categories", { method: "POST", body: JSON.stringify({ name: fd.get("name") }) });
      e.target.reset();
      await load();
    } catch (err) {
      errEl.textContent = err.message;
    }
  };

  await load();
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.addEventListener("hashchange", route);
route();