# Estado — Persona C (app.py) — Frontend/interfaz

Lee `PROYECTO_IA.md` antes de esto si no lo has hecho.

Archivo de tu rol: `app.py`. Eres el "frontend" del proyecto: no hay
Next.js/React, Streamlit convierte tu codigo Python en la interfaz web.

## Que hiciste (mas reciente arriba)

- 2026-08-15 — Implementadas las 4 pantallas. Probado end-to-end con
  Streamlit real (`streamlit run app.py`) + Playwright headless,
  screenshots verificados visualmente:
  - **Radar**: tabla ordenada por nivel (ROJO/AMBAR/VERDE) y puntaje,
    con conteo por nivel. Usa `motor.evaluar_nino()` sobre los 34 ninos.
  - **Perfil del nino**: selectbox por codigo, prioridad + razones,
    curva de z-score (P/E, T/E, P/T) con `st.line_chart`, historial de
    controles en expanders con datos originales vs. normalizados y
    flags BIV.
  - **Nueva medicion**: formulario que escribe una fila nueva a
    `datos/mediciones.csv` (append, no reescribe el archivo) y
    recalcula en vivo con el motor real. Verificado con datos de
    prueba: guarda el ID correlativo siguiente (`siguiente_id_medicion`)
    y muestra la nueva prioridad + z-scores inmediatamente.
  - **Verificacion**: llama a `verificacion.generar_tabla_verificacion()`
    y muestra el error maximo absoluto (0.1 DE) + la tabla completa, mas
    el golden dataset desde `datos/golden.csv`.

  **Bug encontrado y corregido durante las pruebas:** el radar mostraba
  27/34 ninos en ROJO 100/100 porque `evaluar_nino()` sin
  `fecha_referencia` usa `date.today()`, y todo el dataset sintetico
  (fechas 2022-2025) acumulaba "meses de atraso" solo por el paso del
  tiempo real. Se agrego `fecha_referencia_para(meds)` en `app.py`: usa
  hoy si el ultimo control es reciente (<60 dias), o
  "ultimo control + 10 dias" si es dato historico. En "Nueva medicion"
  se usa `date.today()` explicito porque ahi si es un registro real de hoy.

  Tambien se reemplazo `use_container_width=True` (deprecado) por
  `width='stretch'` en las 3 llamadas a `st.dataframe()`.

## Bloqueos / lo que necesito de otro rol

- Ninguno actualmente. El contrato de `motor.evaluar_nino()` esta
  documentado en `docs/estado_motor.md` y ya esta consumido en las 4
  pantallas.

## Pantallas y su estado

- [x] Radar (lista priorizada)
- [x] Perfil del nino + curva de z-score
- [x] Registro de nueva medicion (con recalculo en vivo)
- [x] Tabla de verificacion (lee la salida de `verificacion.py`)
