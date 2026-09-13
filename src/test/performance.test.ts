/*
Nombre de la prueba: Pruebas de Rendimiento y Benchmarking del Sistema
Breve nota: Mide el rendimiento, tiempo de respuesta, operaciones por segundo y consumo de memoria en operaciones criptográficas, procesamiento de PDFs, algoritmos de particionado y almacenamiento.
*/
import forge from 'node-forge';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { TestRunner, assert } from './testHelper';
import { splitTextIntoChunks, cleanHtmlResponse } from './translation.test';
import { MockSecureStorage } from './supabase.test';

export async function runPerformanceTests() {
  const runner = new TestRunner("Pruebas de Rendimiento y Estrés (Performance)");
  runner.start();

  const memBefore = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`  \x1b[36m[Memoria Inicial]\x1b[0m Heap: ${memBefore.toFixed(2)} MB\n`);

  await runner.test("Benchmark: Generación rápida de 20 páginas PDF en memoria", async () => {
    const start = performance.now();
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);

    for (let i = 1; i <= 20; i++) {
      const page = doc.addPage([595.28, 841.89]); // Tamaño A4
      page.drawText(`Página de prueba de rendimiento #${i}`, {
        x: 50,
        y: 800,
        size: 14,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      page.drawRectangle({
        x: 50,
        y: 700,
        width: 495,
        height: 60,
        color: rgb(0.95, 0.95, 0.98),
      });
    }

    const pdfBytes = await doc.save();
    const elapsed = performance.now() - start;
    const opsPerSec = (20 / (elapsed / 1000)).toFixed(1);

    assert(pdfBytes.length > 0);
    console.log(`    \x1b[33m⚡ 20 páginas generadas en ${elapsed.toFixed(1)}ms (${opsPerSec} págs/seg | Tamaño: ${(pdfBytes.length / 1024).toFixed(1)} KB)\x1b[0m`);
  });

  await runner.test("Benchmark: Hashing criptográfico SHA-256 de 5MB de datos", () => {
    const start = performance.now();
    const testData = "X".repeat(5 * 1024 * 1024); // 5 MB
    const md = forge.md.sha256.create();
    md.update(testData);
    const digest = md.digest().toHex();

    const elapsed = performance.now() - start;
    const throughputMBs = (5 / (elapsed / 1000)).toFixed(1);

    assert(digest.length === 64, "El hash SHA-256 debe medir 64 caracteres hexadecimales");
    console.log(`    \x1b[33m⚡ 5MB hasheados en ${elapsed.toFixed(1)}ms (${throughputMBs} MB/s)\x1b[0m`);
  });

  await runner.test("Benchmark: Particionado de texto masivo (500,000 caracteres)", () => {
    const start = performance.now();
    // Crear un texto masivo con 500 párrafos
    const paragraph = "Este es un párrafo de prueba con contenido técnico para medir el algoritmo de particionado. ".repeat(10);
    const largeDoc = Array(500).fill(paragraph).join("\n\n");

    const chunks = splitTextIntoChunks(largeDoc, 4000);
    const elapsed = performance.now() - start;

    assert(chunks.length > 0);
    console.log(`    \x1b[33m⚡ ${largeDoc.length.toLocaleString()} caracteres particionados en ${chunks.length} chunks en ${elapsed.toFixed(1)}ms\x1b[0m`);
  });

  await runner.test("Benchmark: Limpieza masiva de HTML (10,000 iteraciones)", () => {
    const start = performance.now();
    const dirtyHtml = "```html\n<div class='container'><h1>Título</h1><p>Texto</p></div>\n```";

    for (let i = 0; i < 10000; i++) {
      cleanHtmlResponse(dirtyHtml);
    }

    const elapsed = performance.now() - start;
    const opsPerSec = Math.round(10000 / (elapsed / 1000));
    console.log(`    \x1b[33m⚡ 10,000 limpiezas de HTML en ${elapsed.toFixed(1)}ms (${opsPerSec.toLocaleString()} ops/seg)\x1b[0m`);
  });

  await runner.test("Benchmark: Escritura y lectura de 100 sesiones particionadas en SecureStore", async () => {
    const storage = new MockSecureStorage();
    const sessionPayload = "TOKEN_JWT_GRANDE_DE_PRUEBA_CON_METADATOS_".repeat(100); // ~4300 chars (3 chunks)
    const start = performance.now();

    for (let i = 0; i < 100; i++) {
      await storage.setItem(`session_user_${i}`, sessionPayload);
      const retrieved = await storage.getItem(`session_user_${i}`);
      assert(retrieved === sessionPayload);
    }

    const elapsed = performance.now() - start;
    const avgPerOp = (elapsed / 100).toFixed(2);
    console.log(`    \x1b[33m⚡ 100 ciclos de set/get particionado en ${elapsed.toFixed(1)}ms (promedio: ${avgPerOp}ms/ciclo)\x1b[0m`);
  });

  const memAfter = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`\n  \x1b[36m[Memoria Final]\x1b[0m Heap: ${memAfter.toFixed(2)} MB (Delta: ${(memAfter - memBefore).toFixed(2)} MB)`);

  return runner.summary();
}

// Ejecución directa si se invoca este archivo específicamente
if (process.argv[1] && process.argv[1].includes('performance.test')) {
  runPerformanceTests();
}
