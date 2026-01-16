import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_PATH = path.join(__dirname, "data", "books.json");

app.use(cors());
app.use(express.json());

// Utility: read/write JSON
function readBooks() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}
function writeBooks(books) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(books, null, 2), "utf-8");
}

// Health
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "Online Library Backend" });
});

// Get all books
app.get("/books", (req, res) => {
  try {
    const books = readBooks();
    res.json(books);
  } catch (e) {
    res.status(500).json({ error: "Failed to read books" });
  }
});

// Add a new book
app.post("/books", (req, res) => {
  try {
    const { title, author } = req.body;
    if (!title || !author) return res.status(400).json({ error: "Missing fields" });

    const books = readBooks();
    const newBook = {
      id: books.length ? Math.max(...books.map(b => b.id)) + 1 : 1,
      title,
      author,
      available: true
    };
    books.push(newBook);
    writeBooks(books);
    res.status(201).json(newBook);
  } catch (e) {
    res.status(500).json({ error: "Failed to add book" });
  }
});

// Borrow a book
app.put("/books/:id/borrow", (req, res) => {
  try {
    const id = Number(req.params.id);
    const books = readBooks();
    const book = books.find(b => b.id === id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    if (!book.available) return res.status(400).json({ error: "Book already borrowed" });

    book.available = false;
    writeBooks(books);
    res.json({ message: "Book borrowed", book });
  } catch (e) {
    res.status(500).json({ error: "Failed to borrow book" });
  }
});

// Return a book
app.put("/books/:id/return", (req, res) => {
  try {
    const id = Number(req.params.id);
    const books = readBooks();
    const book = books.find(b => b.id === id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    if (book.available) return res.status(400).json({ error: "Book is not borrowed" });

    book.available = true;
    writeBooks(books);
    res.json({ message: "Book returned", book });
  } catch (e) {
    res.status(500).json({ error: "Failed to return book" });
  }
});

// Delete a book
app.delete("/books/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const books = readBooks();
    const idx = books.findIndex(b => b.id === id);
    if (idx === -1) return res.status(404).json({ error: "Book not found" });

    const [removed] = books.splice(idx, 1);
    writeBooks(books);
    res.json({ message: "Book deleted", book: removed });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete book" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
