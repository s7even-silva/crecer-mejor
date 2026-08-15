# Puente hacia el motor verificado en la raiz del repo (motor.py).
# No se reescribe la logica clinica aqui -- se reutiliza tal cual,
# porque ya esta verificada contra la tabla LMS-OMS (ver /verificar y
# datos/golden.csv en la raiz). Este archivo solo resuelve el import
# desde la carpeta backend/ sin duplicar codigo.

import sys
from pathlib import Path

RAIZ_REPO = Path(__file__).resolve().parents[2]
if str(RAIZ_REPO) not in sys.path:
    sys.path.insert(0, str(RAIZ_REPO))

import motor  # noqa: E402
import verificacion  # noqa: E402

evaluar_nino = motor.evaluar_nino
generar_tabla_verificacion = verificacion.generar_tabla_verificacion
