# Motor antropometrico (TRL 3) - Persona A
# LMS-OMS con restriccion de colas, validacion, tendencia y priorizacion.
# Ver Crecer_Mejor_v2_Documento_Corregido.md, Parte IV.

from pygrowup import Calculator

calc = Calculator(adjust_height_data=False, adjust_weight_scores=True, include_cdc=False)


def normalizar(value: float, unit: str) -> tuple[float, str]:
    raise NotImplementedError


def edad_dias(fecha_nacimiento, fecha_medicion) -> int:
    raise NotImplementedError


def edad_meses(fecha_nacimiento, fecha_medicion) -> float:
    raise NotImplementedError


def validar(peso_kg: float, talla_cm: float, edad_dias: int) -> list[str]:
    raise NotImplementedError


def zscores(peso_kg: float, talla_cm: float, edad_meses: float, sexo: str) -> dict:
    raise NotImplementedError


def flags_biv(zscores: dict) -> dict:
    raise NotImplementedError


def clasificar(zscores: dict) -> dict:
    raise NotImplementedError


def tendencia(historial: list[dict]) -> dict:
    raise NotImplementedError


def controles_esperados(edad_meses: float) -> list:
    raise NotImplementedError


def priorizar(zscores: dict, tendencia: dict, edad_meses: float) -> dict:
    raise NotImplementedError


def evaluar_trayectoria(historial: list[dict]) -> dict:
    raise NotImplementedError
