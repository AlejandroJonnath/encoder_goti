import forge from "node-forge";

// Sección: Utilidades de Firma Criptográfica PKCS#12 (.p12 / .pfx) para Ecuador
// Funciones: decodeP12Certificate valida el archivo .p12 con su contraseña y extrae de forma real la identidad del firmante y la entidad emisora.

export interface DecodedCertificate {
  commonName: string;
  issuerName: string;
  validFrom: Date;
  validTo: Date;
  serialNumber: string;
}

export function decodeP12Certificate(
  p12Base64: string,
  password?: string
): DecodedCertificate {
  try {
    // 1. Convertir el archivo base64 a cadena binaria de Forge
    const p12Der = forge.util.decode64(p12Base64);
    const p12Asn1 = forge.asn1.fromDer(p12Der);

    // 2. Parsear el contenedor PKCS#12 (Esto lanzará un error si la contraseña es incorrecta!)
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password || "");

    // 3. Extraer bolsas de certificados (Cert Bags)
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const certBagList = certBags[forge.pki.oids.certBag];

    if (!certBagList || certBagList.length === 0) {
      throw new Error("El archivo .p12 no contiene ningún certificado digital.");
    }

    // Buscamos el certificado del firmante (suele ser el primero)
    const certBag = certBagList[0];
    if (!certBag || !certBag.cert) {
      throw new Error("No se pudo extraer la firma criptográfica del archivo.");
    }

    const cert = certBag.cert;

    // 4. Extraer el nombre del sujeto (Subject Common Name - CN)
    let commonName = "Firmante Desconocido";
    const cnField = cert.subject.getField("CN");
    if (cnField && cnField.value) {
      commonName = cnField.value as string;
    }

    // 5. Extraer la autoridad emisora (Issuer Common Name - CN)
    let issuerName = "Autoridad Certificadora (Ecuador)";
    const issuerCnField = cert.issuer.getField("CN");
    if (issuerCnField && issuerCnField.value) {
      issuerName = issuerCnField.value as string;
    }

    // Retornamos los datos reales extraídos criptográficamente del certificado ecuatoriano
    return {
      commonName,
      issuerName,
      validFrom: cert.validity.notBefore,
      validTo: cert.validity.notAfter,
      serialNumber: cert.serialNumber || "",
    };
  } catch (error: any) {
    console.error("[PKCS#12] Error al decodificar certificado:", error.message);
    if (error.message && error.message.includes("PKCS#12")) {
      throw new Error("Contraseña incorrecta o archivo .p12 dañado.");
    }
    throw new Error(error.message || "Error al leer el archivo de firma electrónica .p12");
  }
}
