const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./users.sqlite");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      correo TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const seed = db.prepare(
    "INSERT OR IGNORE INTO users (nombre, apellido, correo) VALUES (?, ?, ?)"
  );
  seed.run("Ada", "Lovelace", "ada@example.com");
  seed.run("Alan", "Turing", "alan@example.com");
  seed.finalize();

  console.log("Base de datos lista: users.sqlite (con datos de ejemplo)");
});

db.close();
