# Estado — Persona B (datos/ninos.csv, datos/mediciones.csv)

Lee `PROYECTO_IA.md` antes de esto si no lo has hecho.

Archivos de tu rol: `datos/ninos.csv`, `datos/mediciones.csv`, la parte de
"datos" de `datos/golden.csv`.

## Que hiciste (mas reciente arriba)

- 2026-08-15 — Cargados 14 ninos sinteticos (`datos/ninos.csv`) y 37
  mediciones (`datos/mediciones.csv`) cubriendo los 10 escenarios del
  checklist. N002 usa los valores EXACTOS del documento v2.0 (Parte VIII):
  12/03/2025 CRED 9.6kg/75.0cm, 14/07/2025 visita domiciliaria 9800g/0.785m,
  03/12/2025 programa social 9.9kg/82.0cm — edades verificadas en 12.1m,
  16.1m, 20.8m, igual al documento. Verificado con `pygrowup` real: el z
  P/T de N002 desciende 0.12 -> -0.45 -> -1.11 (descenso sostenido, los tres
  en zona "Normal"), reproduce el patron cualitativo del caso wow aunque el
  valor numerico final difiere un poco del citado en el documento (-1.11 vs
  -1.27 — probablemente por version de tabla LMS; no afecta la demo). N001
  y N003 tambien siguen el patron del documento (estable / severo). Script
  de validacion (fechas coherentes, nino_id existente, edad en rango OMS
  salvo el caso G07/N007 intencional) corrido sin errores.
- Decision: use `id` correlativos (M001..M037) en vez de UUID para que sea
  facil de leer y depurar a mano durante la noche.

## Bloqueos / lo que necesito de otro rol

- (nada por ahora — motor.py todavia no esta implementado, asi que no hay
  contrato de funciones que validar contra los datos aun. Cuando Persona A
  tenga `evaluar_trayectoria()` funcionando, re-verificar que el formato de
  columnas de mediciones.csv encaje sin transformacion adicional.)

## Escenarios cubiertos en los datos sinteticos

- [x] Trayectoria estable en canal (N001) — z P/T final ~ estable, sube levemente
- [x] Descenso oculto — 3 controles "Normal" pero trayectoria cae (N002, caso wow)
- [x] Desnutricion aguda severa establecida (N003) — descenso sostenido y marcado
- [x] Recuperacion post-intervencion (N004) — tendencia ascendente en 5 controles
- [x] Mismo dato en g y en kg (N005) — 8300g y 8.3kg, misma fecha, mismo valor real
- [x] Talla en metros vs cm (N006) — 0.735m en el primer control, cm despues
- [x] Valor fuera de rango fisico (N007) — 85kg a los 12.4 meses, para rechazo pre-z
- [x] z extremo real (N008) — 3.2kg a los ~3 meses, para probar flag BIV
- [x] 3 fuentes distintas, misma trayectoria (N009) — CRED / visita domiciliaria / programa social
- [x] Control faltante de varios meses (N010) — solo 2 controles con ~9 meses de hueco

Ninos adicionales (N011-N014) son relleno para que el radar tenga volumen
razonable (14 ninos, 37 mediciones en total) sin escenario especial mas
alla de trayectorias normales con distinta cantidad de controles.
