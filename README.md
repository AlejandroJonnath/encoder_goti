# EncoderGoti

Bienvenido a **EncoderGoti**, una aplicación móvil integral desarrollada con React Native (Expo) diseñada para la gestión, transformación, análisis y firma de documentos de manera eficiente.

## 1. ¿Qué hace este proyecto? (Introducción)
EncoderGoti es una solución "Todo en Uno" para el manejo de archivos. Su objetivo principal es facilitar a los usuarios la manipulación de documentos directamente desde su dispositivo móvil sin depender de computadoras de escritorio. Permite realizar conversiones complejas entre formatos, compresión y unión de PDFs, análisis mediante Inteligencia Artificial y la aplicación de firmas electrónicas avanzadas mediante certificados `.p12`.

Al estar construido sobre Expo y React Native, ofrece una experiencia nativa fluida, mientras delega las operaciones más pesadas y criptográficas a APIs externas y un backend especializado para asegurar rendimiento, seguridad y confiabilidad.

---

## 2. Funcionalidades Principales

###  Convertidores
La aplicación incluye un motor dinámico para transformar archivos de un formato a otro manteniendo la estructura y calidad:
*   **A PDF:** Conversión desde Word (`.doc`, `.docx`), Excel (`.xls`, `.xlsx`), PowerPoint (`.ppt`, `.pptx`), Imágenes (`.jpg`, `.png`), HTML y TXT.
*   **Desde PDF:** Transformación de documentos PDF a Word, Excel o Imágenes.

###  Herramientas de Gestión
Utilidades esenciales para la manipulación y seguridad de los documentos:
*   **Firma Electrónica:** Permite a los usuarios cargar un documento PDF y firmarlo digitalmente utilizando un certificado criptográfico `.p12` y su respectiva contraseña, dándole validez legal.
*   **Compresión de PDF:** Reduce significativamente el tamaño de documentos pesados para facilitar su envío.
*   **Fusión de PDF:** Permite unir múltiples archivos PDF en un solo documento consolidado.
*   **Selector de Archivos (Document Picker) y Compartición:** Interfaces nativas para buscar archivos en el dispositivo y compartir el resultado final (WhatsApp, correo, etc.).

###  Inteligencia Artificial
Integración con modelos de IA para expandir las capacidades del documento:
*   Extracción, análisis y procesamiento automatizado del texto y contenido de los documentos utilizando servicios de IA externos configurados en el proyecto.

---

## 3. Estructura de Carpetas

El proyecto sigue una arquitectura limpia para separar la UI de la lógica de negocio y las integraciones:

*   **`app/`**: Contiene todas las pantallas y rutas de la aplicación utilizando **Expo Router**. Aquí vive la interfaz gráfica, organizada en pestañas y flujos de autenticación.
*   **`logic/`**: El "cerebro" de la UI. Contiene *Custom Hooks* de React que manejan el estado, los procesos de carga y la ejecución de las funciones, manteniendo los componentes visuales limpios.
*   **`lib/`**: Archivos de integración con servicios y APIs de terceros. Es la capa de comunicación de red de la aplicación.
*   **`components/`**: Componentes visuales reutilizables a lo largo de la app (botones personalizados, inputs, modales, tarjetas).
*   **`assets/`**: Archivos estáticos como imágenes, iconos, fuentes personalizadas y gráficos.
*   **`constants/`**: Variables constantes, colores del tema, tipografías y configuraciones globales para mantener una estética unificada.
*   **`hooks/`**: Hooks genéricos de React que no están estrictamente ligados a una lógica de negocio específica.
*   **`scripts/`**: Scripts de automatización o tareas secundarias.
*   **`styles/`**: Hojas de estilo globales.

---

## 4. Archivos Clave del Proyecto

### En la carpeta `logic/` (Lógica de Negocio)
*   **`useConvertLogic.ts`**: Controla el flujo completo de los convertidores. Maneja la selección del archivo, lo sube al servicio en la nube, espera la conversión, extrae el nombre original, lo descarga con la nueva extensión y permite compartirlo.
*   **`useSignLogic.ts`**: Gestiona el flujo crítico de la firma electrónica. Pide el documento y el archivo `.p12`, captura de forma segura la contraseña y orquesta la petición al backend de firma para obtener el documento sellado.

### En la carpeta `lib/` (Integraciones)
*   **`pdfco.ts`**: Cliente configurado para comunicarse con la API de PDF.co. Contiene los métodos específicos para subir, convertir, comprimir y unir archivos en la nube.
*   **`p12.ts` / `docuseal.ts`**: Clientes encargados de mandar los payloads (documentos y credenciales) hacia los servicios o el backend personalizado de firmado.
*   **`ai.ts`**: Módulo que gestiona los prompts y las respuestas de los servicios de Inteligencia Artificial.

### En la carpeta `app/` (Rutas)
*   **`_layout.tsx`**: El archivo raíz de navegación que define la estructura principal de la app (Stack principal, modales, y proveedores globales de contexto).

---

## 5. ¿Qué pasa si eliminas estas carpetas o archivos?

*   **Si borras `app/`**: La aplicación se quedará sin interfaz gráfica. Al iniciar, React Native no encontrará ninguna pantalla que renderizar y arrojará un error fatal.
*   **Si borras `logic/`**: Las pantallas seguirán existiendo visualmente, pero los botones "no harán nada". Se perderá todo el manejo de estado, por lo que la aplicación quedará completamente inútil e inoperable (rompiendo los imports de las vistas).
*   **Si borras `lib/`**: La app perderá su capacidad de comunicarse con el mundo exterior. Ninguna conversión se realizará, la firma fallará por falta de conexión al backend y la IA no responderá, ya que se habrán borrado los clientes HTTP.

---

## 6. APIs Externas y Backend de Firma Electrónica

### APIs Utilizadas
*   **PDF.co**: Se utilizó para delegar toda la manipulación pesada de archivos (conversión, fusión, compresión). Hacer esto de manera local en un dispositivo móvil consumiría demasiada memoria, podría crashear la app y requeriría librerías nativas complejas.
*   **Supabase**: Empleado para la autenticación de usuarios y la base de datos en tiempo real (según esquema de backend).

### ¿Por qué un Backend aparte (Node.js) para la Firma Electrónica?
Firmar un PDF con un certificado criptográfico `.p12` requiere de operaciones de bajo nivel (manipulación de buffers, encriptación RSA/SHA-256) que **React Native no maneja bien de forma nativa** sin exponerse a brechas de seguridad o problemas de compatibilidad con librerías pesadas como `node-forge`. 
Se diseñó un backend externo en Node.js (`signer.js`) porque ofrece un entorno seguro, robusto y rápido con acceso directo al módulo `crypto` de Node, garantizando que la contraseña y el certificado se procesen correctamente y la firma digital se estampe en el PDF de acuerdo con los estándares legales.

---

## 7. Lo más importante del proyecto

El mayor valor de **EncoderGoti** radica en su **Arquitectura Modular (Separación de Responsabilidades)**. 
Al dividir el código estrictamente en **Vistas (`app/`)**, **Cerebro/Estado (`logic/`)** y **Servicios (`lib/`)**, la aplicación logra ser extremadamente escalable y fácil de mantener. 

Esta estructura permite ofrecer capacidades empresariales altamente complejas (manipulación de miles de tipos de archivos, criptografía de nivel legal para firmas e inteligencia artificial) dentro de una aplicación móvil que se siente rápida y ligera para el usuario final, todo gracias a una excelente orquestación entre la UI en el dispositivo y el procesamiento en la nube.
