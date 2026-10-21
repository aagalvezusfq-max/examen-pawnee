# Auditoría · Versión A
Código: e0456
Repositorio público propio: https://github.com/aagalvezusfq-max/examen-pawnee
Rama: examen/e0456

## A-01 · No se registra el avistamiento
### Síntoma
Acción: POST /api/avistamientos con el cuerpo que armaba el formulario al crear (testigo Andy Dwyer, ubicación Parque Ramsett, fecha 2026-10-21, criaturaId de La Ardilla del Martes). Esperado: 201 y detalle. Observado antes: 400 {"error":"Campos no permitidos en el cuerpo"} y el total de avistamientos siguió en 4. Evidencia: evidencias/antes-a01-formulario.txt.

### Causa
En frontend/src/paginas/FormularioAvistamiento.tsx, al crear se enviaba la clave criaturaId y al editar la clave criatura. La lista blanca de backend/src/validacion.ts solo admite criatura, así que el alta nunca llegaba a comprobar la referencia ni a insertar.

### Cambio
El formulario envía siempre criatura, que es el campo del contrato. Commit c83610cc4af21db2e19c762eb6d9b0ebed99a10d.

### Prueba
POST con criatura 65a000000000000000000101, testigo Andy Dwyer, ubicación Parque Ramsett y fecha 2026-10-21: 201. GET del id creado: 200 y criatura La Ardilla del Martes. POST con criatura 65afffffffffffffffffffff: 404 {"error":"Criatura referenciada no encontrada"} y no aumentó el total. En http://127.0.0.1:5173/avistamientos/nuevo el mismo formulario abrió /avistamientos/6ad8d6f8bf967ee74994a75a y, al recargar el listado, siguió Andy Dwyer · La Ardilla del Martes. Evidencias: evidencias/despues-a01-crear.txt, evidencias/despues-a01-get.txt, evidencias/despues-a01-inexistente.txt, evidencias/ui-recorrido.txt.

### Estado
Resuelto.

## A-02 · La lista no identifica a la criatura
### Síntoma
GET /api/avistamientos devolvía 200, pero cada criatura era solo el id (por ejemplo "65a000000000000000000103"). El detalle del mismo registro sí traía el objeto con nombre. En React, nombreCriatura muestra "ID: …" cuando recibe un string. Evidencia: evidencias/antes-a02-lista.txt y evidencias/antes-a02-detalle.txt.

### Causa
backend/src/services/avistamientos.service.ts poblaba la referencia en obtener y no en listar. El listado hacía lean() del ObjectId y Express lo serializaba como texto, distinto de la forma que la pantalla usa para leer nombre.

### Cambio
listar aplica populate('criatura') antes de lean(), la misma referencia que ya usaba el detalle. Commit 825c45df6af71370cd670fa36b2fcf77af926417.

### Prueba
GET /api/avistamientos: 200 y los cuatro registros semilla traen nombre (La Ardilla del Martes, El Dragón del Estacionamiento, El Brillo del Río Wamapo). La pantalla muestra "April Ludgate · El Brillo del Río Wamapo · Ribera" y el resto de la semilla igual. Una criatura sin avistamientos devolvió {"avistamientos":[],"total":0} y la UI "No hay resultados para esta consulta.", sin pantalla rota. Evidencias: evidencias/despues-a02-lista.txt, evidencias/despues-a02-vacio.txt, evidencias/ui-recorrido.txt.

### Estado
Resuelto.

## A-03 · Se acepta un peligro inválido
### Síntoma
PUT /api/criaturas/65a000000000000000000101 con {"nivelPeligro":7} respondió 200. El mismo recurso con {"nivelPeligro":999} también respondió 200 y el GET posterior conservó 999. Evidencias: evidencias/antes-a03-valido.txt, evidencias/antes-a03-invalido.txt, evidencias/antes-a03-get.txt. Después de reproducirlo se restauró el valor de semilla 2.

### Causa
cuerpo() en backend/src/validacion.ts solo comprobaba que nivelPeligro fuera un número finito, no el rango 1–10. Además, actualizar en backend/src/services/criaturas.service.ts usaba findByIdAndUpdate sin runValidators, así que el min y max del esquema no se aplicaban en la modificación. El min y max del HTML no intervienen en un cliente HTTP.

### Cambio
La validación de la API rechaza un número fuera de 1–10 con "nivelPeligro debe ser un número entre 1 y 10", y la actualización ejecuta los validadores del esquema. Commit 13e6f8a34a664df64a1306c191c9f3181b390a6d.

### Prueba
PUT con nivelPeligro 7: 200. PUT con 999: 400 y el mensaje anterior. GET siguiente: nivelPeligro 7. Luego se restauró la semilla a 2. Evidencias: evidencias/despues-a03-valido.txt, evidencias/despues-a03-invalido.txt, evidencias/despues-a03-get.txt, evidencias/despues-a03-restaurar.txt.

### Estado
Resuelto.

## A-04 · El filtro no actualiza la pantalla
### Síntoma
En Criaturas, la API ya filtraba: tipo=mitica devolvía solo El Dragón del Estacionamiento y tipo=mecanica devolvía total 0. En la pantalla, cambiar el selector de Todos a mitica y luego a mecanica no disparaba esa consulta: la lista seguía con el resultado anterior hasta pulsar Actualizar lista. Evidencias de la API previa: evidencias/antes-a04-mitica.txt y evidencias/antes-a04-mecanica.txt.

### Causa
En frontend/src/paginas/ListaCriaturas.tsx el efecto que llama a listarCriaturas(tipo) dependía solo de recarga. El onChange actualizaba tipo, pero ese estado no volvía a ejecutar la consulta.

### Cambio
El efecto depende de tipo y de recarga. Cambiar el selector inicia la petición; el botón Actualizar lista sigue forzando una recarga. Commit 9b5d3fb2c4eed2ae7d2b2777e99679f033270b5b.

### Prueba
En http://127.0.0.1:5173, sin pulsar Actualizar lista: Todos mostró las tres criaturas; mitica solo El Dragón del Estacionamiento; mecanica el texto "No hay resultados para esta consulta."; volver a Todos restauró las tres. Con el backend detenido, un cambio de consulta mostró "Error: HTTP 500" y, al reiniciarlo y pulsar Actualizar lista, el listado volvió. También se vio "Cargando..." al entrar. Evidencia: evidencias/ui-recorrido.txt.

### Estado
Resuelto.

## Recorrido integrado y regresión
1. Filtro de criaturas por tipo, descrito en A-04.
2. Peligro 7 aceptado y 999 rechazado, con el 7 todavía guardado, descrito en A-03.
3. Alta desde el formulario y detalle, descrito en A-01. El registro 6ad8d6f8bf967ee74994a75a permanece asociado a La Ardilla del Martes.
4. Listado con nombres y recarga, descritos en A-02 y en evidencias/ui-recorrido.txt.
5. Crear criatura "Prueba regresion" (mecanica, peligro 3): 201. GET de un id bien formado inexistente: 404. DELETE de esa criatura de prueba: 204. Evidencias: evidencias/despues-regresion-crear.txt, evidencias/despues-regresion-404.txt, evidencias/despues-regresion-borrar-criatura.txt.
