# Estado — Persona B (datos/ninos.csv, datos/mediciones.csv)

Lee `PROYECTO_IA.md` antes de esto si no lo has hecho.

Archivos de tu rol: `datos/ninos.csv`, `datos/mediciones.csv`, la parte de
"datos" de `datos/golden.csv`.

## Que hiciste (mas reciente arriba)

- (vacio todavia)

## Bloqueos / lo que necesito de otro rol

- (nada por ahora)

## Escenarios cubiertos en los datos sinteticos

Marca cuales de estos ya existen en el CSV, para que no se dupliquen:

- [ ] Trayectoria estable en canal (N001)
- [ ] Descenso oculto — 3 controles "Normal" pero trayectoria cae (N002, caso wow)
- [ ] Desnutricion aguda severa establecida (N003)
- [ ] Recuperacion post-intervencion
- [ ] Mismo dato en g y en kg
- [ ] Talla en metros vs cm
- [ ] Valor fuera de rango fisico (para probar rechazo pre-z)
- [ ] z extremo real (para probar flag BIV)
- [ ] 3 fuentes distintas, misma trayectoria
- [ ] Control faltante de varios meses (adherencia)
