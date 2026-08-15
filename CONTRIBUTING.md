# Como trabajamos esta noche

Stack: Python + Streamlit + pygrowup. Sin Supabase, sin Next.js, sin ML entrenado.
Razones completas en `Crecer_Mejor_v2_Documento_Corregido.md`.

## Codespaces

1. En GitHub, entra al repo `crecer-mejor` -> boton verde `Code` -> pestana `Codespaces` -> `Create codespace on main`.
2. Espera a que termine `postCreateCommand` (instala `requirements.txt` automaticamente).
3. Cada persona abre su **propio** Codespace. Son 4 maquinas separadas, mismo repo.
4. Si corres `streamlit run app.py`, VS Code te ofrece abrir el puerto 8501 en una pestana del navegador (esta preconfigurado en `.devcontainer/devcontainer.json`).
5. Un Codespace es desechable: si algo se rompe, se borra y se crea otro. El codigo real vive en GitHub, no en el Codespace.

## Ramas: main directa

Nadie abre rama propia ni Pull Request esta noche. Se trabaja sobre `main` con
commits frecuentes y pequenos.

```bash
git pull
# ... editas tu archivo ...
git add <archivo que tocaste>
git commit -m "mensaje corto"
git pull --rebase
git push
```

Reglas para que esto no choque:

- Cada persona toca **solo sus archivos** (ver division abajo). Si necesitas tocar
  un archivo de otra persona, avisa antes por el chat del equipo.
- `git pull --rebase` antes de cada push. Si hay conflicto, casi siempre es porque
  dos personas tocaron el mismo archivo — coordinen quien resuelve.
- Commits chicos y frecuentes (cada 20-30 min), no un commit gigante al final.

## Division de archivos por persona

| Persona | Archivo(s) | Rol |
|---|---|---|
| A | `motor.py`, `verificacion.py` | Motor antropometrico, golden dataset, tabla de verificacion |
| B | `datos/ninos.csv`, `datos/mediciones.csv` | Datos sinteticos, casos de unidades/fuentes mixtas |
| C | `app.py` | Interfaz Streamlit: radar, perfil, registro, verificacion |
| D | `README.md`, diapositivas (fuera del repo o en `docs/`) | Pitch, cifras ENDES, normativa, ensayo, plan B de demo |

## Regla de oro

Si una tarea no alimenta a uno de los 4 artefactos de TRL 3 (motor, golden dataset,
tabla de verificacion, demo end-to-end del caso N002), no se hace hoy.

Alcance congelado a las 23:00. Ver Parte XI y XIV del documento v2.0.
