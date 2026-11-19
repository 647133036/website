const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'studio.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK(role IN ('admin','editor','viewer')),
      description TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      group_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(group_id) REFERENCES user_groups(id)
    );

    CREATE TABLE IF NOT EXISTS wireframe_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS wireframe_blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_slug TEXT NOT NULL,
      frame TEXT NOT NULL CHECK(frame IN ('390','1440')),
      section_name TEXT NOT NULL,
      label TEXT DEFAULT '',
      visible INTEGER NOT NULL DEFAULT 1,
      order_idx INTEGER NOT NULL DEFAULT 0,
      props_json TEXT NOT NULL DEFAULT ('{}'),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(page_slug) REFERENCES wireframe_pages(slug)
    );

    CREATE INDEX IF NOT EXISTS idx_blocks_page_frame ON wireframe_blocks(page_slug, frame, order_idx);
  `);
}

migrate();
module.exports = db;
