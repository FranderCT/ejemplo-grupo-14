# Grupo 14 - Frontend Performance

## Integrantes
- Frander Carrillo Torres
- Axel Castillo Zúñiga
- Axel Ramos Villegas

## Tema asignado
Optimizacion de rendimiento en frontend mediante `debounce`, `throttle` y `lazy loading`.

## Problema planteado
En aplicaciones web modernas es comun trabajar con eventos que se disparan muchas veces en muy poco tiempo, por ejemplo al escribir en un buscador, al hacer scroll o al mostrar listas con muchas imagenes. Si estos eventos no se controlan, el navegador ejecuta demasiadas operaciones, consume mas recursos y la experiencia de usuario se vuelve mas lenta.

Para resolver ese problema, desarrollamos una interfaz que simula un caso real: la consulta y visualizacion de un catalogo de vehiculos obtenido desde una API. Sobre este escenario aplicamos tres tecnicas de optimizacion de rendimiento:

1. `Debounce` para evitar ejecutar la busqueda en cada tecla presionada.
2. `Throttle` para limitar la frecuencia con la que se procesa el evento de scroll.
3. `Lazy loading` para cargar las imagenes de los vehiculos solo cuando entran al viewport.

## Solucion implementada
El proyecto consiste en una pagina web con tres secciones practicas:

### 1. Busqueda de vehiculos con debounce
Se implemento un campo de busqueda que filtra la lista de vehiculos por identificador o placa. En lugar de ejecutar el filtro en cada pulsacion, la funcion espera `400 ms` despues de que el usuario deja de escribir. Esto reduce llamadas innecesarias y evita recalculos continuos en la interfaz.

### 2. Evento de scroll con throttle
Se agrego una caja con scroll para demostrar que este tipo de evento puede dispararse decenas o cientos de veces por segundo. Con `throttle`, el manejador solo se ejecuta una vez cada `300 ms`, lo que permite controlar la carga de trabajo sin perder la respuesta visual del sistema.

### 3. Tarjetas de vehiculos con lazy loading
La lista de vehiculos se renderiza en tarjetas con imagen. En vez de descargar todas las imagenes al cargar la pagina, se usa `IntersectionObserver` para asignar la URL real solo cuando cada imagen entra en la zona visible del usuario. Mientras tanto, se muestra un placeholder. Esto mejora el tiempo de carga inicial y reduce el uso de red.

## Decisiones tecnicas tomadas
- Se utilizo una API real de vehiculos para que el ejemplo resolviera un problema cercano a un escenario de produccion y no un caso trivial.
- Se separaron las funciones `debounce`, `throttle` y `lazyObserver` para que el codigo fuera reutilizable y facil de explicar durante la exposicion.
- Se normalizo la respuesta de la API en la funcion `init()` para soportar distintos formatos de datos sin romper el renderizado.
- Se uso `IntersectionObserver` porque es una solucion moderna y eficiente para lazy loading, superior a monitorear scroll manualmente.
- Se incluyeron mensajes visuales en pantalla para evidenciar en vivo cuando se activa cada tecnica.

## Aplicacion a un problema real
Estas tecnicas se usan constantemente en proyectos reales:

- `Debounce`: buscadores, autocompletado, validacion de formularios, filtros en tablas.
- `Throttle`: eventos de scroll, resize, seguimiento de posicion o dashboards en tiempo real.
- `Lazy loading`: galerias, ecommerce, catalogos, redes sociales y cualquier interfaz con muchas imagenes o tarjetas.

En nuestro caso, el ejemplo representa una interfaz de consulta de vehiculos donde el usuario necesita buscar rapidamente, desplazarse por contenido y cargar imagenes de forma eficiente sin afectar el rendimiento.

## Estructura del proyecto
- `index.html`: contiene la interfaz visual y las secciones de demostracion.
- `script.js`: contiene la logica de consumo de API, renderizado y las implementaciones de `debounce`, `throttle` y `lazy loading`.

## Como funciona la demostracion
1. Al cargar la pagina, se consultan los vehiculos desde la API y se generan las tarjetas.
2. El usuario escribe en el buscador y el filtrado solo se ejecuta cuando deja de escribir por un breve tiempo.
3. El usuario hace scroll dentro de la caja de prueba y el contador muestra que los eventos no se procesan todos, sino de manera limitada.
4. Al desplazarse por la lista, las imagenes se cargan unicamente cuando entran en pantalla.

## Conclusion
La solucion desarrollada demuestra que `debounce`, `throttle` y `lazy loading` no son conceptos teoricos aislados, sino tecnicas practicas para mejorar el rendimiento y la experiencia de usuario en aplicaciones web modernas. Nuestro ejemplo resuelve un problema real de visualizacion y busqueda de datos, mantiene el codigo ordenado y permite explicar claramente el valor de cada tecnica durante la exposicion y la demostracion en vivo.
