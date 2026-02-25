---
description: Cuando se trabaje con archivos .Vue y elementos relacionados al framework como composables, estados y routers
applyTo: '**/*.vue' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

La estructura del proyecto a seguir es basada en la arquitectura de módulos, donde cada módulo representa una funcionalidad específica de la aplicación. Cada módulo debe contener sus propios componentes, composables, estados y rutas relacionados. Esto permite una mejor organización del código y facilita el mantenimiento a largo plazo.

Al trabajar con archivos .Vue, es importante seguir las mejores prácticas de Vue.js, como el uso de la composición API para organizar la lógica del componente, la separación de responsabilidades entre la plantilla, el script y los estilos, y la utilización de props y eventos para la comunicación entre componentes.

Las clases CSS aplicadas a los elementos deben seguir la convención de nomenclatura BEM (Block, Element, Modifier) para mantener la consistencia y claridad en el código. Esto facilita la comprensión de la estructura del componente y mejora la mantenibilidad del código a medida que el proyecto crece.

Cada que un componente requiera de un tipo específico, se debe crear un archivo de tipos en la carpeta correspondiente al módulo. Esto ayuda a mantener el código organizado y facilita la reutilización de tipos en diferentes partes del proyecto. Además, se recomienda utilizar TypeScript para aprovechar las ventajas de la tipificación estática y mejorar la calidad del código.

Para cada componente que crees necesitas basarte en crear diseños minimalistas, basados en los colores ya definidos en el archivo App.vue, utilizando la paleta de colores definida en el proyecto. Esto asegura una apariencia coherente en toda la aplicación y mejora la experiencia del usuario. Además, se recomienda utilizar componentes reutilizables y evitar la duplicación de código para mantener el proyecto limpio y fácil de mantener.

Manten los componentes compactos y enfocados en una sola responsabilidad. Si un componente se vuelve demasiado grande o complejo, considera dividirlo en componentes más pequeños y reutilizables. Esto facilita la comprensión del código y mejora la mantenibilidad a largo plazo.
