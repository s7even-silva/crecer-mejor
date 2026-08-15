from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from motor import evaluar_trayectoria

app = FastAPI(title="Motor Antropometrico OMS", version="1.0")

class ControlClinico(BaseModel):
    peso_kg: float
    talla_cm: float
    edad_meses: float
    sexo: str

class HistorialPaciente(BaseModel):
    historial: List[ControlClinico]

@app.post("/evaluar")
def evaluar_paciente(datos: HistorialPaciente):
    # Convertimos los datos al formato de diccionario que requiere tu motor
    historial_dict = [control.dict() for control in datos.historial]
    
    try:
        resultado = evaluar_trayectoria(historial_dict)
        if "error" in resultado:
            raise HTTPException(status_code=400, detail=resultado["error"])
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status")
def status():
    return {"estado": "Motor clinico operativo TRL 3"}