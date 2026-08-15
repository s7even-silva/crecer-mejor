# App Streamlit (TRL 3 - interfaz) - Persona C
# 4 pantallas: radar, perfil/trayectoria, registro de medicion, verificacion.
# Consume motor.py. Ver Parte VII y VIII del documento v2.0.

import csv
import os
from datetime import date, datetime

import pandas as pd
import streamlit as st

import motor
import verificacion

st.set_page_config(page_title="Crecer Mejor", layout="wide")

DATOS_DIR = os.path.join(os.path.dirname(__file__), "datos")
NINOS_CSV = os.path.join(DATOS_DIR, "ninos.csv")
MEDICIONES_CSV = os.path.join(DATOS_DIR, "mediciones.csv")

NIVEL_COLOR = {"VERDE": "🟢", "AMBAR": "🟡", "ROJO": "🔴"}


@st.cache_data
def cargar_ninos() -> pd.DataFrame:
    return pd.read_csv(NINOS_CSV)


def cargar_mediciones() -> pd.DataFrame:
    # sin cache_data: se recarga tras cada nuevo registro
    return pd.read_csv(MEDICIONES_CSV)


def fecha_referencia_para(meds: list[dict]) -> date:
    """Fecha desde la que se mide la adherencia al calendario CRED.

    Si el ultimo control es reciente (dataset real, en vivo), se usa hoy.
    Si es un dato historico/sintetico viejo (demo), se usa poco despues
    del ultimo control -- de lo contrario TODO el dataset de demo
    aparece en ROJO solo porque paso tiempo real desde que se genero,
    no porque el nino este realmente desatendido. Ver docstring de
    motor.evaluar_nino()."""
    ultima_fecha = max(date.fromisoformat(str(m["fecha"])) for m in meds)
    hoy = date.today()
    if (hoy - ultima_fecha).days <= 60:
        return hoy
    return ultima_fecha + pd.Timedelta(days=10)


def evaluar_todos(ninos_df: pd.DataFrame, mediciones_df: pd.DataFrame) -> dict:
    resultados = {}
    for _, nino in ninos_df.iterrows():
        nino_dict = nino.to_dict()
        meds = mediciones_df[mediciones_df["nino_id"] == nino_dict["id"]].to_dict("records")
        if not meds:
            continue
        try:
            fecha_ref = fecha_referencia_para(meds)
            resultados[nino_dict["id"]] = motor.evaluar_nino(nino_dict, meds, fecha_referencia=fecha_ref)
        except Exception as exc:
            resultados[nino_dict["id"]] = {"error": str(exc)}
    return resultados


def siguiente_id_medicion(mediciones_df: pd.DataFrame) -> str:
    numeros = [
        int(mid[1:]) for mid in mediciones_df["id"] if mid.startswith("M") and mid[1:].isdigit()
    ]
    siguiente = max(numeros, default=0) + 1
    return f"M{siguiente:03d}"


PANTALLAS = ["Radar", "Perfil del nino", "Nueva medicion", "Verificacion"]

pantalla = st.sidebar.radio("Pantalla", PANTALLAS)

ninos_df = cargar_ninos()
mediciones_df = cargar_mediciones()

# ----------------------------------------------------------------------
if pantalla == "Radar":
    st.title("Radar de prioridad")
    st.caption(
        "Lista priorizada de niños de este establecimiento. No es una "
        "probabilidad clínica: es un puntaje determinístico y auditable "
        "(ver razones en el perfil de cada niño)."
    )

    resultados = evaluar_todos(ninos_df, mediciones_df)

    filas = []
    for nino_id, r in resultados.items():
        if "error" in r:
            continue
        prio = r["prioridad"]
        nino = ninos_df.loc[ninos_df["id"] == nino_id].iloc[0]
        filas.append({
            "": NIVEL_COLOR.get(prio["nivel"], ""),
            "Codigo": nino["codigo"],
            "Nivel": prio["nivel"],
            "Puntaje": prio["puntaje"],
            "Controles": len(r["controles"]),
            "id": nino_id,
        })

    radar_df = pd.DataFrame(filas).sort_values("Puntaje", ascending=False)

    orden_nivel = {"ROJO": 0, "AMBAR": 1, "VERDE": 2}
    radar_df["_orden"] = radar_df["Nivel"].map(orden_nivel)
    radar_df = radar_df.sort_values(["_orden", "Puntaje"], ascending=[True, False])

    st.dataframe(
        radar_df[["", "Codigo", "Nivel", "Puntaje", "Controles"]],
        width='stretch',
        hide_index=True,
    )

    col1, col2, col3 = st.columns(3)
    col1.metric("🔴 Rojo", int((radar_df["Nivel"] == "ROJO").sum()))
    col2.metric("🟡 Ambar", int((radar_df["Nivel"] == "AMBAR").sum()))
    col3.metric("🟢 Verde", int((radar_df["Nivel"] == "VERDE").sum()))

# ----------------------------------------------------------------------
elif pantalla == "Perfil del nino":
    st.title("Perfil y trayectoria")

    opciones = dict(zip(ninos_df["codigo"], ninos_df["id"]))
    codigo_sel = st.selectbox("Selecciona un niño", list(opciones.keys()))
    nino_id = opciones[codigo_sel]
    nino = ninos_df.loc[ninos_df["id"] == nino_id].iloc[0]

    meds = mediciones_df[mediciones_df["nino_id"] == nino_id].to_dict("records")

    if not meds:
        st.warning("Este niño no tiene mediciones registradas.")
    else:
        resultado = motor.evaluar_nino(nino.to_dict(), meds, fecha_referencia=fecha_referencia_para(meds))

        prio = resultado["prioridad"]
        st.subheader(f"{NIVEL_COLOR.get(prio['nivel'], '')} Prioridad: {prio['nivel']} ({prio['puntaje']}/100)")
        for razon in prio["razones"]:
            st.markdown(f"- {razon}")

        st.markdown("---")
        st.subheader("Curva de z-score (peso/talla)")

        curva_df = pd.DataFrame([
            {
                "fecha": c["fecha"],
                "P/E": c["zscores"].get("P/E") if c["valido"] else None,
                "T/E": c["zscores"].get("T/E") if c["valido"] else None,
                "P/T": c["zscores"].get("P/T") if c["valido"] else None,
            }
            for c in resultado["controles"]
        ]).set_index("fecha")

        st.line_chart(curva_df)

        st.markdown("---")
        st.subheader("Historial de controles")
        for c in resultado["controles"]:
            estado = "✅ válido" if c["valido"] else "❌ invalido"
            confianza = c.get("confianza", "-")
            with st.expander(f"{c['fecha']} · {c['fuente']} · {estado}"):
                if not c["valido"]:
                    st.error("Razones de invalidez: " + "; ".join(c["razones_invalidez"]))
                else:
                    st.write(f"Peso: {c['peso_kg']} kg (original: {c['peso_original'][0]} {c['peso_original'][1]})")
                    st.write(f"Talla: {c['talla_cm']} cm (original: {c['talla_original'][0]} {c['talla_original'][1]})")
                    st.write(f"Edad: {c['edad_meses']} meses")
                    st.write(f"Z-scores: {c['zscores']}")
                    st.write(f"Clasificación: {c['clasificacion']}")
                    st.write(f"Confianza: {confianza}")
                    if any(c["flags_biv"].values()):
                        st.warning(f"Flags BIV (valor biológicamente implausible): {c['flags_biv']}")

# ----------------------------------------------------------------------
elif pantalla == "Nueva medicion":
    st.title("Registrar nueva medición")
    st.caption(
        "Al guardar, el historial, la curva y la prioridad de este niño "
        "se recalculan en vivo con el motor real."
    )

    opciones = dict(zip(ninos_df["codigo"], ninos_df["id"]))
    codigo_sel = st.selectbox("Niño", list(opciones.keys()))
    nino_id = opciones[codigo_sel]

    with st.form("nueva_medicion"):
        col1, col2 = st.columns(2)
        with col1:
            fecha = st.date_input("Fecha del control", value=date.today())
            fuente = st.selectbox(
                "Fuente", ["CRED", "VISITA_DOMICILIARIA", "PROGRAMA_SOCIAL"]
            )
        with col2:
            peso_valor = st.number_input("Peso", min_value=0.0, step=0.1, format="%.3f")
            peso_unidad = st.selectbox("Unidad de peso", ["kg", "g", "lb"])
            talla_valor = st.number_input("Talla", min_value=0.0, step=0.1, format="%.2f")
            talla_unidad = st.selectbox("Unidad de talla", ["cm", "m", "mm", "in"])

        enviado = st.form_submit_button("Guardar y recalcular")

    if enviado:
        if peso_valor <= 0 or talla_valor <= 0:
            st.error("Peso y talla deben ser mayores a cero.")
        else:
            nuevo_id = siguiente_id_medicion(mediciones_df)
            nueva_fila = {
                "id": nuevo_id,
                "nino_id": nino_id,
                "fecha": fecha.isoformat(),
                "fuente": fuente,
                "peso_valor": peso_valor,
                "peso_unidad": peso_unidad,
                "talla_valor": talla_valor,
                "talla_unidad": talla_unidad,
            }
            with open(MEDICIONES_CSV, "a", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=list(nueva_fila.keys()))
                writer.writerow(nueva_fila)

            st.success(f"Medición {nuevo_id} guardada. Recalculando...")

            mediciones_df = cargar_mediciones()
            nino = ninos_df.loc[ninos_df["id"] == nino_id].iloc[0]
            meds = mediciones_df[mediciones_df["nino_id"] == nino_id].to_dict("records")
            # date.today() explicito: el control recien registrado es de hoy,
            # asi que la adherencia se evalua respecto a hoy realmente.
            resultado = motor.evaluar_nino(nino.to_dict(), meds, fecha_referencia=date.today())

            prio = resultado["prioridad"]
            st.subheader(
                f"{NIVEL_COLOR.get(prio['nivel'], '')} Nueva prioridad: "
                f"{prio['nivel']} ({prio['puntaje']}/100)"
            )
            for razon in prio["razones"]:
                st.markdown(f"- {razon}")

            ultimo = resultado["controles"][-1]
            if ultimo["valido"]:
                st.write("Z-scores del control recién registrado:", ultimo["zscores"])
                st.write("Clasificación:", ultimo["clasificacion"])
            else:
                st.error("Razones de invalidez: " + "; ".join(ultimo["razones_invalidez"]))

# ----------------------------------------------------------------------
elif pantalla == "Verificacion":
    st.title("Tabla de verificación OMS")
    st.caption(
        "Evidencia de TRL 3: el motor se compara contra los puntos de "
        "referencia publicados por la OMS (columnas SD3neg..SD3 de las "
        "tablas LMS oficiales), no contra un cálculo propio."
    )

    filas, error_maximo = verificacion.generar_tabla_verificacion()
    verificacion_df = pd.DataFrame(filas)

    st.metric("Error máximo absoluto", f"{error_maximo} DE")
    st.dataframe(verificacion_df, width='stretch', hide_index=True)

    st.markdown("---")
    st.subheader("Golden dataset")
    st.caption("10 casos con resultado esperado definido antes de correr el motor.")
    golden_df = pd.read_csv(os.path.join(DATOS_DIR, "golden.csv"))
    st.dataframe(golden_df, width='stretch', hide_index=True)
