# Genera la tabla de verificacion del motor contra referencia OMS - Persona A
# Salida: error maximo absoluto por punto de referencia (-3..+3 DE).
# Ver Parte VI del documento v2.0. Esta tabla ES el TRL 3, no la app.

import json
import os

import motor

TABLAS_DIR = os.path.join(os.path.dirname(__file__), "vendor", "pygrowup", "tables")

PUNTOS_DE = [
    ("SD3neg", -3),
    ("SD2neg", -2),
    ("SD1neg", -1),
    ("SD0", 0),
    ("SD1", 1),
    ("SD2", 2),
    ("SD3", 3),
]

# 3 edades x 2 sexos, indicador peso/edad (P/E) -- minimo pedido por el
# documento (Parte VI: "8 puntos... en 3 edades"). Usamos las 7 columnas
# SD3neg..SD3 de la propia tabla LMS oficial como referencia independiente:
# son los valores publicados por la OMS, no un recalculo nuestro.
EDADES_MESES = [0, 24, 48]
SEXOS = [("M", "boys"), ("F", "girls")]

def _cargar_tabla_wfa(sexo_tabla: str) -> dict:
    ruta = os.path.join(TABLAS_DIR, f"wfa_{sexo_tabla}_0_5_zscores.json")
    with open(ruta) as f:
        filas = json.load(f)
    return {fila["Month"]: fila for fila in filas}


def generar_tabla_verificacion() -> list[dict]:
    filas_resultado = []
    error_maximo = 0.0

    for sexo, sexo_tabla in SEXOS:
        tabla_wfa = _cargar_tabla_wfa(sexo_tabla)
        for edad_meses in EDADES_MESES:
            fila_oms = tabla_wfa.get(str(edad_meses))
            if fila_oms is None:
                continue
            for columna, de_esperado in PUNTOS_DE:
                peso_referencia_kg = float(fila_oms[columna])

                # Se llama wfa() directo (no motor.zscores(), que ademas
                # calcula P/T y dispararia warnings de pygrowup por la
                # talla de referencia fija usada aqui). Esta tabla
                # verifica P/E unicamente, como especifica el documento.
                z_raw = motor.calc.wfa(peso_referencia_kg, edad_meses, sexo)
                z_motor = float(z_raw) if z_raw is not None else None
                error = abs(z_motor - de_esperado) if z_motor is not None else None

                if error is not None:
                    error_maximo = max(error_maximo, error)

                filas_resultado.append({
                    "sexo": sexo,
                    "edad_meses": edad_meses,
                    "peso_referencia_kg": peso_referencia_kg,
                    "de_esperado": de_esperado,
                    "z_motor": round(z_motor, 2) if z_motor is not None else None,
                    "error_absoluto": round(error, 3) if error is not None else None,
                })

    return filas_resultado, round(error_maximo, 3)


def imprimir_tabla():
    filas, error_maximo = generar_tabla_verificacion()
    print(f"{'Sexo':<5} {'Edad(m)':<8} {'Peso ref(kg)':<13} {'DE esperado':<12} "
          f"{'z motor':<9} {'Error abs':<10}")
    print("-" * 65)
    for f in filas:
        print(f"{f['sexo']:<5} {f['edad_meses']:<8} {f['peso_referencia_kg']:<13} "
              f"{f['de_esperado']:<12} {f['z_motor']:<9} {f['error_absoluto']:<10}")
    print("-" * 65)
    print(f"Error maximo absoluto: {error_maximo} DE")


if __name__ == "__main__":
    imprimir_tabla()
