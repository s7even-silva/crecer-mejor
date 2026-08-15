FROM python:3.11-slim

WORKDIR /repo

COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# se copia el repo completo porque motor_bridge.py importa motor.py
# y vendor/pygrowup/ desde la raiz -- no se duplica el motor aqui.
COPY . .

WORKDIR /repo/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
