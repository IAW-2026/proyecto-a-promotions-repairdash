# Promotions App - Repairdash
Esta app corresponde al módulo de promociones y descuentos en el proyecto de tipo **A (Transporte)**. Forma parte la aplicación web Repairdash, enfocada a la intermediación de servicios que conecta personas que necesitan resolver problemas cotidianos del hogar (como arreglos, instalaciones o mantenimiento) con trabajadores u oficios disponibles para realizar esas tareas.

## Deploy
Link de producción: https://proyecto-a-promotions-repairdash.vercel.app/

## Usuarios para evaluar la aplicación
Rider: rider+cerk_test@iaw.com , contraseña: iawuser#
Admin-Promotions: adminpromotions+clerk_test@iaw.com , contraseña: iawuser#


## Instrucciones para evaluar
- Se sugiere iniciar sesión desde un usuario administrador y uno rider en distintas pestañas para el testeo.
- Prestar atención al historial de uso y metricas. 
- Se puede hacer un GET con postman para obtener las promociones disponibles para el usuario mediante la api/promociones.
- Ir a la sección de promociones y ver las promociones ya creadas. Hay promociones de distintos tipos para facilitar el testeo.
- Crear, editar o eliminar promociones desde el admin, deben reflejarse las modificaciones en la sesión del rider tanto como en el resultado del GET en api/promociones.
- "Jugar" con fechas de inicio y finalización de promociones (caducada-programada-vigente).
- "Jugar" con filtros de usuario, y comprobarlo con GET api/promociones o con la interfaz del usuario rider.
- Simular uso de promociones con POST api/historial. 
- Promociones de un unico uso ya no deberían ser devueltas en el GET api/promociones si el usuario las usó.
- Los usos deberían verse reflejado tanto en el historial de usos del admin como del rider.
- Los filtros de usuarios que se basan en cantidad de promociones usadas pueden testearse luego de que el usuario aumente la cantidad de usos.

Archivo con documentación sobre endpoints expuestos: /apis.md


## Descripción
La Promotions App de repairdash muestra una pantalla inicial, para quienes no estan logueados aún, con una vista general de todas las promociones destacadas. Se da la opción de iniciar sesión, y en caso de que el usuario quiera ver todas las promociones también se le solicita iniciar sesión. Solo los usuarios ya registrados con role: rider o role: admin-promotions pueden acceder a la app con su cuenta.
Si el usuario inició sesión y es admin-promotions, tendra una vista general con distintas estadísticas sobre los usos de promociones y las promociones que haya en el sistema. Podrá acceder a una pestaña donde se muestran todas las promociones y puede verlas en detalle, editarlas o eliminarlas. También puede crear promociones nuevas, cada promoción tiene muchos campos a definir sobre en qué casos y para qué usuarios aplica o no. También puede buscar y filtrar las promociones existentes. Por otro lado, el admin-promotions podrá acceder a una pestaña donde se muestra el historial de usos de todos los usuarios, junto con algunas estadísticas como promoción más usada o cantidad de dinero ahorrado en total por todos los usuarios.
Si el usuario que inició sesión es rider, podrá ver en la pantalla de inicio información general sobre promociones destacadas a las que puede aplicar y sus ultimos 3 usos (si es que hay). También puede acceder a la pestaña promociones donde se le muestran todas las que puede usar (a excepción de las que son de único uso, se muestran aunque las haya usado), puede ver el detalle de cada promoción (hay información de las promociones que se decide no mostrar al usuario), buscar promociones y filtrar por tipo de servicio. Además, hay una sección donde puede ver su historial completo de usos de promociones, donde se muestra información sobre cada uso y un balance de total de dinero ahorrado en promociones.
Esta aplicación permite que el usuario conozca las promociones disponibles y que pueda ver información y balance sobre los descuentos que se le han aplicado, pero para poder usarlas debe hacerlo desde la RiderApp y es por eso que se ofrecen atajos a la RiderApp en distintas partes de la app.

## Notas
La aplicación ya obtiene los tipos de servicios que hay en Repairdash de la DriverApp mediante una api que esta expone. En el caso de que los tipos de servicio cambien, las promociones ya creadas mantienen los tipos de servicios que tenían definidos (en el caso de que alguno ya no exista se ignora), si se edita la promoción los mismos se actualizarán.
Si se define el tipo de descuento de una promoción como un monto de descuento, el campo "precio mínimo" pasa a ser obliatorio en lugar de opcional, se debe definir un precio mínimo mayor al monto a descontar.
Al eliminarse usuarios o promociones, no se eliminan completamente de la base de datos para que se mantengan presentes en el historial de uso.
Los usuarios rider no ven las promociones programadas o caducadas, solo las vigentes.


