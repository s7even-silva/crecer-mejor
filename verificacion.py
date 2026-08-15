import csv
from motor import evaluar_trayectoria, normalizar, edad_meses

def probar_dataset_masivo():
    # 1. Cargar datos demograficos
    ninos = {}
    with open('datos/ninos.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            ninos[row['child_id']] = row

    historiales = {}
    with open('datos/mediciones.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cid = row['child_id']
            if cid not in historiales:
                historiales[cid] = []

            peso_kg, _ = normalizar(float(row['peso']), row['unidad_peso'])
            talla_cm, _ = normalizar(float(row['talla']), row['unidad_talla'])
            edad_m = edad_meses(ninos[cid]['fecha_nacimiento'], row['fecha'])

            historiales[cid].append({
                "peso_kg": peso_kg,
                "talla_cm": talla_cm,
                "edad_meses": edad_m,
                "sexo": ninos[cid]['sexo']
            })

    conteo_prioridades = {"Alta": 0, "Media": 0, "Normal": 0}
    ejemplos_para_demo = {}

    for cid, historial in historiales.items():
        # Ordenar cronologicamente por si el CSV esta desordenado
        historial_ordenado = sorted(historial, key=lambda x: x['edad_meses'])
        
        resultado = evaluar_trayectoria(historial_ordenado)
        
        if "error" in resultado:
            continue
            
        nivel = resultado['priorizacion']['nivel']
        conteo_prioridades[nivel] += 1
        
        if nivel not in ejemplos_para_demo:
            ejemplos_para_demo[nivel] = (cid, ninos[cid]['comunidad'], resultado)

    print("=== REPORTE DE VERIFICACION POBLACIONAL (TRL 3) ===")
    print(f"Total de pacientes procesados exitosamente: {sum(conteo_prioridades.values())}")
    print(f"Distribucion de triaje: {conteo_prioridades}\n")

    print("=== CASOS DE ESTUDIO AISLADOS PARA LA DEMO ===")
    for nivel, datos in ejemplos_para_demo.items():
        cid, comunidad, res = datos
        print(f"Prioridad {nivel}: Paciente {cid} ({comunidad})")
        print(f"  Tendencia: {res['tendencia']['estado']} (Delta Z: {res['tendencia']['delta']})")
        print(f"  Accion sugerida: {res['priorizacion']['accion']}\n")

if __name__ == "__main__":
    probar_dataset_masivo()