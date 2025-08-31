const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3000;
const db = new sqlite3.Database("./users.sqlite");

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// utilidades simples de validación
const isNonEmpty = (s) => typeof s === "string" && s.trim().length > 0;
const isEmail = (s) =>
  typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// Healthcheck
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "api-users", time: new Date().toISOString() });
});

// GET /users -> lista todos
app.get("/users", (_req, res) => {
  db.all(
    "SELECT id, nombre, apellido, correo, created_at FROM users ORDER BY id DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// POST /users -> crea uno
app.post("/users", (req, res) => {
  const { nombre, apellido, correo } = req.body || {};

  if (!isNonEmpty(nombre) || !isNonEmpty(apellido) || !isEmail(correo)) {
    return res.status(400).json({
      error:
        "Campos inválidos. Requiere: nombre (string), apellido (string), correo (email válido)",
    });
  }

  db.run(
    "INSERT INTO users (nombre, apellido, correo) VALUES (?, ?, ?)",
    [nombre.trim(), apellido.trim(), correo.trim().toLowerCase()],
    function (err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
          return res.status(409).json({ error: "El correo ya existe" });
        }
        return res.status(500).json({ error: err.message });
      }
      db.get(
        "SELECT id, nombre, apellido, correo, created_at FROM users WHERE id = ?",
        [this.lastID],
        (e, row) => {
          if (e) return res.status(500).json({ error: e.message });
          res.status(201).json(row);
        }
      );
    }
  );
});

// escuchar en 0.0.0.0 para AWS/Cloud
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API escuchando en http://0.0.0.0:${PORT}`);
});
