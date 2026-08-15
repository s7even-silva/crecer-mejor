import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg://crecer_mejor:crecer_mejor@localhost:5432/crecer_mejor",
)

# Proveedores como Neon entregan el connection string con el prefijo
# generico "postgresql://", que SQLAlchemy resuelve al driver psycopg2
# por defecto (no instalado -- usamos psycopg3, "psycopg[binary]" en
# requirements.txt). Se normaliza el prefijo sin importar como venga la
# variable de entorno, para no depender de que cada persona lo escriba
# bien al copiar la URL del proveedor.
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
