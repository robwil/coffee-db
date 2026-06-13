import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dir = dirname(__filename);

const DB_PATH = join(__dir, '..', '..', '..', 'data', 'coffee.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
	if (_db) return _db;

	_db = new Database(DB_PATH);
	_db.pragma('journal_mode = WAL');
	_db.pragma('foreign_keys = ON');

	const schema = readFileSync(join(__dir, 'schema.sql'), 'utf-8');
	_db.exec(schema);

	return _db;
}

export function seedDb(): void {
	const db = getDb();
	const seed = readFileSync(join(__dir, 'seed.sql'), 'utf-8');
	db.exec(seed);
}
