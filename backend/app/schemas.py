from datetime import date

from pydantic import BaseModel, ConfigDict


class NinoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    codigo: str
    sexo: str
    fecha_nacimiento: date


class MedicionIn(BaseModel):
    fecha: date
    fuente: str
    peso_valor: float
    peso_unidad: str
    talla_valor: float
    talla_unidad: str


class MedicionOut(MedicionIn):
    model_config = ConfigDict(from_attributes=True)

    id: str
    nino_id: str


class EvaluacionOut(BaseModel):
    controles: list[dict]
    tendencia: dict
    prioridad: dict
