from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import os
from pathlib import Path
#from database import DatabaseManager

#TODO : reader tutorial : https://fastapi.tiangolo.com/tutorial/first-steps/#check-the-openapijson

app = FastAPI(title="SpadaLibreria",
              description="bibliotheque AMHE")

# Mount the static files directory
current_dir = Path(__file__).parent
app.mount("/static", StaticFiles(directory=os.path.join(Path(__file__).parent,
          "static")), name="static")

# db_manager = DatabaseManager()
# db_manager.connect()
# db_manager.create_tables()

@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")

@app.get("/health")
def health():
    return {"status": "ok"}

# @app.get("/search")
# def search_entries(regex: str = Query(...), language: str = Query("fr")):
#     results = db_manager.search_entries(regex, language=language)
#     # On retourne une liste de chaînes (par exemple, le champ texte)
#     return {"results": [r[1] for r in results]}

async def root():
    return {"message": "Hello World"}