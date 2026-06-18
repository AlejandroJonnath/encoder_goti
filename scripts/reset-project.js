#!/usr/bin/env node

// SECCION INICIAL DE DOCUMENTACION
// Este script sirve como una herramienta rápida para reiniciar el proyecto y dejarlo en un estado en blanco como recién creado
// Básicamente borra o mueve carpetas clave como app components hooks scripts y constants hacia una nueva carpeta llamada app-example dependiendo de lo que responda el usuario, y luego crea una carpeta app nuevecita con un index y un layout básicos
// Una vez que uses este script puedes borrarlo con total seguridad para que no estorbe en el proyecto

// SECCION DE IMPORTACIONES
// Importamos el módulo fs de Node para poder manipular archivos y carpetas directamente en el disco duro
const fs = require("fs");
// Importamos el módulo path para armar rutas de archivos sin tener problemas entre Windows o Mac
const path = require("path");
// Importamos el módulo readline para poder hacerle preguntas al usuario directamente en la consola y leer su respuesta
const readline = require("readline");

// SECCION DE VARIABLES GLOBALES
// Obtenemos la ruta raíz desde donde se está ejecutando este comando en la terminal
const root = process.cwd();
// Definimos una lista con los nombres exactos de las carpetas viejas que queremos mover o eliminar del proyecto
const oldDirs = ["app", "components", "hooks", "constants", "scripts"];
// Definimos el nombre de la carpeta de destino donde se guardará la copia de seguridad de las cosas viejas si el usuario así lo decide
const exampleDir = "app-example";
// Definimos el nombre de la carpeta nueva que será el corazón de nuestra app limpia
const newAppDir = "app";
// Combinamos la ruta raíz con el nombre de la carpeta de ejemplo para tener la ruta absoluta y exacta donde la vamos a ubicar
const exampleDirPath = path.join(root, exampleDir);

// Bloque de plantillas de código
// Guardamos en una variable de texto gigante el código base súper sencillo que tendrá nuestro nuevo archivo index para que no esté vacío
const indexContent = `import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
`;

// Guardamos en otra variable el código mínimo necesario para que funcione la navegación en el nuevo layout de la app
const layoutContent = `import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
`;

// SECCION DE INTERACCION CON EL USUARIO
// Configuramos el lector de línea de comandos conectándolo a la entrada y salida estándar de la consola para que podamos hablar con el usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// FUNCION: moveDirectories
// Esta es la función principal que hace todo el trabajo pesado de mover o borrar las carpetas dependiendo de si el usuario dijo que sí o que no
const moveDirectories = async (userInput) => {
  // Envolvemos todo en un bloque try para que si algo explota podamos atrapar el error sin que se cierre el programa bruscamente
  try {
    // Bloque de creación de copia de seguridad
    // Verificamos si el usuario respondió que sí quiere hacer un respaldo de sus archivos
    if (userInput === "y") {
      // Creamos la carpeta app-example usando el sistema de archivos asíncrono y le decimos que cree carpetas intermedias si hacen falta
      await fs.promises.mkdir(exampleDirPath, { recursive: true });
      // Le avisamos al usuario por consola que la carpeta ya fue creada exitosamente
      console.log(`📁 /${exampleDir} directory created.`);
    }

    // Bloque de procesado de carpetas antiguas
    // Empezamos a iterar una por una todas las carpetas viejas que listamos arriba
    for (const dir of oldDirs) {
      // Armamos la ruta exacta donde debería estar esta carpeta vieja
      const oldDirPath = path.join(root, dir);
      // Verificamos si realmente existe esa carpeta en el proyecto para no intentar borrar un fantasma
      if (fs.existsSync(oldDirPath)) {
        // Si la carpeta existe y además el usuario pidió respaldo
        if (userInput === "y") {
          // Armamos la ruta nueva hacia donde la vamos a mover adentro de app-example
          const newDirPath = path.join(root, exampleDir, dir);
          // Cambiamos el nombre o la movemos de lugar mágicamente con el método rename
          await fs.promises.rename(oldDirPath, newDirPath);
          // Le avisamos al usuario que esa carpeta en particular ya fue movida y está a salvo
          console.log(`➡️ /${dir} moved to /${exampleDir}/${dir}.`);
        // En caso de que el usuario haya dicho que no quiere respaldos
        } else {
          // Destruimos la carpeta sin piedad junto con todo lo que tenga adentro forzando la eliminación
          await fs.promises.rm(oldDirPath, { recursive: true, force: true });
          // Le avisamos al usuario que la carpeta ha sido eliminada por completo
          console.log(`❌ /${dir} deleted.`);
        }
      // Si resulta que la carpeta nunca existió en primer lugar
      } else {
        // Solo le avisamos al usuario que la saltamos porque no había nada que hacer ahí
        console.log(`➡️ /${dir} does not exist, skipping.`);
      }
    }

    // Bloque de construcción del nuevo entorno
    // Calculamos la ruta absoluta de donde va a ir nuestra nueva y reluciente carpeta app
    const newAppDirPath = path.join(root, newAppDir);
    // Creamos la nueva carpeta app vacía en la raíz del proyecto
    await fs.promises.mkdir(newAppDirPath, { recursive: true });
    // Le decimos al usuario que la nueva carpeta app ya está lista
    console.log("\n📁 New /app directory created.");

    // Armamos la ruta para crear el archivo index dentro de la nueva carpeta app
    const indexPath = path.join(newAppDirPath, "index.tsx");
    // Escribimos el código de plantilla que guardamos arriba directamente en ese archivo nuevo
    await fs.promises.writeFile(indexPath, indexContent);
    // Le avisamos al usuario que su archivo index ya fue creado con éxito
    console.log("📄 app/index.tsx created.");

    // Armamos la ruta para el archivo de diseño layout también dentro de la nueva carpeta app
    const layoutPath = path.join(newAppDirPath, "_layout.tsx");
    // Escribimos la plantilla de layout adentro del archivo
    await fs.promises.writeFile(layoutPath, layoutContent);
    // Le avisamos al usuario que su layout inicial ya está listo para usarse
    console.log("📄 app/_layout.tsx created.");

    // Bloque de mensajes finales
    // Imprimimos unas instrucciones amistosas para que el usuario sepa cuáles son los siguientes pasos a seguir
    console.log("\n✅ Project reset complete. Next steps:");
    // Mostramos comandos recomendados como encender el servidor o borrar el respaldo si es que lo hizo
    console.log(
      `1. Run \`npx expo start\` to start a development server.\n2. Edit app/index.tsx to edit the main screen.${
        userInput === "y"
          ? `\n3. Delete the /${exampleDir} directory when you're done referencing it.`
          : ""
      }`
    );
  // Si en algún momento algo falla capturamos el error aquí
  } catch (error) {
    // Le mostramos al usuario exactamente qué salió mal para que pueda investigar el problema
    console.error(`❌ Error during script execution: ${error.message}`);
  }
};

// SECCION DE INICIO DE EJECUCION
// Le lanzamos la pregunta al usuario en la consola preguntándole si quiere mover los archivos o borrarlos directamente
rl.question(
  "Do you want to move existing files to /app-example instead of deleting them? (Y/n): ",
  (answer) => {
    // Limpiamos los espacios en blanco de lo que haya escrito y lo pasamos a minúsculas, y si no escribió nada asumimos que es un 'y' por defecto
    const userInput = answer.trim().toLowerCase() || "y";
    // Verificamos que haya respondido con un simple 'y' o 'n' y no con algo raro
    if (userInput === "y" || userInput === "n") {
      // Llamamos a la súper función para que haga su trabajo y cuando termine o falle cerramos la interfaz de la consola usando finally
      moveDirectories(userInput).finally(() => rl.close());
    // Si escribió cualquier otra cosa que no sea y o n
    } else {
      // Le regañamos amistosamente diciéndole que su entrada es inválida y debe usar Y o N
      console.log("❌ Invalid input. Please enter 'Y' or 'N'.");
      // Cerramos la lectura de la consola para no dejar el proceso colgado
      rl.close();
    }
  }
);

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si quitas la función moveDirectories? pasa que aunque el usuario responda a la pregunta no ocurrirá absolutamente nada y el proyecto seguirá intacto porque esta función contiene toda la lógica de mover y crear archivos
// para solucionarlo debes restaurar la función completa con su bloque try-catch y sus ciclos for
// ¿qué pasa si quitas la constante oldDirs? pasa que el script no sabrá qué carpetas tiene que limpiar y fallará al intentar iterar una lista inexistente, dejando tu proyecto con archivos basura mezclados
// para solucionarlo vuelve a definir la lista const oldDirs = ["app", "components", "hooks", "constants", "scripts"]; en la parte superior
// ¿qué pasa si quitas el bloque rl.question? pasa que el script terminará instantáneamente sin preguntarle nada al usuario y sin ejecutar ninguna acción porque esta es la chispa que enciende el proceso
// para solucionarlo vuelve a poner rl.question con su callback para recibir la respuesta del usuario
