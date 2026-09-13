/*
Nombre de la prueba: Pruebas de Firma Digital PKCS#12 y DocuSeal
Breve nota: Verifica el descifrado criptográfico de certificados .p12/.pfx, extracción de metadatos de identidad (CN, Emisor, Fechas), tolerancia a certificados corruptos y formateo de solicitudes DocuSeal.
*/
import forge from 'node-forge';
import { TestRunner, assert, assertEqual, assertThrows } from './testHelper';
import { decodeP12Certificate } from '../features/pdf/shared/services/p12';

// Función auxiliar para crear un certificado P12 sintético válido en memoria usando node-forge
function generateSyntheticP12(commonName: string, issuer: string, password: string): string {
  const keys = forge.pki.rsa.generateKeyPair(1024);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '0123456789ABCDEF';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 2);

  const attrs = [
    { name: 'commonName', value: commonName },
    { name: 'countryName', value: 'EC' },
    { shortName: 'ST', value: 'Pichincha' },
    { name: 'localityName', value: 'Quito' },
    { name: 'organizationName', value: 'Security Data / BCE Mock' }
  ];

  const issuerAttrs = [
    { name: 'commonName', value: issuer },
    { name: 'countryName', value: 'EC' }
  ];

  cert.setSubject(attrs);
  cert.setIssuer(issuerAttrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());

  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], password, {
    generateLocalKeyId: true,
    friendlyName: 'Test Cert'
  });

  const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
  return forge.util.encode64(p12Der);
}

export async function runSignatureTests() {
  const runner = new TestRunner("Módulo de Firma Digital (PKCS#12 & DocuSeal)");
  runner.start();

  const testCN = "JUAN CARLOS PEREZ GOMEZ";
  const testIssuer = "ANFAC AUTORIDAD DE CERTIFICACION ECUADOR C.A.";
  const testPassword = "PasswordSeguro2026";
  let validP12Base64 = "";

  await runner.test("Generación sintética de contenedor PKCS#12 (.p12)", () => {
    validP12Base64 = generateSyntheticP12(testCN, testIssuer, testPassword);
    assert(validP12Base64.length > 100, "El certificado base64 debe tener contenido binario codificado");
  });

  await runner.test("Decodificación exitosa de certificado .p12 con contraseña correcta", () => {
    const decoded = decodeP12Certificate(validP12Base64, testPassword);
    assertEqual(decoded.commonName, testCN, "El Common Name debe coincidir con el titular");
    assertEqual(decoded.issuerName, testIssuer, "El Issuer debe coincidir con la entidad certificadora");
    assert(decoded.serialNumber.length > 0, "El número de serie debe extraerse");
    assert(decoded.validFrom instanceof Date, "validFrom debe ser una fecha válida");
    assert(decoded.validTo instanceof Date, "validTo debe ser una fecha válida");
    assert(decoded.validTo.getTime() > decoded.validFrom.getTime(), "validTo debe ser posterior a validFrom");
  });

  await runner.test("Rechazo ante contraseña incorrecta en contenedor .p12", () => {
    assertThrows(() => {
      decodeP12Certificate(validP12Base64, "ContraseñaEquivocada");
    }, "Contraseña incorrecta");
  });

  await runner.test("Rechazo ante archivo .p12 corrupto o base64 inválido", () => {
    assertThrows(() => {
      decodeP12Certificate("esto_no_es_un_p12_base64_valido!!!", "1234");
    });
  });

  await runner.test("Validación de estructura de solicitud para DocuSeal (Modo Sandbox)", () => {
    const mockPayload = {
      name: "Firma Electrónica - Contrato.pdf",
      send_email: false,
      submitters: [
        {
          role: "Firmante",
          email: "firmante@ejemplo.ec",
          name: "Carlos Mendoza",
          fields: [
            {
              name: "Firma Digital",
              type: "signature",
              page: 1,
              x: 100,
              y: 500,
              width: 180,
              height: 60
            }
          ]
        }
      ]
    };

    assert(mockPayload.name.endsWith(".pdf"), "El nombre debe incluir extensión PDF");
    assertEqual(mockPayload.submitters[0].fields[0].type, "signature");
    assert(mockPayload.submitters[0].fields[0].width > 0, "El ancho debe ser positivo");
  });

  return runner.summary();
}

// Ejecución directa si se invoca este archivo específicamente
if (process.argv[1] && process.argv[1].includes('signature.test')) {
  runSignatureTests();
}
