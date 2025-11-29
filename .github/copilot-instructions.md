# Copilot Instructions for SpadaLibreria

## Project Overview

SpadaLibreria ("Sword Library") is an AMHE (Arts Martiaux Historiques Européens / Historical European Martial Arts) library application. It provides tools for extracting, storing, and searching historical fencing texts from PDF documents.

## Technology Stack

- **Python 3.13**
- **FastAPI** with **uvicorn** for the web API
- **SQLite** for database storage
- **PyQt5** for the desktop GUI application
- **pdfplumber** for PDF text extraction
- HTML, CSS, and JavaScript for the web frontend

## Project Structure

```
.
├── .devcontainer/         # Dev container configuration
├── .github/               # GitHub configuration and Copilot instructions
├── src/
│   ├── app.py             # FastAPI application entry point
│   ├── database.py        # Database manager with SQLite
│   └── static/            # Web frontend (HTML, CSS, JS)
├── gui.py                 # PyQt5 desktop GUI application
├── extracteur_string.py   # PDF text extraction utility
├── requirements.txt       # Python dependencies
├── start.sh               # Script to start the FastAPI server
└── database.db            # SQLite database file
```

## Development Setup

### Install Dependencies

```bash
pip install -r requirements.txt
```

Note: The `requirements.txt` includes FastAPI and uvicorn. For additional features:
- Install `pdfplumber` for PDF extraction: `pip install pdfplumber`
- Install `PyQt5` for the desktop GUI: `pip install PyQt5`

### Run the FastAPI Server

```bash
fastapi dev src/app.py
```

The server runs on port 8000. Access the web interface at `http://localhost:8000/`.

### Run the Desktop GUI

```bash
python gui.py
```

Note: The PyQt5 GUI requires a desktop environment.

## Coding Conventions

### Python

- Follow **PEP 8** style guidelines
- Use **type hints** where applicable
- Write docstrings in French (to match existing codebase)
- Use assertions for type checking with SQLite connections (e.g., `assert self.connection is not None`)

### Database

- Use the `DatabaseManager` class in `src/database.py` for all database operations
- Support regex search via SQLite's `REGEXP` function
- Always handle database connections with proper error checking

### API

- RESTful endpoints using FastAPI
- Use `Query` parameters for search inputs
- Return JSON responses

### Frontend

- Keep JavaScript in separate `.js` files
- Use French text for UI labels and messages
- Follow the parchment-style visual theme (colors: `#f5deb3`, `#fff8dc`, `#8b4513`, `#d2b48c`)

## Testing

When adding tests, use `pytest` as the testing framework. Ensure tests are added for:
- API endpoints
- Database operations
- PDF extraction logic

## Commit Messages

Write clear, descriptive commit messages in English. Use conventional commit format when applicable:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `refactor:` for code refactoring
- `test:` for adding or updating tests

## Security Considerations

- Validate and sanitize regex inputs to prevent ReDoS attacks
- Use parameterized queries to prevent SQL injection (already implemented)
- Do not commit sensitive data or credentials
