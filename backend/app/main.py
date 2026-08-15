from datetime import date, timedelta

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, engine, get_db
from .motor_bridge import evaluar_nino, generar_tabla_verificacion

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Crecer Mejor API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restringir al dominio del frontend en produccion
    allow_methods=["*"],
    allow_headers=["*"],
)


def _fecha_referencia_para(mediciones: list[models.Medicion]) -> date:
    """Misma logica que app.py (Streamlit): evita que la penalizacion de
    adherencia se dispare solo porque paso tiempo real desde que se
    genero un dataset sintetico/historico. Ver docs/estado_app.md."""
    ultima_fecha = max(m.fecha for m in mediciones)
    hoy = date.today()
    if (hoy - ultima_fecha).days <= 60:
        return hoy
    return ultima_fecha + timedelta(days=10)


@app.get("/status")
def status():
    return {"estado": "Motor clinico operativo TRL 3"}


@app.get("/ninos", response_model=list[schemas.NinoOut])
def listar_ninos(db: Session = Depends(get_db)):
    return db.query(models.Nino).all()


@app.get("/ninos/{nino_id}/evaluacion", response_model=schemas.EvaluacionOut)
def evaluar(nino_id: str, db: Session = Depends(get_db)):
    nino = db.query(models.Nino).filter(models.Nino.id == nino_id).first()
    if nino is None:
        raise HTTPException(status_code=404, detail="Nino no encontrado")

    mediciones = (
        db.query(models.Medicion)
        .filter(models.Medicion.nino_id == nino_id)
        .order_by(models.Medicion.fecha)
        .all()
    )
    if not mediciones:
        raise HTTPException(status_code=404, detail="Nino sin mediciones")

    nino_dict = {"sexo": nino.sexo, "fecha_nacimiento": nino.fecha_nacimiento}
    mediciones_dict = [
        {
            "fecha": m.fecha,
            "fuente": m.fuente,
            "peso_valor": m.peso_valor,
            "peso_unidad": m.peso_unidad,
            "talla_valor": m.talla_valor,
            "talla_unidad": m.talla_unidad,
        }
        for m in mediciones
    ]

    resultado = evaluar_nino(
        nino_dict, mediciones_dict,
        fecha_referencia=_fecha_referencia_para(mediciones),
    )
    return resultado


@app.get("/radar")
def radar(db: Session = Depends(get_db)):
    ninos = db.query(models.Nino).all()
    filas = []
    for nino in ninos:
        mediciones = (
            db.query(models.Medicion)
            .filter(models.Medicion.nino_id == nino.id)
            .order_by(models.Medicion.fecha)
            .all()
        )
        if not mediciones:
            continue
        nino_dict = {"sexo": nino.sexo, "fecha_nacimiento": nino.fecha_nacimiento}
        mediciones_dict = [
            {
                "fecha": m.fecha, "fuente": m.fuente,
                "peso_valor": m.peso_valor, "peso_unidad": m.peso_unidad,
                "talla_valor": m.talla_valor, "talla_unidad": m.talla_unidad,
            }
            for m in mediciones
        ]
        resultado = evaluar_nino(
            nino_dict, mediciones_dict,
            fecha_referencia=_fecha_referencia_para(mediciones),
        )
        filas.append({
            "nino_id": nino.id,
            "codigo": nino.codigo,
            "nivel": resultado["prioridad"]["nivel"],
            "puntaje": resultado["prioridad"]["puntaje"],
            "controles": len(resultado["controles"]),
        })
    filas.sort(key=lambda f: f["puntaje"], reverse=True)
    return filas


@app.post("/ninos/{nino_id}/mediciones", response_model=schemas.MedicionOut)
def registrar_medicion(
    nino_id: str, medicion: schemas.MedicionIn, db: Session = Depends(get_db)
):
    nino = db.query(models.Nino).filter(models.Nino.id == nino_id).first()
    if nino is None:
        raise HTTPException(status_code=404, detail="Nino no encontrado")

    ultimo = (
        db.query(models.Medicion)
        .order_by(models.Medicion.id.desc())
        .first()
    )
    siguiente_num = int(ultimo.id[1:]) + 1 if ultimo else 1
    nueva = models.Medicion(
        id=f"M{siguiente_num:03d}",
        nino_id=nino_id,
        **medicion.model_dump(),
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@app.get("/verificacion")
def verificacion_oms():
    filas, error_maximo = generar_tabla_verificacion()
    return {"filas": filas, "error_maximo_absoluto": error_maximo}
