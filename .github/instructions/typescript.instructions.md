---
description: Cada que se vaya a manipular un archivo de TS se deben seguir las instrucciones
applyTo: '**/*.ts'
---

Evita utilizar el tipo `any` en TypeScript, ya que anula las ventajas de la tipificación estática. En su lugar, define tipos específicos para tus variables y funciones para mejorar la seguridad y la mantenibilidad del código.
Para cada petición HTTP, define una interfaz que describa la estructura de los datos que se esperan recibir o enviar. Esto ayuda a garantizar que los datos sean consistentes y facilita la depuración.
Utiliza bloques try-catch para manejar errores en tus funciones asíncronas. Esto te permitirá capturar y manejar errores de manera efectiva, evitando que el programa se bloquee inesperadamente.
Cuando trabajes con promesas, utiliza `async/await` para mejorar la legibilidad del código. Esto hace que el flujo de control sea más claro y fácil de entender, especialmente cuando se encadenan múltiples operaciones asíncronas.
