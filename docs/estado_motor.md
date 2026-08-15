# Estado — Persona A (motor.py, verificacion.py)

Lee `PROYECTO_IA.md` antes de esto si no lo has hecho.

Archivos de tu rol: `motor.py`, `verificacion.py`, la parte de "casos" de
`datos/golden.csv`.

## Que hiciste (mas reciente arriba)

- 2026-08-15 — `pygrowup` dejo de instalarse por pip: se vendorizo en
  `vendor/pygrowup/` (codigo fuente copiado del paquete 0.8.2, sin
  `setup.py`/`tests.py`, con el unico uso de `six.string_types`
  reemplazado por `str`). `motor.py` ahora importa
  `from vendor.pygrowup import Calculator` en vez de `from pygrowup import
  Calculator`. `requirements.txt` volvio a tener solo `streamlit` y
  `pandas`. Verificado en un venv limpio (simulando Streamlit Cloud): z =
  -1.28 para el caso de referencia del documento, igual que antes. Ver
  nota tecnica completa en `README.md` y `PROYECTO_IA.md`.
- 2026-08-15 — Motor completo implementado en `motor.py`: `normalizar()`
  (kg/g/lb, cm/m/mm/in), `edad_dias()`/`edad_meses()`, `validar()`
  (rangos fisicos, edad fuera del patron OMS), `zscores()` (P/E, T/E, P/T
  via pygrowup vendorizado, devuelve floats no Decimal), `flags_biv()`
  (criterio OMS de valor biologicamente implausible), `clasificar()`
  (puntos de corte de la tabla de la Parte IV), `tendencia()` (umbral de
  canal 0.67 DE), `controles_esperados()` (periodicidad CRED
  simplificada), `priorizar()` (puntaje 0-100 con razones legibles +
  penalizacion de adherencia opcional).

  **Decision de diseno importante:** la firma original del esqueleto
  `evaluar_trayectoria(historial: list[dict])` no tenia forma de recibir
  sexo/fecha_nacimiento del nino (indispensables para el z-score). Se
  dejo esa funcion con un `NotImplementedError` explicativo y se creo
  `evaluar_nino(nino: dict, mediciones: list[dict], fecha_referencia=None)`
  como la funcion real que usa `app.py`. Ver docstring en el codigo para
  el contrato completo de entrada/salida.

  **fecha_referencia es critico:** por defecto usa `date.today()` para
  calcular adherencia (dias desde el ultimo control vs. periodicidad
  esperada). Con datos sinteticos/historicos viejos (como el golden
  dataset, generado con fechas de 2022-2025), NO pasar fecha_referencia
  hace que TODOS los ninos disparen penalizacion de adherencia solo
  porque paso tiempo real desde que se genero el dataset — no porque
  esten realmente desatendidos. `app.py` resuelve esto con
  `fecha_referencia_para()`: usa hoy si el ultimo control es reciente
  (<60 dias), o "ultimo control + 10 dias" si es dato historico.

  `verificacion.py` implementado: genera 42 puntos (P/E, 2 sexos x 3
  edades x 7 puntos SD3neg..SD3) tomados directo de las tablas LMS
  oficiales vendorizadas (no recalculados), compara contra el motor.
  **Error maximo absoluto: 0.1 DE** — esta es la evidencia de TRL 3 que
  pide la Parte VI del documento.

  `datos/golden.csv` completo con los 10 casos (G01-G10) mapeados a
  ninos reales (N001-N010) y el resultado real obtenido del motor, no
  solo la intencion. Se corrigieron los datos sinteticos de N003 (no
  modelaba desnutricion aguda real), N004 (talla no creceia, invalidaba
  "recuperacion") y N006 (talla de partida fisicamente imposible) para
  que el motor los clasifique como el escenario pretendia.

## Bloqueos / lo que necesito de otro rol

- Verificacion clinica pendiente: los cortes de `clasificar()` estan
  tomados del estandar OMS/MINSA descrito en la Parte IV del documento,
  pero falta confirmarlos contra los anexos exactos de la NTS 238-2025
  (tarea asignada a quien tenga acceso al asesor clinico).

## Contrato de funciones expuesto a Persona C (app.py)

```python
motor.evaluar_nino(nino: dict, mediciones: list[dict],
                    fecha_referencia: date|str|None = None) -> dict
```

- `nino`: dict con al menos `{"sexo": "M"|"F", "fecha_nacimiento": "YYYY-MM-DD"}`
- `mediciones`: lista de dicts con el esquema de `datos/mediciones.csv`
  (`fecha`, `fuente`, `peso_valor`, `peso_unidad`, `talla_valor`, `talla_unidad`)
- `fecha_referencia`: ver nota arriba — pasar explicitamente al evaluar
  datos historicos/sinteticos con fecha fija.

Devuelve:
```python
{
    "controles": [
        {
            "fecha": date, "fuente": str,
            "peso_kg": float, "talla_cm": float, "edad_meses": float,
            "peso_original": (valor, unidad), "talla_original": (valor, unidad),
            "valido": bool, "razones_invalidez": [str, ...],
            "zscores": {"P/E": float, "T/E": float, "P/T": float},
            "flags_biv": {"P/E": bool, "T/E": bool, "P/T": bool},
            "clasificacion": {"P/E": str, "T/E": str, "P/T": str},
            "confianza": "normal"|"baja",  # solo si valido=True
        }, ...
    ],
    "tendencia": {
        "delta_z": {...}, "velocidad_z_mes": {...},
        "cruce_canal": {...}, "descenso_detectado": bool,
    },
    "prioridad": {"puntaje": int, "nivel": "VERDE"|"AMBAR"|"ROJO", "razones": [str, ...]},
}
```

`app.py` ya consume esto completo — ver las 4 pantallas para ejemplos de uso.
