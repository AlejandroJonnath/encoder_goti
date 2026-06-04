import axios from 'axios';
import { uploadAsync } from 'expo-file-system/legacy';

// Sección: Este archivo contiene todas las funciones que se comunican con la nube de PDF.co para subir manipular transformar y leer archivos PDF y documentos

// Funciones: getPresignedUrl sirve para pedirle permiso a PDF.co para subir un archivo temporal a sus servidores
// Funciones: uploadFileToPdfco sirve para agarrar un archivo de nuestro celular y enviarlo hacia la nube de PDF.co
// Funciones: convertDocumentToPdf sirve para mandar un documento de word y que la nube lo devuelva en formato PDF
// Funciones: convertImageToPdf sirve para transformar una simple imagen (jpg o png) en un documento PDF
// Funciones: convertHtmlToPdf sirve para pasar código de páginas web a formato PDF
// Funciones: compressPdf sirve para reducir el peso de un PDF grande sin perder mucha calidad
// Funciones: mergePdfs sirve para agarrar varios PDFs separados y unirlos en un solo documento final
// Funciones: extractTextFromPdf sirve para sacar las letras de un PDF de manera que podamos dárselas a leer a la inteligencia artificial

// Obtenemos la llave secreta para usar la API de PDF.co desde nuestro entorno
const PDFCO_API_KEY = process.env.EXPO_PUBLIC_PDFCO_API_KEY;

// Función interna que negocia con el servidor antes de subir algo
async function getPresignedUrl(fileName: string) {
  // Le pedimos al servidor que nos dé un enlace temporal válido para subir un archivo con este nombre específico
  const response = await axios.get(`https://api.pdf.co/v1/file/upload/get-presigned-url?name=${encodeURIComponent(fileName)}`, {
    // Pasamos nuestra llave secreta
    headers: { 'x-api-key': PDFCO_API_KEY }
  });
  // Si la API nos contesta con un mensaje de error nosotros paramos todo y mostramos la falla
  if (response.data.error) throw new Error(response.data.message);
  // Regresamos el objeto que contiene tanto la URL para subir el archivo como la URL de donde quedará guardado
  return response.data;
}

// Función que ejecuta la subida del archivo a internet
export async function uploadFileToPdfco(fileUri: string, fileName: string) {
  // Primero llamamos a la función anterior para que nos pase las direcciones
  const { presignedUrl, url } = await getPresignedUrl(fileName);
  
  // Usamos el gestor de archivos de Expo para empezar a enviar el documento pesado hacia la URL temporal (presignedUrl)
  const uploadResult = await uploadAsync(presignedUrl, fileUri, {
    // Usamos el método PUT que significa que vamos a colocar el archivo ahí
    httpMethod: 'PUT',
    // Le volvemos a pasar la llave por si acaso la necesita el servidor de almacenamiento
    headers: {
      'x-api-key': PDFCO_API_KEY || '',
    }
  });

  // Revisamos si el código de la respuesta es distinto a 200 (que significa OK)
  if (uploadResult.status !== 200) {
    // Si no es OK lanzamos un error y le avisamos al usuario que falló la subida
    throw new Error('Error al subir el archivo a PDF.co');
  }

  // Si todo salió bien le devolvemos a la aplicación el link de donde vive el archivo en la nube (url)
  return url;
}

// Función que manda un archivo Word a los servidores para volverlo PDF
export async function convertDocumentToPdf(fileUrl: string, name: string) {
  // Hacemos una petición a la ruta específica de conversión de documentos
  const response = await axios.post('https://api.pdf.co/v1/pdf/convert/from/doc', {
    // Le decimos dónde está el archivo que acabamos de subir
    url: fileUrl,
    // Le decimos qué nombre le queremos poner al nuevo PDF
    name: name,
  }, {
    // Nos identificamos con la llave maestra
    headers: { 'x-api-key': PDFCO_API_KEY }
  });
  // Validamos si la API de PDF.co tuvo algún problema durante la conversión
  if (response.data.error) throw new Error(response.data.message);
  // Le entregamos a la app el enlace del PDF que nos acaban de generar
  return response.data.url;
}

// Función que manda imágenes a la nube para hacerlas PDF
export async function convertImageToPdf(fileUrl: string, name: string) {
  // Petición a la ruta que convierte imágenes
  const response = await axios.post('https://api.pdf.co/v1/pdf/convert/from/image', {
    // La dirección de la imagen subida
    url: fileUrl,
    // El nombre que tendrá nuestro archivo final
    name: name,
  }, {
    // Nuestra llave para que no nos reboten
    headers: { 'x-api-key': PDFCO_API_KEY }
  });
  // Si la nube nos reporta un error abortamos y lanzamos la alerta
  if (response.data.error) throw new Error(response.data.message);
  // Regresamos la dirección del archivo convertido
  return response.data.url;
}

// Función que procesa enlaces web o código de páginas para volverlo PDF
export async function convertHtmlToPdf(fileUrl: string, name: string) {
  // Petición al servicio experto en HTML de PDF.co
  const response = await axios.post('https://api.pdf.co/v1/pdf/convert/from/html', {
    // El enlace o archivo con el código
    url: fileUrl,
    // El título de salida
    name: name,
  }, {
    // Pasamos credenciales de acceso
    headers: { 'x-api-key': PDFCO_API_KEY }
  });
  // Verificación rutinaria de fallas en el servicio
  if (response.data.error) throw new Error(response.data.message);
  // Devolvemos el PDF que se armó a partir del código web
  return response.data.url;
}

// Función que le pide al servidor de PDF.co que apriete el archivo para que pese menos
export async function compressPdf(fileUrl: string) {
  // Mandamos un POST a la ruta de optimización
  const response = await axios.post('https://api.pdf.co/v1/pdf/optimize', {
    // Indicamos el archivo que queremos adelgazar
    url: fileUrl,
  }, {
    // Llave de seguridad
    headers: { 'x-api-key': PDFCO_API_KEY }
  });
  // Checamos que no nos regresen un error como que el archivo estaba encriptado o algo así
  if (response.data.error) throw new Error(response.data.message);
  // Pasamos de regreso la url del archivo más liviano
  return response.data.url;
}

// Función que toma varios archivos independientes y los grapa digitalmente en uno solo
export async function mergePdfs(fileUrls: string[], outputName: string = 'merged.pdf') {
  // Hablamos con el servidor encargado de mezclar cosas
  const response = await axios.post('https://api.pdf.co/v1/pdf/merge', {
    // Juntamos todos los enlaces de los archivos con comas para que el servidor entienda que son varios
    url: fileUrls.join(','),
    // Le damos el nombre final que tendrá la recopilación (o usa merged.pdf por defecto)
    name: outputName,
  }, {
    // Autorización correspondiente
    headers: { 'x-api-key': PDFCO_API_KEY }
  });
  // Paramos si hubo errores
  if (response.data.error) throw new Error(response.data.message);
  // Regresamos el PDF masivo
  return response.data.url;
}

// Función crucial que le quita el molde de PDF a un texto para poder dárselo a leer a nuestra inteligencia artificial
export async function extractTextFromPdf(fileUrl: string) {
  // Hacemos que PDF.co haga el trabajo difícil de extraer todas las letras y palabras del documento
  const response = await axios.post('https://api.pdf.co/v1/pdf/convert/to/text', {
    // Le pasamos el enlace del documento a destripar
    url: fileUrl,
  }, {
    // Permisos
    headers: { 'x-api-key': PDFCO_API_KEY }
  });
  // Revisamos si PDF.co tuvo problemas con caracteres raros o archivos dañados
  if (response.data.error) throw new Error(response.data.message);
  
  // PDF.co en realidad no nos devuelve el texto directamente sino un enlace a un bloc de notas que tiene el texto
  // Así que hacemos una segunda petición GET para descargar el contenido de ese bloc de notas
  const txtResponse = await axios.get(response.data.url);
  // Ahora sí retornamos todo el texto crudo listo para que la IA lo resuma
  return txtResponse.data;
}

// Función dinámica que convierte archivos hacia o desde PDF dependiendo del formato de destino
export async function convertPdfTo(fileUrl: string, convertType: string) {
  const lowercaseUrl = fileUrl.toLowerCase();
  
  if (convertType === 'pdf') {
    // Conversión HACIA PDF
    if (
      lowercaseUrl.includes('.doc') || 
      lowercaseUrl.includes('.docx') || 
      lowercaseUrl.includes('.xls') || 
      lowercaseUrl.includes('.xlsx') || 
      lowercaseUrl.includes('.ppt') || 
      lowercaseUrl.includes('.pptx') || 
      lowercaseUrl.includes('.txt')
    ) {
      return await convertDocumentToPdf(fileUrl, 'converted.pdf');
    } else if (
      lowercaseUrl.includes('.jpg') || 
      lowercaseUrl.includes('.jpeg') || 
      lowercaseUrl.includes('.png')
    ) {
      return await convertImageToPdf(fileUrl, 'converted.pdf');
    } else if (
      lowercaseUrl.includes('.html') || 
      lowercaseUrl.includes('.htm')
    ) {
      return await convertHtmlToPdf(fileUrl, 'converted.pdf');
    } else {
      throw new Error('Formato de archivo no soportado para conversión a PDF');
    }
  } else {
    // Conversión DESDE PDF a otros formatos
    let endpoint = '';
    let name = 'converted';
    
    if (convertType === 'doc') {
      endpoint = 'https://api.pdf.co/v1/pdf/convert/to/doc';
      name += '.doc';
    } else if (convertType === 'xls') {
      endpoint = 'https://api.pdf.co/v1/pdf/convert/to/xls';
      name += '.xlsx';
    } else if (convertType === 'jpg') {
      endpoint = 'https://api.pdf.co/v1/pdf/convert/to/jpg';
      name += '.jpg';
    } else if (convertType === 'png') {
      endpoint = 'https://api.pdf.co/v1/pdf/convert/to/png';
      name += '.png';
    } else {
      throw new Error(`Tipo de conversión no soportado: ${convertType}`);
    }

    const response = await axios.post(endpoint, {
      url: fileUrl,
      name: name,
    }, {
      headers: { 'x-api-key': PDFCO_API_KEY }
    });

    if (response.data.error) throw new Error(response.data.message);
    return response.data.url;
  }
}


// si quitas getPresignedUrl pasa que jamás podrás subir archivos porque el servidor nunca te dará la URL de destino
// si quitas uploadFileToPdfco pasa que tus documentos locales nunca llegarán a internet y todas las demás herramientas fallarán porque no tendrán de dónde sacar el archivo original
// si quitas convertDocumentToPdf pasa que el botón de convertir Word a PDF quedará inservible
// si quitas convertImageToPdf pasa que ya no podrás convertir fotos en archivos PDF
// si quitas convertHtmlToPdf pasa que la opción de convertir webs dejará de funcionar en tu app
// si quitas compressPdf pasa que perderás la capacidad de reducir el tamaño de tus documentos pesados
// si quitas mergePdfs pasa que el usuario ya no podrá juntar sus distintos archivos en un solo compilado
// si quitas extractTextFromPdf pasa que la inteligencia artificial se quedará ciega porque no le estarás pasando el texto del PDF y no habrá resúmenes
