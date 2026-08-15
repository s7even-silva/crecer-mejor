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

`requirements.txt` ya esta preparado para que esto funcione sin pasos
adicionales (ver nota sobre `pygrowup`/`six` mas abajo).

## Estructura

```
crecer-mejor/
├── motor.py              # el TRL 3: LMS-OMS, validacion, tendencia, prioridad
├── app.py                # Streamlit, 4 pantallas
├── verificacion.py        # genera la tabla de verificacion contra referencia OMS
├── datos/
│   ├── ninos.csv
│   ├── mediciones.csv
│   └── golden.csv        # el otro TRL 3
└── .devcontainer/         # entorno reproducible para Codespaces
```

## Nota tecnica: orden de `requirements.txt`

`setuptools`, `wheel` y `six` van primero a proposito. `pygrowup` 0.8.2 hace
`import six` dentro de su propio `setup.py` sin declararlo como dependencia
de build, asi que si `six` no esta ya instalado antes de que pip intente
construirlo, la instalacion falla. No reordenar ni quitar esas tres lineas.
