@echo off
:: SECCION
:: Este archivo por lotes interactivo sirve para iniciar el empaquetado y cifrado de todo el codigo fuente del proyecto (y luego eliminar las carpetas locales en claro para proteger el entorno y auto-eliminarse de la raiz al terminar)

:: Oculta en pantalla el texto de los comandos que ejecuta el script (para que la terminal tenga una visualizacion limpia y pulida)
@echo off
:: Configura el titulo descriptivo que se mostrara en la barra superior de la consola de Windows
title Cifrar y Bloquear Proyecto - Q Ruta
:: Limpia el contenido previo que haya en la consola de comandos de Windows
cls
:: Cambia el esquema de color de la terminal a texto azul cian claro con fondo negro
color 0B
:: Genera una linea en blanco en la terminal (proporcionando un espacio estetico al texto)
echo.
echo        CIFRAR Y BLOQUEAR EL ENTORNO - Q RUTA
echo.
:: Muestra al desarrollador una advertencia indicando que todo el codigo sera comprimido y cifrado
echo   [SISTEMA] Se empaquetara y cifrara todo el codigo fuente.
echo.
:: Pide al desarrollador una contraseña de seguridad para bloquear el entorno y la guarda en la variable KEY (solicitandola de forma obligatoria)
set /p KEY="  [CLAVE] Ingresa la clave de seguridad para cifrar: "
echo.

:: Compara si la variable KEY esta vacia (en caso de que el programador haya pulsado Enter sin escribir clave alguna) y salta al bloque EMPTY_KEY
if "%KEY%"=="" goto EMPTY_KEY

:: Indica al usuario que se ha iniciado la lectura del arbol de directorios y el proceso criptografico
echo   [PROCESANDO] Empaquetando y cifrando archivos con AES-256...
:: Llama a Node de forma nativa pasandole el argumento 'encrypt' y la clave escrita por el usuario para encriptar la lista de directorios
node scripts\crypt-env.js encrypt "%KEY%"

:: Guarda el codigo de finalizacion de Node (ERRORLEVEL) en la variable EXIT_CODE para evaluar si la operacion fue exitosa
set EXIT_CODE=%ERRORLEVEL%
echo.

:: Evalua si el codigo de salida es 0 (lo cual indica exito total) y salta al bloque de exito
if %EXIT_CODE% equ 0 goto SUCCESS
:: Salta por defecto al bloque de error si el codigo de salida fue diferente a cero (por ejemplo, si faltan carpetas clave para encriptar)
goto ERROR

:: Define la etiqueta que procesa el error cuando el programador no ingresa ninguna clave
:EMPTY_KEY
:: Configura el color de texto a rojo brillante sobre fondo negro
color 0C
:: Informa que es obligatorio escribir una contraseña de seguridad para encriptar
echo   [ERROR] La clave no puede estar vacia.
echo.
:: Advierte al programador que presione una tecla para terminar
echo   Presiona cualquier tecla para salir...
:: Detiene la pantalla esperando la pulsacion de teclado (desviando el mensaje nativo con > nul)
pause > nul
:: Aborta el archivo por lotes saliendo del subproceso actual
exit /b

:: Define the etiqueta para procesar el exito de la encriptacion y purga de carpetas
:SUCCESS
:: Configura el color de texto a verde brillante sobre fondo negro
color 0A
:: Despliega una caja decorativa que confirma que el entorno ha sido encriptado y las carpetas locales en claro eliminadas exitosamente
echo     ¡CIFRADO EXITOSO! Codigo fuente protegido y purgado.
:: Avisa al usuario que el bloqueo de los archivos locales ha concluido con exito
echo   El entorno local ha sido bloqueado de forma segura.
echo.
:: Pide al usuario que pulse una tecla para terminar el proceso de bloqueo
echo   Presiona cualquier tecla para finalizar...
:: Detiene la ejecucion para que el programador pueda ver que se completo al 100 por ciento
pause > nul
:: Comando auto-destructivo que elimina el propio script Bloquear.bat de la raiz del disco para no dejar ningun rastro visible en el entorno (utilizando tecnicas de consola avanzadas)
(goto) 2>nul & del "%~f0"
:: Cierra la consola de comandos de Windows
exit

:: Define la etiqueta para capturar errores inesperados en el cifrado
:ERROR
:: Cambia el color a rojo brillante sobre fondo negro
color 0C
:: Avisa al usuario que ocurrio un error y que verifique si los archivos originales existen en el disco antes de encriptar
echo   [ERROR] Ocurrio un error al intentar cifrar.
:: Detiene el script antes de salir
echo   Asegurate de tener las carpetas visibles en el disco.
echo.
echo   Presiona cualquier tecla para salir...
:: Pausa la ejecucion de la consola
pause > nul
:: Cierra el script
exit

:: ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
:: "si quitas la validacion de clave vacia "%KEY%"=="" pasa que se correra el script de Node con clave nula lo cual lanzara un error de argumento en JS y detendra la operacion de bloqueo"
:: "si quitas la llamada de Node node scripts\crypt-env.js encrypt "%KEY%" pasa que los archivos nunca se encriptaran en src.enc ni se eliminaran del disco (dejando el entorno totalmente desprotegido)"
:: "si quitas la captura de ERRORLEVEL en EXIT_CODE pasa que el programa no podra determinar si el motor de encriptacion concluyo con exito o con errores (pudiendo simular un exito falso)"
:: "si quitas la instruccion auto-destructiva (goto) 2>nul & del "%~f0" pasa que el archivo Bloquear.bat permanecera fisicamente en la raiz del disco (permitiendo que cualquiera vea los nombres de las carpetas protegidas y debilitando la estetica de limpieza del repositorio)"
:: "si quitas la pausa pause > nul del bloque de exito pasa que el archivo bat se cerrara y auto-destruira de inmediato sin dar oportunidad al desarrollador de verificar si se realizo correctamente"
