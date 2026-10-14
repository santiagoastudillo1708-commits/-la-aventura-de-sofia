# La Aventura de Sofía 🦄

Prototipo PWA infantil en español, hecho con HTML, CSS y JavaScript. Incluye inicio, minijuegos, rutina visual, Luna, el unicornio que habla con voz del navegador, minijuegos con frases narradas, canción hablada, jardín de recompensas y modo familia.

## Requisitos
- Navegador moderno (Chrome, Edge, Firefox o Safari reciente).
- Para instalar como PWA y usar el modo sin conexión, ejecutar desde `localhost` o servir mediante HTTPS. Abrir `index.html` directamente permite probar casi todas las funciones, pero el service worker/PWA no se activa en `file://`.

## Ejecutar en computadora
1. Descomprime el ZIP.
2. Abre una terminal en la carpeta `la_aventura_de_sofia`.
3. Ejecuta:
   - Windows: `py -m http.server 8000`
   - macOS/Linux: `python3 -m http.server 8000`
4. Abre `http://localhost:8000`.

## Probar en Android
- Para una prueba rápida en la misma computadora, abre `http://localhost:8000`.
- Para usarlo desde el teléfono, ambos dispositivos deben estar en la misma red Wi-Fi y debes abrir `http://IP-DE-TU-COMPUTADORA:8000`; algunos navegadores restringen instalación y funciones fuera de HTTPS/localhost. Para instalar en Android de forma fiable, publica la carpeta en un hosting HTTPS estático o configura HTTPS local.
- En Chrome, con HTTPS, abre el menú y elige “Instalar aplicación” o “Añadir a pantalla de inicio”.

## Funciones
- Navegación real entre pantallas.
- Minijuegos para hablar de señales corporales y practicar cómo avisar.
- Rutina visual con casillas interactivas.
- Luna habla mediante `speechSynthesis`, prioriza una voz en español de México si está instalada y anima al unicornio mientras habla. También narra indicaciones de los minijuegos y la canción; los efectos suaves se generan localmente.
- Recompensas no competitivas y jardín.
- Modo familia con pregunta matemática básica para evitar entradas accidentales.
- Registro local opcional, exportación JSON, borrado de datos y recordatorios mientras la app permanece abierta.
- Service worker con caché básico para archivos principales.

## Privacidad y límites
- No hay cuentas, anuncios, analítica ni llamadas a un servidor de datos.
- Los datos se guardan en `localStorage` de ese navegador/dispositivo. No se sincronizan entre computadora y celular. Si se borra el almacenamiento del navegador, se pueden perder.
- La pregunta matemática del modo familia no es una medida de seguridad robusta.
- Los recordatorios solo aparecen mientras la app está abierta y no está oculta; no son notificaciones del sistema.
- La voz depende de las voces que ofrezcan Chrome y el sistema del dispositivo. No incluye una voz profesional grabada ni música cantada; la canción se recita con voz sintética. Si no hay síntesis de voz disponible, la app muestra el texto en pantalla.
- Las ilustraciones de esta primera versión usan emojis y CSS, así que su apariencia varía según el sistema.

## Prueba rápida
1. Pulsa “¡Vamos a jugar!”.
2. Abre “Las señales del cuerpo”, elige una opción y pulsa “¡Lo practiqué!”.
3. Abre “Aprendo a avisar”, selecciona una frase y completa la práctica.
4. Revisa el jardín: las recompensas deben aumentar.
5. Entra en “Familia”, resuelve la suma y guarda un registro.
6. Exporta el JSON y, si quieres probar el reinicio, borra los datos locales.

## Nota de uso
Es una herramienta de apoyo lúdico, no un dispositivo médico ni un sustituto del acompañamiento adulto. No presiona, castiga ni compara. Celebra la práctica y los intentos, no solo el resultado de ir al baño.


## Versión 3: Sofía y Luna
La pantalla de bienvenida muestra una ilustración de cuento de Sofía y Luna. El archivo `sofia-y-luna.png` debe permanecer junto a `index.html`. La voz usa la voz en español disponible en el navegador; el tono se ajusta, pero la voz exacta depende del dispositivo.


## Voz de Luna (versión 4)
La aplicación intenta priorizar voces en español de México disponibles en el dispositivo y ofrece un selector para elegir y probar las voces detectadas. La voz se sintetiza mediante la función de voz del navegador; no es una grabación infantil personalizada y el timbre exacto depende de las voces instaladas en el teléfono. Ajustes por defecto: velocidad lenta y tono más agudo para un efecto tierno.


## Versión 5: nuevas actividades
Esta versión añade:
- Jardín mágico interactivo con botón para regar y descubrir flores.
- Juego visual «¿Qué me dice mi cuerpo?» con opción para pedir ayuda o decir que no se está seguro.
- Misión del baño con cinco pasos, sin exigir que la niña haga pipí para completar la actividad.
- Juego de memoria de tres parejas, sin cronómetro.
- Vestidor de Sofía con cuatro temas visuales y elección guardada en el dispositivo.

Las recompensas celebran explorar y practicar, nunca el resultado fisiológico. La aplicación continúa guardando datos en el navegador local. Para publicar la actualización, reemplaza los archivos del sitio con los de esta carpeta, incluyendo `sofia-y-luna.png`, `styles.css`, `app.js`, `index.html` y `sw.js`.
