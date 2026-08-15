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
