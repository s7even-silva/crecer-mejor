import os
import csv
import random
from datetime import datetime, timedelta

# Asegurar que la carpeta exista
os.makedirs("datos", exist_ok=True)

# Configuracion base
COMUNIDADES = ["Yurimaguas", "Yarinacocha", "Belen", "Tarapoto", "Nauta"]
FUENTES = ["CRED", "Cuna Mas", "Visita Domiciliaria", "Campana MINSA"]
FECHA_HOY = datetime(2026, 8, 15)

# Mediana de peso OMS (Varones y Mujeres aproximado)
# Meses: 0, 6, 9, 12, 18, 24
MEDIANAS_PESO = {0: 3.3, 6: 7.9, 9: 8.9, 12: 9.6, 18: 10.9, 24: 12.2}
MEDIANAS_TALLA = {0: 50.0, 6: 67.6, 9: 72.0, 12: 75.7, 18: 82.3, 24: 87.1}

def generar_dataset(num_ninos=200):
    ninos = []
    mediciones = []
    medicion_id = 1

    for i in range(1, num_ninos + 1):
        child_id = f"N{i:03d}"
        sexo = random.choice(["M", "F"])
        comunidad = random.choice(COMUNIDADES)
        
        # Edad actual aleatoria entre 6 y 24 meses
        edad_actual_meses = random.randint(6, 24)
        fecha_nac = FECHA_HOY - timedelta(days=edad_actual_meses * 30.4)
        
        ninos.append({
            "child_id": child_id,
            "fecha_nacimiento": fecha_nac.strftime("%Y-%m-%d"),
            "sexo": sexo,
            "comunidad": comunidad
        })

        # Determinar el perfil clinico del nino
        perfil = random.choices(
            ["Normal", "Riesgo_Descenso", "Datos_Sucios"], 
            weights=[0.70, 0.15, 0.15]
        )[0]

        # Generar historial de controles
        controles = [6, 9, 12, 18, 24]
        for mes in controles:
            if mes > edad_actual_meses:
                continue # No generar mediciones en el futuro
            
            # Factor de variacion segun perfil
            variacion_peso = random.gauss(0, 0.5) # Ruido gaussiano para la campana
            variacion_talla = random.gauss(0, 2.0)
            
            if perfil == "Riesgo_Descenso" and mes >= 9:
                variacion_peso -= (mes / 6) # El peso cae progresivamente

            peso_real = round(MEDIANAS_PESO[mes] + variacion_peso, 2)
            talla_real = round(MEDIANAS_TALLA[mes] + variacion_talla, 1)

            # Si el perfil es sucio, metemos ruido en las unidades
            unidad_peso = "kg"
            unidad_talla = "cm"
            if perfil == "Datos_Sucios" and random.random() > 0.5:
                peso_real = int(peso_real * 1000)
                unidad_peso = "g"
            
            # Omitir un control aleatorio si es datos sucios (simular fragmentacion)
            if perfil == "Datos_Sucios" and random.random() > 0.7:
                continue
                
            fecha_medicion = fecha_nac + timedelta(days=mes * 30.4)
            
            mediciones.append({
                "medicion_id": f"M{medicion_id:04d}",
                "child_id": child_id,
                "fecha": fecha_medicion.strftime("%Y-%m-%d"),
                "peso": peso_real,
                "unidad_peso": unidad_peso,
                "talla": talla_real,
                "unidad_talla": unidad_talla,
                "fuente": random.choice(FUENTES)
            })
            medicion_id += 1

    # Guardar CSV Ninos
    with open('datos/ninos.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["child_id", "fecha_nacimiento", "sexo", "comunidad"])
        writer.writeheader()
        writer.writerows(ninos)

    # Guardar CSV Mediciones
    with open('datos/mediciones.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["medicion_id", "child_id", "fecha", "peso", "unidad_peso", "talla", "unidad_talla", "fuente"])
        writer.writeheader()
        writer.writerows(mediciones)
        
    print(f"Exito: Se generaron {len(ninos)} ninos y {len(mediciones)} mediciones en la carpeta 'datos/'.")

if __name__ == "__main__":
    generar_dataset()