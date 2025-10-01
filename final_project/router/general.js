const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Prefer provided isValid(); fallback to a local check if it's not implemented yet
  const usernameTaken = (typeof isValid === 'function')
    ? !isValid(username) // by our earlier implementation: isValid === "not taken"
    : users.some(u => u.username === username);

  if (usernameTaken) {
    return res.status(409).json({ message: 'Username already exists or is invalid' });
  }

  users.push({ username, password });
  return res.status(201).json({ message: 'User registered successfully' });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
   return res.status(200).json(books);
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(books, null, 2)); 
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const { isbn } = req.params;
    const book = books[isbn];
    if (!book) return res.status(404).json({ message: 'Book not found' });
    return res.status(200).json({ id: isbn, ...book });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const q = (req.params.author || '').toLowerCase();
  const matches = Object.entries(books)
    .filter(([, b]) => (b.author || '').toLowerCase().includes(q))
    .map(([id, b]) => ({ id, ...b }));

  if (matches.length === 0) return res.status(404).json({ message: 'No books found for that author' });
  return res.status(200).json(matches);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const q = (req.params.title || '').toLowerCase();
  const matches = Object.entries(books)
    .filter(([, b]) => (b.title || '').toLowerCase().includes(q))
    .map(([id, b]) => ({ id, ...b }));

  if (matches.length === 0) return res.status(404).json({ message: 'No books found with that title' });
  return res.status(200).json(matches);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  return res.status(200).json({ id: isbn, title: book.title, reviews: book.reviews || {} });
});

module.exports.general = public_users;
