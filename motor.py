# motor.py
# Motor antropometrico (TRL 3) - Persona A
# LMS-OMS con restriccion de colas, validacion, tendencia y priorizacion.

from pygrowup import Calculator
from datetime import datetime

calc = Calculator(adjust_height_data=False, adjust_weight_scores=True, include_cdc=False)

def normalizar(value: float, unit: str) -> tuple[float, str]:
    u = unit.lower().strip()
    if u in ['g', 'gramos']: 
        return value / 1000.0, 'kg'
    if u in ['lb', 'libras']: 
        return round(value * 0.453592, 3), 'kg'
    if u in ['m', 'metros']: 
        return value * 100.0, 'cm'
    if u in ['mm', 'milimetros']: 
        return value / 10.0, 'cm'
    return float(value), u

def _parse_date(fecha):
    if isinstance(fecha, str):
        # Manejo basico de formato ISO
        return datetime.fromisoformat(fecha.replace('Z', ''))
    return fecha

def edad_dias(fecha_nacimiento, fecha_medicion) -> int:
    fn = _parse_date(fecha_nacimiento)
    fm = _parse_date(fecha_medicion)
    return (fm - fn).days

def edad_meses(fecha_nacimiento, fecha_medicion) -> float:
    return round(edad_dias(fecha_nacimiento, fecha_medicion) / 30.4375, 2)

def validar(peso_kg: float, talla_cm: float, edad_dias: int) -> list[str]:
    errores = []
    if peso_kg < 0.5 or peso_kg > 40: 
        errores.append("Peso fuera de rango biologico")
    if talla_cm < 30 or talla_cm > 150: 
        errores.append("Talla fuera de rango biologico")
    if edad_dias < 0 or edad_dias > 1825: 
        errores.append("Edad fuera de rango (0-5 anos)")
    return errores

def zscores(peso_kg: float, talla_cm: float, edad_meses: float, sexo: str) -> dict:
    s = 'M' if sexo.upper().startswith('M') else 'F'
    try:
        z_wfa = calc.zscore(indicator='wfa', measurement=peso_kg, age_in_months=edad_meses, sex=s)
        z_hfa = calc.zscore(indicator='lhfa', measurement=talla_cm, age_in_months=edad_meses, sex=s)
        
        return {
            "z_wfa": round(float(z_wfa), 2) if z_wfa is not None else None,
            "z_hfa": round(float(z_hfa), 2) if z_hfa is not None else None
        }
    except AttributeError:
        z_wfa = calc.wfa(peso_kg, age_in_months=edad_meses, sex=s)
        z_hfa = calc.lhfa(talla_cm, age_in_months=edad_meses, sex=s)
        
        return {
            "z_wfa": round(float(z_wfa), 2) if z_wfa is not None else None,
            "z_hfa": round(float(z_hfa), 2) if z_hfa is not None else None
        }
    except Exception as e:
        return {"error": str(e)}

def flags_biv(zscores: dict) -> dict:
    flags = {}
    for k, v in zscores.items():
        if v is not None and (v < -5 or v > 5):
            flags[k] = "Flag BIV: Valor extremo"
    return flags

def clasificar(zscores: dict) -> dict:
    clasificacion = {}
    z_wfa = zscores.get("z_wfa")
    if z_wfa is not None:
        if z_wfa <= -3: clasificacion['peso_edad'] = "Desnutricion severa"
        elif z_wfa <= -2: clasificacion['peso_edad'] = "Desnutricion"
        elif z_wfa >= 2: clasificacion['peso_edad'] = "Sobrepeso"
        else: clasificacion['peso_edad'] = "Normal"
    return clasificacion

def tendencia(historial: list[dict]) -> dict:
    if len(historial) < 2:
        return {"estado": "Estable", "delta": 0.0}
    
    z_actual = historial[-1].get('z_wfa', 0)
    z_previo = historial[-2].get('z_wfa', 0)
    
    if z_actual is None or z_previo is None:
        return {"estado": "Sin datos suficientes", "delta": 0.0}
        
    delta = round(z_actual - z_previo, 2)
    estado = "Estable"
    if delta <= -0.5: estado = "Descenso severo"
    elif delta <= -0.2: estado = "Descenso leve"
    elif delta >= 0.2: estado = "Recuperacion"
    
    return {"estado": estado, "delta": delta}

def controles_esperados(edad_meses: float) -> list:
    # Esquema CRED basico hasta los 24 meses
    esquema = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 21, 24]
    return [m for m in esquema if m <= edad_meses]

def priorizar(zscores: dict, tendencia: dict, edad_meses: float) -> dict:
    z_wfa = zscores.get("z_wfa", 0)
    tend = tendencia.get("estado", "Estable")
    
    if (z_wfa is not None and z_wfa <= -2) or tend == "Descenso severo":
        return {"nivel": "Alta", "color": "Rojo", "accion": "Evaluacion urgente"}
    elif (z_wfa is not None and z_wfa <= -1) or tend == "Descenso leve":
        return {"nivel": "Media", "color": "Amarillo", "accion": "Seguimiento prioritario"}
    
    return {"nivel": "Normal", "color": "Verde", "accion": "Seguimiento habitual"}

def evaluar_trayectoria(historial: list[dict]) -> dict:
    if not historial:
        return {"error": "Historial vacio"}
        
    for registro in historial:
        zs = zscores(registro['peso_kg'], registro['talla_cm'], registro['edad_meses'], registro['sexo'])
        registro['z_wfa'] = zs.get('z_wfa')
        
    ultimo = historial[-1]
    z_actuales = zscores(ultimo['peso_kg'], ultimo['talla_cm'], ultimo['edad_meses'], ultimo['sexo'])
    tend = tendencia(historial)
    clasif = clasificar(z_actuales)
    prio = priorizar(z_actuales, tend, ultimo['edad_meses'])
    
    return {
        "zscores_actuales": z_actuales,
        "clasificacion": clasif,
        "tendencia": tend,
        "priorizacion": prio
    }