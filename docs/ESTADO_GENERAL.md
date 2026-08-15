# Estado general del proyecto

Vista rapida de progreso de los 4 roles. **Solo anadir lineas nuevas al
final de tu seccion, no reescribir lo que pusieron otros.** El detalle
completo de cada rol vive en `docs/estado_<rol>.md`.

Formato de cada linea: `HH:MM — Rol — resumen de una linea`.

## Persona A — Motor (`motor.py`, `verificacion.py`)

- 16:30 — Motor A — CRITICO: pygrowup fallaba al desplegar en Streamlit
  Cloud (bug de build con six, ni pip ni uv lo resuelven). Vendorizado en
  `vendor/pygrowup/`. `motor.py` cambio su import a `from vendor.pygrowup
  import Calculator`. Si estas trabajando sobre una copia vieja del repo,
  haz `git pull` antes de tocar motor.py. Detalle en `docs/estado_motor.md`.
- 17:30 — Motor A — Motor completo implementado y probado. Golden
  dataset (10/10) verificado contra el motor real. Tabla de verificacion
  OMS: error maximo 0.1 DE. Los 4 artefactos de TRL 3 estan completos.
  Contrato de `evaluar_nino()` documentado para Persona C. Detalle en
  `docs/estado_motor.md`.

## Persona B — Datos (`datos/*.csv`)

- 15:00 — Datos B — 14 ninos / 37 mediciones cargados, 10/10 escenarios del
  checklist cubiertos, N002 verificado con pygrowup real (descenso oculto
  confirmado). Detalle en `docs/estado_datos.md`.
- 16:00 — Datos B — Ampliado a 34 ninos / 102 mediciones (relleno cosmetico
  para el radar, sin escenarios nuevos). Documentado el limite de escala
  nacional (radar es de nivel establecimiento, no nacional) en
  `PROYECTO_IA.md` y `docs/estado_pitch.md` para la respuesta al jurado.
- 17:45 — Datos B — Regenerados los 20 ninos de relleno con medianas OMS
  reales (la primera version saturaba el radar de ROJO por trayectorias
  no plausibles). Radar final: 24 VERDE / 7 AMBAR / 3 ROJO. 105
  mediciones totales. Detalle en `docs/estado_datos.md`.

## Persona C — App (`app.py`)

- 18:00 — App C — Las 4 pantallas implementadas y probadas end-to-end
  con Streamlit real + Playwright (screenshots verificados). Bug
  encontrado y corregido: sin fecha_referencia explicita, el radar
  completo se iba a ROJO por adherencia solo por el paso del tiempo real
  desde que se genero el dataset sintetico — ver
  `fecha_referencia_para()` en `app.py` y detalle en `docs/estado_app.md`.

## Persona D — Pitch / QA / demo

- (sin entradas todavia)

## Hitos globales (los 4 artefactos de TRL 3)

- [x] Motor implementado y corriendo
- [x] Golden dataset (10 casos) completo con resultado esperado
- [x] Tabla de verificacion contra referencia OMS generada (error max 0.1 DE)
- [x] Demo end-to-end del caso N002 funcionando (app.py, pantalla "Perfil del nino")
