import sqlite3

class DatabaseManager:
    def __init__(self, db_path="database.db"):
        self.db_path = db_path
        self.connection = None

    def connect(self):
        self.connection = sqlite3.connect(
            self.db_path,
            check_same_thread=False  # ✅ Permet l'accès depuis plusieurs threads
        )
        self.connection.create_function("REGEXP", 2, regexp)

    def create_tables(self):
        if self.connection is None:
            self.connect()
        assert self.connection is not None  # Pour rassurer Pylance
        cursor = self.connection.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                language TEXT NOT NULL,
                content TEXT NOT NULL,
                parent_id INTEGER,
                entry_type TEXT NOT NULL,
                FOREIGN KEY(parent_id) REFERENCES entries(id)
            )
        ''')
        self.connection.commit()

    def search_entries(self, regex, language = "fr"):
        if self.connection is None:
            self.connect()
        assert self.connection is not None  # Pour rassurer Pylance
        cursor = self.connection.cursor()
        query = "SELECT id, content, parent_id, entry_type FROM entries WHERE content REGEXP ?"
        params = [regex]
        if language:
            query += " AND language = ?"
            params.append(language)
        cursor.execute(query, params)
        return cursor.fetchall()

    def insert_entry(self, language, content, parent_id=None, entry_type="paragraph"):
        if self.connection is None:
            self.connect()
        assert self.connection is not None  # Pour rassurer Pylance
        cursor = self.connection.cursor()
        cursor.execute('''
            INSERT INTO entries (language, content, parent_id, entry_type)
            VALUES (?, ?, ?, ?)
        ''', (language, content, parent_id, entry_type))
        self.connection.commit()

    def close(self):
        if self.connection:
            self.connection.close()
            self.connection = None

# To enable REGEXP in SQLite
import re

def regexp(expr, item):
    reg = re.compile(expr)
    return reg.search(item) is not None

sqlite3.enable_callback_tracebacks(True)
