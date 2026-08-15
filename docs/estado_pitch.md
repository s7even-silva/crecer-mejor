# Estado — Persona D (pitch, normativa, demo, QA)

Lee `PROYECTO_IA.md` antes de esto si no lo has hecho.

Archivos de tu rol: diapositivas (fuera del repo o en `docs/`), `README.md`
(seccion de presentacion si aplica), coordinacion de ensayos y video de
respaldo.

## Que hiciste (mas reciente arriba)

- (vacio todavia)

## Bloqueos / lo que necesito de otro rol

- (nada por ahora)

## Checklist

- [ ] Cifras ENDES 2025 confirmadas (DCI 12.1%, anemia 43.4%, brecha rural/urbana)
- [ ] Cortes de `motor.py` verificados contra anexos NTS 238-2025
- [ ] Diapositivas 1-4 (problema, insight, posicionamiento, como funciona)
- [ ] Diapositivas 5-8 (demo, evidencia TRL3, limites/roadmap, preguntas)
- [ ] Tabla de preguntas del jurado ensayada
- [ ] `demo_backup.mp4` grabado (07:00, no antes de tener el caso N002 congelado)
- [ ] Capturas de pantalla de respaldo en las diapositivas
- [ ] Ensayo 1 (noche) completo
- [ ] Ensayo 2 y 3 (manana) cronometrados

## Pregunta adicional del jurado a preparar: escala nacional

Si preguntan *"¿esto funciona a nivel nacional?"* o *"¿como se ve el radar
con todos los niños del Peru?"*, la respuesta honesta (no inventar una que
la maqueta no sostiene):

> *"El prototipo de hoy opera a nivel de establecimiento — el radar es una
> lista priorizada de los niños de un centro. Escalar a nivel nacional no
> es agregar mas filas: requiere agregacion jerarquica (region -> red ->
> establecimiento -> niño), paginacion, y una base de datos real en vez de
> CSV/SQLite de un archivo. Eso es TRL 5-6 en el roadmap, y depende ademas
> de la integracion institucional con HIS-MINSA y SIEN — no es solo un
> problema tecnico."*

Ver detalle en `PROYECTO_IA.md`, seccion "Limite explicito: el radar no
escala a nivel nacional".
