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
- (vacio todavia — el primer agente/persona en trabajar la LOGICA del
  motor anade aqui su entrada con fecha/hora, que implemento, que decidio
  y por que si no es obvio, y que le falta.)

## Bloqueos / lo que necesito de otro rol

- (nada por ahora)

## Contrato de funciones expuesto a Persona C (app.py)

Documenta aqui la firma real de `evaluar_trayectoria()` y cualquier funcion
que `app.py` vaya a llamar, en cuanto este implementada — Persona C depende
de esto para no adivinar el formato de entrada/salida.
