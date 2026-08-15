# crecer-mejor
Hackaton Nino San Borja 2026 - Reto "Crecer mejor"

Plataforma de lectura longitudinal de la trayectoria antropometrica infantil
(0-5 anos), sobre el metodo LMS-OMS, para detectar deterioro nutricional antes
de que un control puntual cruce un punto de corte.

Documento de referencia: `Crecer_Mejor_v2_Documento_Corregido.md` (corrige y
recorta la propuesta original a lo que es viable en 18 horas).

## Empezar a trabajar (Codespaces)

1. En GitHub: `Code` -> `Codespaces` -> `Create codespace on main`.
2. Espera a que instale dependencias solo (`requirements.txt` via `postCreateCommand`).
3. Para levantar la app:

   ```bash
   streamlit run app.py
   ```

   VS Code va a ofrecer abrir el puerto 8501 en el navegador.

4. Para correr la tabla de verificacion del motor:

   ```bash
   python verificacion.py
   ```

Ver `CONTRIBUTING.md` para el flujo de trabajo en equipo (ramas, division de
archivos por persona, reglas de la noche).

**Si vas a usar un asistente de IA para programar** (Claude Code, Codex u
otro), dile que lea `PROYECTO_IA.md` primero — ahi tiene el contexto del
proyecto, su rol, y las instrucciones para mantener actualizado su archivo
de estado en `docs/estado_<rol>.md` y `docs/ESTADO_GENERAL.md`.

## Roles

No hay backend/frontend separados como en Next.js: con Streamlit, `app.py`
es a la vez la logica y la interfaz.

| Persona | Archivo(s) | Rol |
|---|---|---|
| A | `motor.py`, `verificacion.py` | Motor antropometrico, golden dataset, tabla de verificacion |
| B | `datos/*.csv` | Datos sinteticos, casos de unidades/fuentes mixtas |
| C | `app.py` | **Frontend/interfaz** (Streamlit): radar, perfil, registro, verificacion |
| D | Diapositivas, `README.md` | Pitch, cifras ENDES, normativa, ensayo, plan B de demo |

Detalle completo en `CONTRIBUTING.md`.

## Despliegue en internet (post-hackaton)

Para la demo de manana el plan es local + video de respaldo (ver Parte VII
del documento v2.0) — no depender del wifi de la sede. Para dejar el
prototipo accesible en internet despues:

1. Entra a [share.streamlit.io](https://share.streamlit.io) con tu cuenta de GitHub.
2. `Create app` -> `Deploy a public app from GitHub`.
3. Repository: `s7even-silva/crecer-mejor`, branch `main`, main file `app.py`.
4. Deploy. Cada push a `main` redeploya automaticamente despues.

`requirements.txt` solo tiene `streamlit` y `pandas` (ambos con wheels
precompilados) — funciona en Streamlit Cloud sin pasos adicionales. Ver
nota sobre `vendor/pygrowup/` mas abajo.

## Estructura

```
crecer-mejor/
├── motor.py              # el TRL 3: LMS-OMS, validacion, tendencia, prioridad
├── app.py                # Streamlit, 4 pantallas
├── verificacion.py        # genera la tabla de verificacion contra referencia OMS
├── vendor/
│   └── pygrowup/          # pygrowup vendorizado (ver nota tecnica abajo)
├── datos/
│   ├── ninos.csv
│   ├── mediciones.csv
│   └── golden.csv        # el otro TRL 3
└── .devcontainer/         # entorno reproducible para Codespaces
```

## Nota tecnica: `pygrowup` esta vendorizado, no en `requirements.txt`

`pygrowup` 0.8.2 (la unica version moderna en PyPI) tiene un bug real: su
`setup.py` ejecuta `import pygrowup` para leer el numero de version, lo
que dispara `import six` en su modulo principal — pero `six` recien se
instalaria *despues*, como parte de `install_requires`. El propio proceso
de build nunca ve `six` a tiempo. Esto rompe la instalacion tanto con
`pip` como con `uv` (el instalador que usa Streamlit Community Cloud),
sin importar el orden de `requirements.txt` ni las flags de pip usadas
(se probaron `--no-build-isolation` y preinstalar `six`/`setuptools`
manualmente; funciona en Codespaces porque ahi controlamos el comando de
instalacion en dos pasos, pero Streamlit Cloud no da ese control).

La solucion fue copiar el codigo fuente de `pygrowup` a `vendor/pygrowup/`
(quitando `setup.py`, `tests.py` y el unico uso real de `six.string_types`,
reemplazado por `str` nativo de Python 3) y importarlo como
`from vendor.pygrowup import Calculator` en vez de instalarlo por pip.
Es codigo Python puro mas las tablas LMS-OMS oficiales (~1.4 MB de JSON),
sin compilacion nativa de por medio, asi que no hay nada que pueda fallar
en el build. Verificado: el caso de referencia del documento (varon 24
meses, 10.5 kg) sigue dando z = -1.28 exactamente igual que con el paquete
de PyPI.

No reinstalar `pygrowup` via pip ni borrar `vendor/pygrowup/`.
