---
description: Cuando se trabaje con archivos .Vue y elementos relacionados al framework como composables, estados y routers
applyTo: '**/*.vue' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

La estructura del proyecto a seguir es basada en la arquitectura de módulos, donde cada módulo representa una funcionalidad específica de la aplicación. Cada módulo debe contener sus propios componentes, composables, estados y rutas relacionados. Esto permite una mejor organización del código y facilita el mantenimiento a largo plazo.

Al trabajar con archivos .Vue, es importante seguir las mejores prácticas de Vue.js, como el uso de la composición API para organizar la lógica del componente, la separación de responsabilidades entre la plantilla, el script y los estilos, y la utilización de props y eventos para la comunicación entre componentes.

Las clases CSS aplicadas a los elementos deben seguir la convención de nomenclatura BEM (Block, Element, Modifier) para mantener la consistencia y claridad en el código. Esto facilita la comprensión de la estructura del componente y mejora la mantenibilidad del código a medida que el proyecto crece.

Cada que un componente requiera de un tipo específico, se debe crear un archivo de tipos en la carpeta correspondiente al módulo. Esto ayuda a mantener el código organizado y facilita la reutilización de tipos en diferentes partes del proyecto. Además, se recomienda utilizar TypeScript para aprovechar las ventajas de la tipificación estática y mejorar la calidad del código.
