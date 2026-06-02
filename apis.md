# Descripción de endpoints expuestos por Promotions App

## GET /api/promociones
Este endpoint es utilizado por la Rider App para obtener las promociones disponibles para cada usuario especIfico.
- Header: x-api-key.
- Parámetros de consulta: usuarioId.
- Parámetros de respuesta: 
        .200 OK: La solicitud fue procesada con éxito. Retorna una estructura JSON que envuelve el listado de promociones aplicables para el usuario. JSON:
            {
            "status": "success",
            "data": [
                {
                "id": l92,
                "nombre": "Descuento Especial Electricidad",
                "tipoDescuento": "%",
                "valor": 15,
                "precioMinimo": 12000,
                "categorias": [
                    "cat_electricidad_id",
                    "cat_mantenimiento_id"
                ]
                }
            ]
            }
        .400 Bad Request: se genera cuando no se pasó el usuarioId en la request:
            {
            "error": "Falta usuarioId"
            }
        .401 Unauthorized: se genera cuando la clave de API provista en la cabecera es incorrecta o no tiene los permisos necesarios para consumir este recurso:
            {
            "error": "No autorizado"
            }
        .500 Internal Server Error: ocurre ante una falla inesperada en los servicios de la base de datos o fallas críticas del servidor:
            {
            "error": "Error interno del servidor" 
            } 

## POST /api/historial
La Rider App notifica el uso de promociones por parte de un usuario.
- Header: x-api-key y Content-Type: application/JSON.
- Parametros de consulta (body):
    {
        "usuarioId": "usr_9521483017",
        "promocionId": 28,
        "trabajoId": 49,
        "valorOriginal": 15000,
        "valorPagado": 12750
    }
- Parámetros de respuesta:
    .201 Created: El registro se creó exitosamente en la base de datos. Retorna los datos del historial generado con su correspondiente ID de auditoría interna. 
        {
        "status": "success",
        "data": {
            "id": 67,
            "usuarioId": "usr_9521483017",
            "promocionId": 51,
            "trabajoId": 88,
            "nombre": "Descuento Especial Electricidad",
            "valorOriginal": 15000,
            "valorPagado": 12750,
            "creadoEn": "2026-05-29T20:50:00.000Z"
            }
        }
    .400 Bad Request: falta 1 o más campos en el JSON de la request:
        {
            "error": "Faltan campos requeridos"
        }
    .401 Unauthorized: se genera cuando la clave de API provista en la cabecera es incorrecta o no tiene los permisos necesarios para consumir este recurso:
        {
            "error": "No autorizado"
        }
    .404 Not Found: El promocionId enviado no coincide con ninguna promoción registrada en el sistema. 
        {
            "error": "Promocion no encontrada"
        }
    .500 Internal Server Error: ocurre ante una falla inesperada en los servicios de la base de datos o fallas críticas del servidor:
        {
            "error": "Error interno del servidor" 
        } 