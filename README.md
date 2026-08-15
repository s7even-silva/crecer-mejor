# crecer-mejor

Hackaton Nino San Borja 2026 - Reto "Crecer mejor"

Plataforma de lectura longitudinal de la trayectoria antropometrica infantil
(0-5 anos), sobre el metodo LMS-OMS, para detectar deterioro nutricional antes
de que un control puntual cruce un punto de corte.

Documento de referencia: `Crecer_Mejor_v2_Documento_Corregido.md` (corrige y
recorta la propuesta original a lo que es viable en 18 horas).

> **Esta es la rama `arquitectura-v2`**: la version "profesional" del
> stack (Next.js + FastAPI + Postgres), en paralelo a la demo original en
> Streamlit (ramas `main`/`deploy`). Reutiliza `motor.py` y
> `verificacion.py` tal cual — el motor verificado no se reescribe, solo
> se envuelve en una API HTTP.

## En produccion

| Componente | URL | Se despliega desde |
|---|---|---|
| Frontend (Next.js) | https://crecer-mejor.vercel.app | Vercel, rama `arquitectura-v2` |
| Backend (FastAPI) | https://crecer-mejor-production.up.railway.app | Railway, rama `arquitectura-v2` |
| Base de datos | Postgres 18 (Neon, Sao Paulo) | — (no se redeploya con push, persiste) |

Cada push a `arquitectura-v2` redeploya Vercel y Railway automaticamente.
Vercel tiene el *Ignored Build Step* configurado en "Only build production"
para no intentar builds de `main`/`deploy` (esas ramas no tienen `frontend/`).

## Estructura del monorepo

```
crecer-mejor/
├── motor.py                 # el TRL 3: LMS-OMS, validacion, tendencia, prioridad
├── verificacion.py          # tabla de verificacion contra referencia OMS
├── vendor/pygrowup/         # pygrowup vendorizado (ver nota tecnica abajo)
├── datos/                   # CSV fuente de verdad (se migra a Postgres)
│   ├── ninos.csv
│   ├── mediciones.csv
│   └── golden.csv           # el otro TRL 3
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI: /radar, /ninos, /evaluacion, /verificacion
│   │   ├── models.py        # SQLAlchemy: Nino, Medicion
│   │   ├── database.py      # engine, normaliza DATABASE_URL a psycopg3
│   │   └── motor_bridge.py  # importa motor.py/verificacion.py desde la raiz
│   ├── migrar_csv.py        # carga datos/*.csv a Postgres
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                # Next.js 16 (App Router) + TypeScript + Tailwind + shadcn/ui
│   ├── app/                 # Radar, Perfil del nino, Nueva medicion, Verificacion
│   ├── components/          # shadcn/ui + theme toggle + nav
│   └── lib/api.ts           # cliente HTTP hacia el backend
├── app.py                   # demo Streamlit (rama main/deploy la usan en produccion)
└── docker-compose.yml       # Postgres 18 + API para desarrollo local
```

## Correr todo en local

### Con Docker (recomendado)

```bash
docker compose up --build
```

Levanta Postgres 18 + el backend en `http://localhost:8000`. Luego migra los
datos de ejemplo (una sola vez):

```bash
DATABASE_URL="postgresql+psycopg://crecer_mejor:crecer_mejor@localhost:5432/crecer_mejor" \
  python backend/migrar_csv.py
```

### Sin Docker

```bash
python3 -m venv .venv-backend
.venv-backend/bin/pip install -r backend/requirements.txt

cd backend
DATABASE_URL="sqlite:///$PWD/local.db" ../.venv-backend/bin/python3 migrar_csv.py
DATABASE_URL="sqlite:///$PWD/local.db" ../.venv-backend/bin/uvicorn app.main:app --reload
```

SQLite funciona para desarrollo local (sin instalar Postgres); produccion usa
Postgres real via Neon.

### Frontend

```bash
cd frontend
npm install
echo "API_URL=http://localhost:8000" > .env.local
npm run dev
```

Abre `http://localhost:3000`.

## Nota tecnica: `pygrowup` esta vendorizado, no en `requirements.txt`

`pygrowup` 0.8.2 (la unica version moderna en PyPI) tiene un bug real: su
`setup.py` ejecuta `import pygrowup` para leer el numero de version, lo
que dispara `import six` en su modulo principal — pero `six` recien se
instalaria *despues*, como parte de `install_requires`. El propio proceso
de build nunca ve `six` a tiempo. Esto rompe la instalacion tanto con
`pip` como con `uv`, sin importar el orden de `requirements.txt` ni las
flags de pip usadas.

La solucion fue copiar el codigo fuente de `pygrowup` a `vendor/pygrowup/`
(quitando `setup.py`, `tests.py` y el unico uso real de `six.string_types`,
reemplazado por `str` nativo de Python 3) y importarlo como
`from vendor.pygrowup import Calculator` en vez de instalarlo por pip.
Es codigo Python puro mas las tablas LMS-OMS oficiales (~1.4 MB de JSON),
sin compilacion nativa de por medio. Verificado: el caso de referencia del
documento (varon 24 meses, 10.5 kg) sigue dando z = -1.28 exactamente igual
que con el paquete de PyPI.

No reinstalar `pygrowup` via pip ni borrar `vendor/pygrowup/`.

## Nota tecnica: `DATABASE_URL` se normaliza a psycopg3

Neon (y otros proveedores como Heroku/Render) entregan el connection string
con el prefijo generico `postgresql://`, que SQLAlchemy resuelve al driver
`psycopg2` por defecto — no instalado, este proyecto usa `psycopg3`
(`psycopg[binary]`). `backend/app/database.py` normaliza el prefijo a
`postgresql+psycopg://` automaticamente sin importar como venga la variable
de entorno.

## Roles (heredados de la demo Streamlit, ver `CONTRIBUTING.md`)

| Persona | Archivo(s) | Rol |
|---|---|---|
| A | `motor.py`, `verificacion.py` | Motor antropometrico, golden dataset, tabla de verificacion |
| B | `datos/*.csv` | Datos sinteticos, casos de unidades/fuentes mixtas |
| C | `backend/`, `frontend/` | API + interfaz (arquitectura-v2) |
| D | Diapositivas | Pitch, cifras ENDES, normativa, ensayo, plan B de demo |

**Si vas a usar un asistente de IA para programar** (Claude Code, Codex u
otro), dile que lea `PROYECTO_IA.md` primero.
