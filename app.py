# App Streamlit (TRL 3 - interfaz) - Persona C
# 4 pantallas: radar, perfil/trayectoria, registro de medicion, verificacion.
# Consume motor.py. Ver Parte VII y VIII del documento v2.0.

import streamlit as st

st.set_page_config(page_title="Crecer Mejor", layout="wide")

PANTALLAS = ["Radar", "Perfil del nino", "Nueva medicion", "Verificacion"]

pantalla = st.sidebar.radio("Pantalla", PANTALLAS)

if pantalla == "Radar":
    st.title("Radar de prioridad")
elif pantalla == "Perfil del nino":
    st.title("Perfil y trayectoria")
elif pantalla == "Nueva medicion":
    st.title("Registrar nueva medicion")
elif pantalla == "Verificacion":
    st.title("Tabla de verificacion OMS")
