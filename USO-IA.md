# Uso de IA
- Herramientas utilizadas (o "No utilizada"): Cursor, con el agente de código de esta sesión.
- Una o dos solicitudes representativas SIN secretos: reproducir los cuatro reportes de la versión A, corregir la causa de cada uno sin reemplazar la aplicación y comprobar el resultado con la API local y el navegador.
- Decisión técnica: qué acepté, ajusté o descarté y por qué: acepté las cuatro causas localizadas en el formulario, el listado, la validación del peligro y el efecto del filtro, porque coincidían con el comportamiento observado antes de cambiar el código. Ajusté el mensaje de nivelPeligro para que cubra el rango 1–10 del contrato y no solo números enteros. No sustituí MongoDB, no quité validaciones y no rediseñé la interfaz.
- Cómo verifiqué los cambios: peticiones HTTP guardadas en evidencias/ antes y después, recorrido en http://127.0.0.1:5173 descrito en evidencias/ui-recorrido.txt, y npm run check en backend y frontend.
