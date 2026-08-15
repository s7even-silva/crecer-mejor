# Carga datos/ninos.csv y datos/mediciones.csv (la fuente de verdad para
# la demo Streamlit) a Postgres. Uso: python -m backend.migrar_csv
# Requiere DATABASE_URL apuntando a una base ya migrada (ver database.py).

import csv
from datetime import date
from pathlib import Path

from app.database import Base, SessionLocal, engine
from app.models import Medicion, Nino

RAIZ_REPO = Path(__file__).resolve().parents[1]
DATOS_DIR = RAIZ_REPO / "datos"


def migrar():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        with open(DATOS_DIR / "ninos.csv") as f:
            for row in csv.DictReader(f):
                existente = db.query(Nino).filter(Nino.id == row["id"]).first()
                if existente:
                    continue
                db.add(Nino(
                    id=row["id"], codigo=row["codigo"], sexo=row["sexo"],
                    fecha_nacimiento=date.fromisoformat(row["fecha_nacimiento"]),
                ))
        db.commit()

        with open(DATOS_DIR / "mediciones.csv") as f:
            for row in csv.DictReader(f):
                existente = db.query(Medicion).filter(Medicion.id == row["id"]).first()
                if existente:
                    continue
                db.add(Medicion(
                    id=row["id"], nino_id=row["nino_id"],
                    fecha=date.fromisoformat(row["fecha"]),
                    fuente=row["fuente"],
                    peso_valor=float(row["peso_valor"]), peso_unidad=row["peso_unidad"],
                    talla_valor=float(row["talla_valor"]), talla_unidad=row["talla_unidad"],
                ))
        db.commit()

        total_ninos = db.query(Nino).count()
        total_mediciones = db.query(Medicion).count()
        print(f"Migracion completa: {total_ninos} ninos, {total_mediciones} mediciones.")
    finally:
        db.close()


if __name__ == "__main__":
    migrar()
