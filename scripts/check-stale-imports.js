// Importamos el módulo fs nativo de Node para poder interactuar con los archivos del sistema, leer sus contenidos y saber si son carpetas o archivos
const fs = require('fs');
// Importamos el módulo path para armar las rutas de los archivos de forma correcta sin importar si estamos en Windows o Mac
const path = require('path');

// SECCION DE VARIABLES GLOBALES
// Creamos un arreglo vacío llamado stale que nos va a servir para guardar todas las rutas de los archivos que tengan importaciones viejas o incorrectas
const stale = [];

// SECCION PRINCIPAL DE RECORRIDO DE ARCHIVOS
// FUNCION: walk
// Esta función recursiva se encarga de pasear por todas las carpetas del proyecto buscando archivos de TypeScript para analizarlos
function walk(dir) {
  // Leemos todo lo que hay dentro de la carpeta actual y empezamos a revisar elemento por elemento
  for (const f of fs.readdirSync(dir)) {
    // Juntamos la ruta de la carpeta con el nombre del archivo para tener la ruta completa y saber exactamente dónde está
    const full = path.join(dir, f);
    
    // Bloque de validacion de tipo
    // Revisamos si este elemento que estamos tocando es una carpeta
    if (fs.statSync(full).isDirectory()) {
      // Si es una carpeta verificamos que no sea una de las carpetas pesadas o del sistema que no nos interesan como node_modules o .git, y si es una carpeta válida volvemos a llamar a walk para meternos dentro de ella
      if (!['node_modules','.git','.expo','dist','android'].includes(f)) walk(full);
    
    // Si no es una carpeta entonces verificamos si es un archivo de código fuente de TypeScript o React puro
    } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
      // Leemos todo el texto del archivo y lo partimos por cada salto de línea para revisarlo renglón por renglón
      const lines = fs.readFileSync(full,'utf8').split('\n');
      
      // Bloque de analisis de texto
      // Empezamos a revisar cada renglón del archivo junto con su número de línea
      lines.forEach((l,i) => {
        // Usamos una expresión regular súper loca para buscar si en este renglón hay un import viejo que intente traer cosas de carpetas antiguas como logic, lib o styles usando muchos puntitos hacia atrás
        const isStale = /from ['"](\.\.\/)+(logic|lib|styles)\//.test(l) || /require\(['"](\.\.\/)+(logic|lib|styles)\//.test(l);
        
        // Si detectamos que efectivamente es un import viejo o prohibido
        if (isStale) {
          // Guardamos en nuestro arreglo global la ruta del archivo limpio, le pegamos el número de línea exacto y el texto del renglón para saber dónde está el error
          stale.push(full.replace(process.cwd()+path.sep,'') + ':' + (i+1) + ' => ' + l.trim());
        }
      });
    }
  }
}

// SECCION DE EJECUCION
// Arrancamos el paseo por las carpetas diciéndole a la función que empiece desde la raíz del proyecto usando el puntito
walk('.');

// Bloque de resultados
// Imprimimos en la consola todos los errores juntos separados por un salto de línea, pero si el arreglo está vacío y no hay errores lanzamos un mensaje alegre diciendo ALL CLEAN
console.log(stale.length ? stale.join('\n') : 'ALL CLEAN');

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas la función walk? pasa que el script no hará nada y no se revisará ningún archivo del proyecto porque esta es la función central que explora las carpetas
// para solucionarlo debes volver a escribir la función walk con toda su lógica de recursividad
// ¿qué pasa si quitas la variable stale? pasa que el programa va a fallar apenas encuentre un error porque intentará guardar el dato en una lista que no existe
// para solucionarlo vuelve a declarar const stale = [] arriba de la función
// ¿qué pasa si quitas el if que filtra las carpetas node_modules y demas? pasa que el script se quedará trabado horas analizando miles de archivos inútiles de librerías de terceros y la computadora se puede quedar sin memoria
// para solucionarlo vuelve a agregar la condición que excluye esas carpetas pesadas
