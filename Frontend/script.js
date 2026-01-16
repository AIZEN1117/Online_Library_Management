// Set this to your deployed backend URL (Render/Heroku/Railway)
const API_BASE = "https://your-backend-url.example.com";

const booksBody = document.getElementById("booksBody");
const searchInput = document.getElementById("searchInput");
const refreshBtn = document.getElementById("refreshBtn");
const addBookForm = document.getElementById("addBookForm");

let booksCache = [];

function renderBooks(books) {
  booksBody.innerHTML = "";
  books.forEach((b, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${b.title}</td>
      <td>${b.author}</td>
      <td>
        <span class="badge ${b.available ? "available" : "unavailable"}">
          ${b.available ? "Available" : "Borrowed"}
        </span>
      </td>
      <td>
        <div class="actions">
          ${b.available
            ? `<button class="btn borrow" data-id="${b.id}">Borrow</button>`
            : `<button class="btn return" data-id="${b.id}">Return</button>`
          }
          <button class="btn delete" data-id="${b.id}">Delete</button>
        </div>
      </td>
    `;
    booksBody.appendChild(tr);
  });
}

async function fetchBooks() {
  try {
    const res = await fetch(`${API_BASE}/books`);
    const data = await res.json();
    booksCache = data;
    renderBooks(data);
  } catch (err) {
    console.error("Failed to fetch books:", err);
    alert("Unable to load books. Check backend URL.");
  }
}

async function addBook(title, author) {
  try {
    const res = await fetch(`${API_BASE}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author })
    });
    if (!res.ok) throw new Error("Failed to add book");
    await fetchBooks();
  } catch (err) {
    alert(err.message);
  }
}

async function borrowBook(id) {
  try {
    const res = await fetch(`${API_BASE}/books/${id}/borrow`, { method: "PUT" });
    if (!res.ok) throw new Error("Failed to borrow");
    await fetchBooks();
  } catch (err) {
    alert(err.message);
  }
}

async function returnBook(id) {
  try {
    const res = await fetch(`${API_BASE}/books/${id}/return`, { method: "PUT" });
    if (!res.ok) throw new Error("Failed to return");
    await fetchBooks();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteBook(id) {
  try {
    const res = await fetch(`${API_BASE}/books/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete");
    await fetchBooks();
  } catch (err) {
    alert(err.message);
  }
}

booksBody.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  if (!id) return;
  if (e.target.classList.contains("borrow")) borrowBook(id);
  if (e.target.classList.contains("return")) returnBook(id);
  if (e.target.classList.contains("delete")) deleteBook(id);
});

addBookForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  if (!title || !author) return alert("Please fill all fields.");
  addBook(title, author);
  addBookForm.reset();
});

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  const filtered = booksCache.filter(
    b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
  );
  renderBooks(filtered);
});

refreshBtn.addEventListener("click", fetchBooks);

// Initial load
fetchBooks();
