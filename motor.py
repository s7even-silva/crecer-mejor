# Motor antropometrico (TRL 3) - Persona A
# LMS-OMS con restriccion de colas, validacion, tendencia y priorizacion.
# Ver Crecer_Mejor_v2_Documento_Corregido.md, Parte IV.

from datetime import date, datetime

from vendor.pygrowup import Calculator
from vendor.pygrowup import exceptions as pygrowup_exceptions

calc = Calculator(adjust_height_data=False, adjust_weight_scores=True, include_cdc=False)

DIAS_POR_MES = 30.4375
EDAD_MAX_DIAS = 1856  # patron OMS 0-60 meses aprox.

UMBRAL_CANAL_DE = 0.67  # ancho de un canal percentilar (Cole) - ver Parte IV

# rangos de plausibilidad fisica pre-z (validacion grosera, no clinica)
PESO_MIN_KG, PESO_MAX_KG = 1.0, 30.0
TALLA_MIN_CM, TALLA_MAX_CM = 30.0, 130.0

# criterio OMS de valor biologicamente implausible (BIV), en DE
BIV_LIMITES = {
    "P/E": (-6, 5),
    "T/E": (-6, 6),
    "P/T": (-5, 5),
}

CLASIFICACIONES = {
    "P/E": [
        (-float("inf"), -3, "Desnutricion global severa"),
        (-3, -2, "Desnutricion global"),
        (-2, 2, "Normal"),
        (2, 3, "Peso elevado"),
        (3, float("inf"), "Peso elevado"),
    ],
    "T/E": [
        (-float("inf"), -3, "Talla baja severa"),
        (-3, -2, "Talla baja"),
        (-2, 2, "Normal"),
        (2, 3, "Talla alta"),
        (3, float("inf"), "Talla alta"),
    ],
    "P/T": [
        (-float("inf"), -3, "Desnutricion aguda severa"),
        (-3, -2, "Desnutricion aguda"),
        (-2, 2, "Normal"),
        (2, 3, "Sobrepeso"),
        (3, float("inf"), "Obesidad"),
    ],
}

# periodicidad de controles CRED esperada por edad (NTS 238-2025, simplificado)
CONTROLES_ESPERADOS_MESES = {
    "0-11m": 30.4375,   # mensual
    "12-23m": 60.875,   # bimensual
    "24-59m": 91.3125,  # trimestral
}


def _parse_fecha(f):
    if isinstance(f, date) and not isinstance(f, datetime):
        return f
    if isinstance(f, datetime):
        return f.date()
    return date.fromisoformat(str(f))


def normalizar(value: float, unit: str) -> tuple[float, str]:
    """Convierte peso a kg y talla/longitud a cm, preservando el valor
    original fuera de esta funcion (el llamador debe guardar value/unit
    tal como llegaron, ademas del resultado de normalizar())."""
    unit = unit.strip().lower()
    value = float(value)

    conversiones_peso = {
        "kg": 1.0,
        "g": 0.001,
        "lb": 0.453592,
    }
    conversiones_talla = {
        "cm": 1.0,
        "m": 100.0,
        "mm": 0.1,
        "in": 2.54,
    }

    if unit in conversiones_peso:
        return round(value * conversiones_peso[unit], 3), "kg"
    if unit in conversiones_talla:
        return round(value * conversiones_talla[unit], 2), "cm"

    raise ValueError(f"unidad no soportada: {unit}")


def edad_dias(fecha_nacimiento, fecha_medicion) -> int:
    fnac = _parse_fecha(fecha_nacimiento)
    fmed = _parse_fecha(fecha_medicion)
    return (fmed - fnac).days


def edad_meses(fecha_nacimiento, fecha_medicion) -> float:
    return edad_dias(fecha_nacimiento, fecha_medicion) / DIAS_POR_MES


def validar(peso_kg: float, talla_cm: float, edad_dias: int) -> list[str]:
    """Validacion de plausibilidad PRE-calculo de z-score (rangos fisicos
    groseros, fecha coherente, edad dentro del patron OMS). No es un
    diagnostico clinico -- solo filtra errores de tipeo/mediciones
    imposibles antes de que lleguen al motor LMS."""
    razones = []

    if edad_dias < 0:
        razones.append("fecha de medicion anterior a la fecha de nacimiento")
    if edad_dias > EDAD_MAX_DIAS:
        razones.append(
            f"edad ({edad_dias} dias) fuera del rango del patron OMS 0-5 anos"
        )
    if not (PESO_MIN_KG <= peso_kg <= PESO_MAX_KG):
        razones.append(
            f"peso {peso_kg}kg fuera de rango fisico plausible "
            f"({PESO_MIN_KG}-{PESO_MAX_KG}kg)"
        )
    if not (TALLA_MIN_CM <= talla_cm <= TALLA_MAX_CM):
        razones.append(
            f"talla {talla_cm}cm fuera de rango fisico plausible "
            f"({TALLA_MIN_CM}-{TALLA_MAX_CM}cm)"
        )

    return razones


def zscores(peso_kg: float, talla_cm: float, edad_meses: float, sexo: str) -> dict:
    """P/E, T/E, P/T via LMS-OMS restringido (adjust_weight_scores=True).
    pygrowup resuelve internamente wfl vs wfh segun edad/talla. Devuelve
    floats (pygrowup entrega Decimal, no se propaga fuera de esta funcion)."""
    sexo = sexo.upper()
    crudos = {
        "P/E": calc.wfa(peso_kg, edad_meses, sexo),
        "T/E": calc.lhfa(talla_cm, edad_meses, sexo, height=talla_cm),
        "P/T": calc.wfl(peso_kg, edad_meses, sexo, height=talla_cm),
    }
    return {k: (float(v) if v is not None else None) for k, v in crudos.items()}


def flags_biv(zscores: dict) -> dict:
    """Criterio OMS de valor biologicamente implausible: fuera del rango
    esperado, la clasificacion se acepta pero la confianza se degrada."""
    flags = {}
    for indicador, z in zscores.items():
        if z is None:
            flags[indicador] = False
            continue
        lo, hi = BIV_LIMITES[indicador]
        flags[indicador] = not (lo <= z <= hi)
    return flags


def clasificar(zscores: dict) -> dict:
    resultado = {}
    for indicador, z in zscores.items():
        if z is None:
            resultado[indicador] = "Sin dato"
            continue
        for lo, hi, etiqueta in CLASIFICACIONES[indicador]:
            if lo <= z < hi:
                resultado[indicador] = etiqueta
                break
        else:
            resultado[indicador] = "Sin dato"
    return resultado


def tendencia(historial: list[dict]) -> dict:
    """historial: lista de dicts ordenados por fecha, cada uno con al
    menos {'fecha', 'zscores': {'P/E':..., 'T/E':..., 'P/T':...}}.
    Detecta descenso por cruce de canal percentilar (0.67 DE, Cole) --
    ver Parte IV del documento: no es un umbral inventado."""
    if len(historial) < 2:
        return {
            "delta_z": {},
            "velocidad_z_mes": {},
            "cruce_canal": {},
            "descenso_detectado": False,
        }

    primero, ultimo = historial[0], historial[-1]
    dias = edad_dias(primero["fecha"], ultimo["fecha"]) if "fecha" in primero else None
    meses_transcurridos = (
        (_parse_fecha(ultimo["fecha"]) - _parse_fecha(primero["fecha"])).days
        / DIAS_POR_MES
    )
    meses_transcurridos = meses_transcurridos or 1e-9

    delta_z = {}
    velocidad = {}
    cruce_canal = {}
    descenso_detectado = False

    for indicador in ("P/E", "T/E", "P/T"):
        z0 = primero["zscores"].get(indicador)
        z1 = ultimo["zscores"].get(indicador)
        if z0 is None or z1 is None:
            continue
        d = round(z1 - z0, 3)
        delta_z[indicador] = d
        velocidad[indicador] = round(d / meses_transcurridos, 4)
        cruzo = d <= -UMBRAL_CANAL_DE
        cruce_canal[indicador] = cruzo
        if cruzo:
            descenso_detectado = True

    return {
        "delta_z": delta_z,
        "velocidad_z_mes": velocidad,
        "cruce_canal": cruce_canal,
        "descenso_detectado": descenso_detectado,
    }


def controles_esperados(edad_meses: float) -> list:
    """Devuelve la periodicidad esperada de controles CRED segun la edad
    actual (simplificado de NTS 238-2025 -- verificar anexos exactos
    antes de citarlo como norma, ver Parte IV del documento)."""
    if edad_meses < 12:
        return ["mensual", CONTROLES_ESPERADOS_MESES["0-11m"]]
    if edad_meses < 24:
        return ["bimensual", CONTROLES_ESPERADOS_MESES["12-23m"]]
    return ["trimestral", CONTROLES_ESPERADOS_MESES["24-59m"]]


def priorizar(zscores: dict, tendencia: dict, edad_meses: float,
              dias_desde_ultimo_control: float | None = None) -> dict:
    """Puntaje 0-100 deterministico con razones legibles. Mas alto =
    mayor prioridad de seguimiento. No es una probabilidad clinica.

    dias_desde_ultimo_control (opcional): si se pasa, penaliza cuando
    excede la periodicidad esperada para la edad (adherencia al
    calendario CRED) -- ver controles_esperados()."""
    puntaje = 0
    razones = []

    for indicador, z in zscores.items():
        if z is None:
            continue
        if z <= -3:
            puntaje += 40
            razones.append(f"Indicador {indicador} en zona severa (z = {z})")
        elif z <= -2:
            puntaje += 25
            razones.append(f"Indicador {indicador} en zona de alerta (z = {z})")

    for indicador, delta in tendencia.get("delta_z", {}).items():
        if delta is not None and delta <= -UMBRAL_CANAL_DE:
            puntaje += 20
            razones.append(
                f"Descenso de {abs(delta):.2f} DE en {indicador.lower()}"
            )

    if edad_meses < 24:
        puntaje += 6
        razones.append("Menor de 24 meses (ventana critica de los 1000 dias)")

    if dias_desde_ultimo_control is not None:
        _, periodicidad_esperada_dias = controles_esperados(edad_meses)
        if dias_desde_ultimo_control > periodicidad_esperada_dias:
            meses_atraso = round(
                (dias_desde_ultimo_control - periodicidad_esperada_dias)
                / DIAS_POR_MES, 1
            )
            puntaje += 15
            razones.append(
                f"Adherencia: sin control hace {meses_atraso} meses mas de "
                f"lo esperado para su edad"
            )

    puntaje = min(puntaje, 100)

    if puntaje >= 60:
        nivel = "ROJO"
    elif puntaje >= 30:
        nivel = "AMBAR"
    else:
        nivel = "VERDE"

    return {"puntaje": puntaje, "nivel": nivel, "razones": razones}


def evaluar_trayectoria(historial: list[dict]) -> dict:
    """Pipeline completo sobre la historia de un nino.

    historial: lista de dicts ordenados por fecha, cada uno con:
        {
            "fecha": date | str ISO,
            "fuente": str,
            "peso_valor": float, "peso_unidad": str,
            "talla_valor": float, "talla_unidad": str,
        }
    fecha_nacimiento y sexo se pasan aparte porque son del nino, no del
    control.

    Devuelve un dict con el detalle de cada control evaluado y el
    resultado agregado (tendencia + prioridad) sobre el ultimo control.
    """
    raise NotImplementedError(
        "evaluar_trayectoria requiere fecha_nacimiento y sexo del nino; "
        "usar evaluar_nino(nino, mediciones) en su lugar."
    )


def evaluar_nino(nino: dict, mediciones: list[dict],
                  fecha_referencia: "date | str | None" = None) -> dict:
    """Version utilizable de evaluar_trayectoria(): recibe el nino
    ({'sexo', 'fecha_nacimiento', ...}) y su lista de mediciones
    ordenadas por fecha (formato de datos/mediciones.csv). Devuelve:

    {
        "controles": [
            {
                "fecha": date,
                "fuente": str,
                "peso_kg": float, "talla_cm": float,
                "edad_meses": float,
                "valido": bool, "razones_invalidez": [...],
                "zscores": {...}, "flags_biv": {...}, "clasificacion": {...},
            },
            ...
        ],
        "tendencia": {...},         # sobre los controles validos
        "prioridad": {...},         # sobre el ultimo control valido, incluye
                                     # penalizacion de adherencia relativa a
                                     # fecha_referencia
    }

    fecha_referencia: fecha desde la que se mide "cuanto atraso tiene el
    ultimo control" para la penalizacion de adherencia. Por defecto es
    hoy (uso normal en produccion, donde las mediciones son recientes).
    Pasarla explicitamente al evaluar datos historicos/sinteticos con
    fecha fija -- de lo contrario TODOS los ninos de un dataset viejo
    aparecen con adherencia mala solo porque el reloj del sistema avanzo.
    """
    sexo = nino["sexo"]
    fecha_nacimiento = nino["fecha_nacimiento"]
    fecha_ref = _parse_fecha(fecha_referencia) if fecha_referencia else date.today()

    controles = []
    for m in sorted(mediciones, key=lambda m: _parse_fecha(m["fecha"])):
        peso_kg, _ = normalizar(m["peso_valor"], m["peso_unidad"])
        talla_cm, _ = normalizar(m["talla_valor"], m["talla_unidad"])
        edm_dias = edad_dias(fecha_nacimiento, m["fecha"])
        edm_meses = edm_dias / DIAS_POR_MES

        razones_invalidez = validar(peso_kg, talla_cm, edm_dias)
        valido = len(razones_invalidez) == 0

        control = {
            "fecha": _parse_fecha(m["fecha"]),
            "fuente": m.get("fuente"),
            "peso_original": (m["peso_valor"], m["peso_unidad"]),
            "talla_original": (m["talla_valor"], m["talla_unidad"]),
            "peso_kg": peso_kg,
            "talla_cm": talla_cm,
            "edad_meses": round(edm_meses, 2),
            "valido": valido,
            "razones_invalidez": razones_invalidez,
        }

        if valido:
            try:
                z = zscores(peso_kg, talla_cm, edm_meses, sexo)
            except (pygrowup_exceptions.DataNotFound,
                     pygrowup_exceptions.DataError,
                     pygrowup_exceptions.InvalidAge,
                     pygrowup_exceptions.InvalidMeasurement) as exc:
                control["valido"] = False
                control["razones_invalidez"].append(f"motor LMS: {exc}")
                control["zscores"] = {}
                control["flags_biv"] = {}
                control["clasificacion"] = {}
            else:
                control["zscores"] = z
                control["flags_biv"] = flags_biv(z)
                control["clasificacion"] = clasificar(z)
                control["confianza"] = (
                    "baja" if any(control["flags_biv"].values()) else "normal"
                )
        else:
            control["zscores"] = {}
            control["flags_biv"] = {}
            control["clasificacion"] = {}

        controles.append(control)

    validos = [c for c in controles if c["valido"]]
    historial_para_tendencia = [
        {"fecha": c["fecha"], "zscores": c["zscores"]} for c in validos
    ]
    tend = tendencia(historial_para_tendencia)

    if validos:
        ultimo = validos[-1]
        dias_desde_ultimo = (fecha_ref - ultimo["fecha"]).days
        prio = priorizar(
            ultimo["zscores"], tend, ultimo["edad_meses"],
            dias_desde_ultimo_control=dias_desde_ultimo,
        )
    else:
        # Sin ningun control valido no es lo mismo que "sano": es un
        # vacio de informacion (datos rechazados por implausibles o
        # nunca medido). Se marca AMBAR, no VERDE, para que requiera
        # revision -- VERDE comunicaria "sin riesgo", que es falso
        # cuando en realidad no hay ningun dato confiable que lo respalde.
        razones = ["Sin controles validos: se requiere remedicion"]
        for c in controles:
            if not c["valido"]:
                razones.extend(
                    f"{c['fecha']}: {r}" for r in c["razones_invalidez"]
                )
        prio = {"puntaje": 35, "nivel": "AMBAR", "razones": razones}

    return {
        "controles": controles,
        "tendencia": tend,
        "prioridad": prio,
    }
