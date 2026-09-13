/*
Nombre de la prueba: Pruebas de Operaciones y Procesamiento PDF
Breve nota: Verifica la creación de documentos PDF con pdf-lib, cálculo de dimensiones, conteo de páginas, fusión de buffers en memoria y validación de tipos MIME y extensiones de conversión.
*/
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { TestRunner, assert, assertEqual } from './testHelper';

// Utilidad de filtrado de tipos permitidos para conversión (usado en usePdfConversion)
export function getAllowedMimeTypes(conversionType: string): string[] {
  switch (conversionType) {
    case "word":
    case "word-to-pdf":
      return ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".doc", ".docx"];
    case "excel":
    case "to-excel":
      return ["application/pdf", ".pdf"];
    case "image":
    case "image-to-pdf":
      return ["image/jpeg", "image/png", "image/jpg", ".jpg", ".jpeg", ".png"];
    default:
      return ["*/*"];
  }
}

// Cálculo del ratio de compresión
export function calculateCompressionRatio(originalBytes: number, compressedBytes: number): number {
  if (originalBytes <= 0) return 0;
  const savings = originalBytes - compressedBytes;
  return Number(((savings / originalBytes) * 100).toFixed(2));
}

// Fusión de dos documentos PDF en memoria usando pdf-lib
export async function mergePdfBuffers(pdf1Bytes: Uint8Array, pdf2Bytes: Uint8Array): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  const doc1 = await PDFDocument.load(pdf1Bytes);
  const doc2 = await PDFDocument.load(pdf2Bytes);

  const copiedPages1 = await mergedPdf.copyPages(doc1, doc1.getPageIndices());
  copiedPages1.forEach(page => mergedPdf.addPage(page));

  const copiedPages2 = await mergedPdf.copyPages(doc2, doc2.getPageIndices());
  copiedPages2.forEach(page => mergedPdf.addPage(page));

  return await mergedPdf.save();
}

export async function runPdfTests() {
  const runner = new TestRunner("Módulo de Operaciones PDF");
  runner.start();

  let samplePdfBytes1: Uint8Array;
  let samplePdfBytes2: Uint8Array;

  await runner.test("Creación de documento PDF básico con pdf-lib", async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([600, 400]);
    const font = await doc.embedFont(StandardFonts.Helvetica);

    page.drawText("Prueba Unitaria de Documento PDF - EncoderGoti", {
      x: 50,
      y: 350,
      size: 16,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });

    samplePdfBytes1 = await doc.save();
    assert(samplePdfBytes1.length > 0, "El buffer del PDF no debe estar vacío");
  });

  await runner.test("Creación de segundo documento PDF para pruebas de fusión", async () => {
    const doc = await PDFDocument.create();
    doc.addPage([600, 400]);
    doc.addPage([600, 400]); // 2 páginas
    samplePdfBytes2 = await doc.save();

    const loaded = await PDFDocument.load(samplePdfBytes2);
    assertEqual(loaded.getPageCount(), 2, "El segundo documento debe tener 2 páginas");
  });

  await runner.test("Fusión en memoria de múltiples PDFs (Merge)", async () => {
    const mergedBytes = await mergePdfBuffers(samplePdfBytes1, samplePdfBytes2);
    const mergedDoc = await PDFDocument.load(mergedBytes);

    // 1 página del primer doc + 2 páginas del segundo doc = 3 páginas
    assertEqual(mergedDoc.getPageCount(), 3, "El PDF resultante de la fusión debe tener 3 páginas");
  });

  await runner.test("Cálculo de ahorro y ratio de compresión", () => {
    const originalSize = 1000000; // 1 MB
    const compressedSize = 400000; // 400 KB
    const ratio = calculateCompressionRatio(originalSize, compressedSize);

    assertEqual(ratio, 60.00, "El porcentaje de ahorro debe ser 60%");
  });

  await runner.test("Validación de extensiones y MIME types para conversión", () => {
    const wordTypes = getAllowedMimeTypes("word");
    assert(wordTypes.includes(".docx"), "Debe permitir extensión .docx");
    assert(wordTypes.includes("application/msword"), "Debe permitir MIME type de Word");

    const imageTypes = getAllowedMimeTypes("image-to-pdf");
    assert(imageTypes.includes("image/jpeg"), "Debe permitir JPEG");
    assert(imageTypes.includes(".png"), "Debe permitir PNG");
  });

  return runner.summary();
}

// Ejecución directa si se invoca este archivo específicamente
if (process.argv[1] && process.argv[1].includes('pdf.test')) {
  runPdfTests();
}
