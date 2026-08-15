# Estado general del proyecto

Vista rapida de progreso de los 4 roles. **Solo anadir lineas nuevas al
final de tu seccion, no reescribir lo que pusieron otros.** El detalle
completo de cada rol vive en `docs/estado_<rol>.md`.

Formato de cada linea: `HH:MM — Rol — resumen de una linea`.

## Persona A — Motor (`motor.py`, `verificacion.py`)

- (sin entradas todavia)

## Persona B — Datos (`datos/*.csv`)

- 15:00 — Datos B — 14 ninos / 37 mediciones cargados, 10/10 escenarios del
  checklist cubiertos, N002 verificado con pygrowup real (descenso oculto
  confirmado). Detalle en `docs/estado_datos.md`.
- 16:00 — Datos B — Ampliado a 34 ninos / 102 mediciones (relleno cosmetico
  para el radar, sin escenarios nuevos). Documentado el limite de escala
  nacional (radar es de nivel establecimiento, no nacional) en
  `PROYECTO_IA.md` y `docs/estado_pitch.md` para la respuesta al jurado.

## Persona C — App (`app.py`)

- (sin entradas todavia)

## Persona D — Pitch / QA / demo

- (sin entradas todavia)

## Hitos globales (los 4 artefactos de TRL 3)

- [ ] Motor implementado y corriendo
- [ ] Golden dataset (10 casos) completo con resultado esperado
- [ ] Tabla de verificacion contra referencia OMS generada
- [ ] Demo end-to-end del caso N002 funcionando
