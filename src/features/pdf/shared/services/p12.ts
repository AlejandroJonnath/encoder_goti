// SECCION DE IMPORTACIONES
// Importamos la librería forge que es una joya para desencriptar y hacer cosas criptográficas
import forge from "node-forge";

// Sección: Utilidades de Firma Criptográfica PKCS#12 (.p12 / .pfx) para Ecuador
// Funciones: decodeP12Certificate valida el archivo .p12 con su contraseña y extrae de forma real la identidad del firmante y la entidad emisora.

// TIPO: DecodedCertificate
// Molde que dice qué chisme vamos a sacarle al archivo de la firma
export interface DecodedCertificate {
  // El nombre oficial de la persona dueña de la firma
  commonName: string;
  // El nombre de la empresa oficial que expidió la firma
  issuerName: string;
  // Fecha desde cuándo sirve esta firma
  validFrom: Date;
  // Fecha en la que la firma caduca y deja de funcionar
  validTo: Date;
  // El número de serie único
  serialNumber: string;
}

// FUNCION: decodeP12Certificate
// Abre el archivo seguro usando tu clave y se roba todos tus datos para poder firmar
export function decodeP12Certificate(
  p12Base64: string,
  password?: string
): DecodedCertificate {
  // Tratamos de abrir el archivo sin que explote la app
  try {
    // 1. Convertir el archivo base64 a cadena binaria de Forge
    // Le quitamos el disfraz de texto base64 para que la librería forge lo pueda leer
    const p12Der = forge.util.decode64(p12Base64);
    // Convertimos esa basura binaria en algo estructurado usando las reglas locas de ASN1
    const p12Asn1 = forge.asn1.fromDer(p12Der);

    // 2. Parsear el contenedor PKCS#12 (Esto lanzará un error si la contraseña es incorrecta!)
    // Le pasamos la contraseña al archivo para poder abrir el cofre del tesoro
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password || "");

    // 3. Extraer bolsas de certificados (Cert Bags)
    // Buscamos todas las bolsas de certificados escondidas en el archivo
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    // Sacamos la lista específica de certificados
    const certBagList = certBags[forge.pki.oids.certBag];

    // Si la lista está vacía o ni siquiera existe
    if (!certBagList || certBagList.length === 0) {
      // Aventamos un error diciendo que les dieron gato por liebre
      throw new Error("El archivo .p12 no contiene ningún certificado digital.");
    }

    // Buscamos el certificado del firmante (suele ser el primero)
    // Agarramos el primero que es casi siempre el bueno
    const certBag = certBagList[0];
    // Si la bolsita no trae su contenido
    if (!certBag || !certBag.cert) {
      // Reclamamos que la firma está defectuosa
      throw new Error("No se pudo extraer la firma criptográfica del archivo.");
    }

    // Guardamos el certificado limpio
    const cert = certBag.cert;

    // 4. Extraer el nombre del sujeto (Subject Common Name - CN)
    // Ponemos un nombre falso por si las moscas
    let commonName = "Firmante Desconocido";
    // Buscamos el campo CN que es donde guardan tu nombre
    const cnField = cert.subject.getField("CN");
    // Si existe y tiene algo de texto
    if (cnField && cnField.value) {
      // Actualizamos nuestro valor con tu nombre real
      commonName = cnField.value as string;
    }

    // 5. Extraer la autoridad emisora (Issuer Common Name - CN)
    // Ponemos a la autoridad general por si acaso
    let issuerName = "Autoridad Certificadora (Ecuador)";
    // Buscamos quién emitió esta belleza de firma
    const issuerCnField = cert.issuer.getField("CN");
    // Si lo encontramos y no está en blanco
    if (issuerCnField && issuerCnField.value) {
      // Guardamos al emisor real (como el Registro Civil o Security Data)
      issuerName = issuerCnField.value as string;
    }

    // Retornamos los datos reales extraídos criptográficamente del certificado ecuatoriano
    // Empaquetamos todo el botín y se lo damos a la función que nos llamó
    return {
      commonName,
      issuerName,
      // Metemos la fecha de nacimiento del certificado
      validFrom: cert.validity.notBefore,
      // Metemos la fecha de defunción
      validTo: cert.validity.notAfter,
      // Y el número de serie que sacamos directo
      serialNumber: cert.serialNumber || "",
    };
  // Si en cualquier punto la cagamos entramos aquí
  } catch (error: any) {
    // Escupimos el error de sistema en la terminal para los programadores
    console.error("[PKCS#12] Error al decodificar certificado:", error.message);
    // Si el error dice algo de PKCS12 casi seguro es la contraseña
    if (error.message && error.message.includes("PKCS#12")) {
      // Les soltamos la sopa de que se equivocaron tecleando
      throw new Error("Contraseña incorrecta o archivo .p12 dañado.");
    }
    // Si fue otra cosa mandamos un error general feo
    throw new Error(error.message || "Error al leer el archivo de firma electrónica .p12");
  }
}

// ANÁLISIS DE PROBLEMAS SI SE QUITAN LAS FUNCIONES:
// ¿qué pasa si borras la función decodeP12Certificate entera? pasa que el celular perderá por completo la habilidad de abrir el candado del archivo P12, haciendo totalmente imposible validar las firmas electrónicas offline
// para solucionarlo debes volver a programar la apertura usando forge.pkcs12.pkcs12FromAsn1 y extrayendo los certificados
// ¿qué pasa si quitas la extracción de commonName e issuerName? pasa que la aplicación dirá que la firma se validó pero nunca sabrá ni te podrá mostrar de quién es esa firma ni qué empresa la emitió
// para solucionarlo debes recuperar la parte donde usas cert.subject.getField("CN") y cert.issuer.getField("CN") para extraer esos valiosos datos
