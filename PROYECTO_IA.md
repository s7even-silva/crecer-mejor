# Contexto para modelos de IA (Claude Code, Codex, u otro)

Si eres un modelo de IA ayudando a programar en este repositorio: lee este
archivo completo antes de tocar codigo. Luego lee el archivo de estado de tu
rol en `docs/estado_<rol>.md` (te lo va a indicar la persona con la que
trabajas). Al terminar cada bloque de trabajo, actualiza ese archivo y anade
una linea en `docs/ESTADO_GENERAL.md`. Instrucciones exactas al final de este
documento.

## Que es este proyecto

Crecer Mejor es un prototipo para la Hackaton "Nino San Borja 2026", reto
"Crecer mejor". Es una capa de lectura longitudinal sobre registros
antropometricos infantiles (0-5 anos) que ya existen en otros sistemas
(HIS-MINSA, SIEN, Padron Nominal). Convierte mediciones dispersas, en
unidades y fuentes heterogeneas, en una trayectoria de z-score que detecta
deterioro nutricional **antes** de que un control puntual cruce un punto de
corte de clasificacion.

No es una historia clinica electronica. No es un sistema de diagnostico
automatico. No reemplaza al SIEN ni al HIS-MINSA: los complementa.

Documento completo de referencia (leelo si necesitas el porque de una
decision): `Crecer_Mejor_v2_Documento_Corregido.md`. Es la version que
corrige y recorta la propuesta original a lo que es viable en una noche.
El otro documento en la raiz, `Crecer_Mejor_Arquitectura_y_Plan_de_Desarrollo.md`,
es la vision de producto completa (V1-V4) — util para contexto de largo
plazo, pero **no** es el plan de esta noche. Si los dos documentos se
contradicen en algo tecnico (stack, alcance, ML), gana el v2.0 corregido.

## Objetivo de esta noche: TRL 3, no una app bonita

TRL 3 = prueba de concepto analitica/experimental de la funcion critica.
La funcion critica es el calculo correcto de z-scores por el metodo LMS-OMS
mas la deteccion de deterioro en la trayectoria. La evidencia de TRL 3 es
una tabla de verificacion contra referencia OMS, no una interfaz.

Los 4 artefactos que prueban TRL 3 (si una tarea no alimenta a uno de estos,
no se hace hoy):

1. Motor implementado (`motor.py`) con LMS-OMS y restriccion de colas.
2. Golden dataset (`datos/golden.csv`) con resultado esperado definido de antemano.
3. Tabla de verificacion (`verificacion.py`) contra referencia OMS, con error maximo reportado.
4. Demo end-to-end del caso N002 (tres controles "Normal", trayectoria cae 1.2 DE).

## Stack (decidido, no lo cambies sin que el equipo lo apruebe)

Python + Streamlit + `pygrowup` + CSV/SQLite. Nada de Next.js, Supabase,
Auth, RLS, ML entrenado, ni LLM en vivo durante la demo. La razon completa
esta en la Parte I y VII de `Crecer_Mejor_v2_Documento_Corregido.md`: ese
stack se probo demasiado pesado para 18 horas y se recorto deliberadamente.

**`pygrowup` esta vendorizado en `vendor/pygrowup/`, no en
`requirements.txt`.** El paquete de PyPI tiene un bug de build irreparable
por configuracion (su `setup.py` necesita `six` antes de que pip lo
instale) que rompe tanto en Codespaces como, mas grave, en Streamlit Cloud
(que usa `uv`, sin control nuestro sobre el orden de instalacion). La
solucion fue copiar su codigo fuente al repo sin esa dependencia rota. Usa
`from vendor.pygrowup import Calculator`, nunca `pip install pygrowup`.
Detalle completo en la nota tecnica de `README.md`.

**No hay "frontend" separado.** Con Streamlit, `app.py` es a la vez la
logica de pantalla y la interfaz — no hay React, no hay CSS a mano, no hay
llamadas HTTP a un backend. Persona C es quien construye las 4 pantallas de
`app.py`, llamando directo a las funciones de `motor.py`. Si alguien
pregunta "quien hace el frontend", la respuesta es Persona C, en `app.py`.

## Limite explicito: el radar no escala a nivel nacional (hoy)

El radar/lista priorizada (Parte III y VIII del documento v2.0) esta
disenado como una **lista plana** de niños de un establecimiento o un
numero acotado de casos (decenas a un par de cientos). Esto es correcto y
suficiente para TRL 3 y para la demo.

**No confundir esto con un radar a escala nacional.** Millones de niños en
una lista plana no es un problema de "más CSV" — es un problema distinto de
arquitectura: agregacion jerarquica (region -> red -> establecimiento ->
niño), paginacion server-side, e indices en una base de datos real
(no CSV ni SQLite en un solo archivo). Eso es TRL 5-6, no TRL 3, y
requeriria ademas resolver de donde vienen los datos a esa escala (HIS-MINSA,
SIEN — ver F5 del documento), lo cual es un problema institucional, no solo
tecnico.

Si el jurado pregunta por escala nacional, la respuesta honesta es: *"el
prototipo de hoy opera a nivel de establecimiento; la arquitectura para
escala nacional (agregacion jerarquica, paginacion, base de datos real)
esta en el roadmap TRL 5-6, condicionada a integracion con HIS-MINSA/SIEN"*.
No prometer algo que la maqueta no sostiene.

## Reglas innegociables (Parte XIV del documento v2.0)

1. Si no alimenta a uno de los 4 artefactos de TRL 3, hoy no se hace.
2. Ningun calculo clinico pasa por un LLM.
3. Ningun modelo entrenado con etiquetas propias se presenta como prediccion.
4. La unidad original nunca se destruye (guardar valor+unidad original ademas del normalizado).
5. Toda alerta viene acompanada de sus razones en texto legible.
6. Cero datos personales reales — todo sintetico.
7. Se cita la NTS 238-2025, no la de 2017, si se menciona normativa.
8. Alcance congelado a las 23:00 — despues de esa hora, solo bugfix, no features nuevas.

## Estructura del repo y quien es dueno de que

```
crecer-mejor/
├── motor.py              # Persona A — el TRL 3
├── verificacion.py       # Persona A — tabla de verificacion OMS
├── app.py                # Persona C — Streamlit, 4 pantallas
├── datos/
│   ├── ninos.csv         # Persona B
│   ├── mediciones.csv    # Persona B
│   └── golden.csv        # Persona A (casos) / Persona B (datos)
├── docs/
│   ├── estado_motor.md       # Persona A actualiza esto
│   ├── estado_datos.md       # Persona B actualiza esto
│   ├── estado_app.md         # Persona C actualiza esto
│   ├── estado_pitch.md       # Persona D actualiza esto
│   └── ESTADO_GENERAL.md     # TODOS anaden una linea aqui
├── CONTRIBUTING.md       # flujo de git, division de trabajo
└── PROYECTO_IA.md        # este archivo
```

**No edites archivos fuera de tu rol sin que la persona que trabaja contigo
lo confirme.** Si crees que hace falta, dilo y espera confirmacion — no lo
hagas por tu cuenta. Los conflictos de Git en una noche de hackaton cuestan
mas caro que preguntar.

## Flujo de Git

Rama `main` directa, sin PRs esta noche (ver `CONTRIBUTING.md` completo).
Commits chicos y frecuentes. Antes de cada push: `git pull --rebase`.

## Que debes hacer al empezar a trabajar

1. Lee este archivo completo (ya lo hiciste si llegaste hasta aqui).
2. Pregunta o identifica cual es tu rol (A/B/C/D) si no te lo dijeron.
3. Lee `docs/estado_<tu_rol>.md` para ver que se hizo antes de esta sesion.
4. Lee `docs/ESTADO_GENERAL.md` para ver en que van los otros roles — puede
   cambiar lo que necesitas de ellos (formato de datos, contrato de funciones).
5. Trabaja solo en los archivos de tu rol.

## Que debes hacer antes de terminar tu sesion / bloque de trabajo

1. Actualiza `docs/estado_<tu_rol>.md`: que hiciste, que decidiste y por
   que (si no es obvio), que falta, que necesitas de otro rol si algo te
   bloquea.
2. Anade una linea en `docs/ESTADO_GENERAL.md` con fecha/hora, tu rol, y un
   resumen de una linea. No reescribas lo que otros pusieron — solo anade.
3. Haz commit y push de tus cambios (incluyendo los .md de estado).

No dejes trabajo sin commitear al cerrar una sesion — el siguiente agente
(tuyo mismo en otra sesion, u otra persona) depende de que el repo remoto
refleje el estado real.
