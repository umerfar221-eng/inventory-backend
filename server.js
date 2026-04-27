const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
app.use(cors({
  origin: "*"
}));
app.use(express.json());
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ➕ ADD PRODUCT
app.post("/products", (req, res) => {
  const { name, category, stock, price } = req.body;

  db.query(
    "INSERT INTO products (name, category, stock, price) VALUES (?, ?, ?, ?)",
    [name, category, stock, price],
    (err, result) => {
      if (err) return res.send(err);
      res.send("Product added");
    }
  );
});

// 📥 GET PRODUCTS
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

// ➕ ADD SALE
app.post("/sales", (req, res) => {
  console.log("SALE HIT");

  const { product, quantity, client, paid, pending } = req.body;

  const formattedDate = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  db.query(
    "INSERT INTO sales (product, quantity, client, paid, pending, date) VALUES (?, ?, ?, ?, ?, ?)",
    [product, quantity, client, paid, pending, formattedDate],
    (err, result) => {
      if (err) {
        console.log("DB ERROR:", err);
        return res.send("Error saving sale");
      }

      // ✅ stock update
      db.query(
        "UPDATE products SET stock = stock - ? WHERE name = ?",
        [quantity, product],
        (err) => {
          if (err) {
            console.log("STOCK ERROR:", err);
          } else {
            console.log("STOCK UPDATED");
          }
        }
      );

      console.log("SALE INSERTED");
      res.send("OK");
    }
  );
});
// 📥 GET SALES
app.get("/sales", (req, res) => {
  db.query("SELECT * FROM sales", (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

// ➕ ADD EXPENSE
app.post("/expenses", (req, res) => {
  const { title, amount, date } = req.body;

  db.query(
    "INSERT INTO expenses (title, amount, date) VALUES (?, ?, ?)",
    [title, amount, date],
    (err, result) => {
      if (err) return res.send(err);
      res.send("Expense added");
    }
  );
});

// 📥 GET EXPENSES
app.get("/expenses", (req, res) => {
  db.query("SELECT * FROM expenses", (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

// DELETE PRODUCT
app.delete("/products/:id", (req, res) => {
  db.query("DELETE FROM products WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.send(err);
    res.send("Deleted");
  });
});

// UPDATE STOCK
app.put("/products/:id", (req, res) => {
  const { stock } = req.body;

  db.query(
    "UPDATE products SET stock = ? WHERE id = ?",
    [stock, req.params.id],
    (err) => {
      if (err) return res.send(err);
      res.send("Updated");
    }
  );
});

// DELETE SALE
app.delete("/sales/:id", (req, res) => {
  db.query("DELETE FROM sales WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.send(err);
    res.send("Deleted");
  });
});
app.get("/test-sale", (req, res) => {
  db.query(
    "INSERT INTO sales (product, quantity, client, paid, pending, date) VALUES (?, ?, ?, ?, ?, ?)",
    ["Test Product", 1, "Test Client", 100, 0, new Date().toISOString().slice(0, 19).replace("T", " ")],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.send(err);
      }
      res.send("Test sale inserted");
    }
  );
});

app.get("/force-sale", (req, res) => {
  db.query(
    "INSERT INTO sales (product, quantity, client, paid, pending, date) VALUES (?, ?, ?, ?, ?, ?)",
    ["Check", 1, "Test", 100, 0, "2026-04-24 10:00:00"],
    (err) => {
      if (err) {
        console.log(err);
        return res.send("ERROR");
      }
      res.send("FORCED INSERT DONE");
    }
  );
});

app.get("/hello", (req, res) => {
  res.send("HELLO WORKING");
});

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
}); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
