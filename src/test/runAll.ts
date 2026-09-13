// ============================================================================
// Nombre de la prueba: Suite Principal de Ejecución de Pruebas (Master Test Suite)
// Breve nota: Ejecuta todas las pruebas unitarias, funcionales y de rendimiento
//             de manera secuencial, generando un reporte consolidado con métricas
//             de éxito y tiempos de ejecución sin afectar backend ni Supabase.
// ============================================================================

import { runAuthTests } from './auth.test';
import { runSignatureTests } from './signature.test';
import { runPdfTests } from './pdf.test';
import { runAITests } from './ai.test';
import { runTranslationTests } from './translation.test';
import { runSupabaseStorageTests } from './supabase.test';
import { runLoggerTests } from './logger.test';
import { runPerformanceTests } from './performance.test';

export async function runAllSuites() {
  const globalStart = performance.now();

  console.log(`\n\x1b[1m\x1b[35m╔════════════════════════════════════════════════════════════╗`);
  console.log(`║      ENCODERGOTI - SUITE COMPLETA DE VERIFICACIÓN          ║`);
  console.log(`║     (Pruebas de Funcionalidad, Integridad y Rendimiento)   ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝\x1b[0m\n`);

  const results: { suite: string; total: number; passed: number; failed: number; totalDurationMs: number }[] = [];

  // 1. Auth
  const authSummary = await runAuthTests();
  results.push({ suite: "Autenticación (Auth)", ...authSummary });

  // 2. Firma PKCS#12 y DocuSeal
  const sigSummary = await runSignatureTests();
  results.push({ suite: "Firma Digital (PKCS#12 / DocuSeal)", ...sigSummary });

  // 3. Operaciones PDF
  const pdfSummary = await runPdfTests();
  results.push({ suite: "Operaciones PDF (Merge / Compress / Convert)", ...pdfSummary });

  // 4. Asistente IA
  const aiSummary = await runAITests();
  results.push({ suite: "Asistente de IA (Kimi / Groq / Gemini)", ...aiSummary });

  // 5. Traducción y Particionado
  const transSummary = await runTranslationTests();
  results.push({ suite: "Traducción & Particionado", ...transSummary });

  // 6. Almacenamiento Seguro Supabase
  const supaSummary = await runSupabaseStorageTests();
  results.push({ suite: "Almacenamiento Seguro (SecureStore)", ...supaSummary });

  // 7. Logger y Auditoría
  const logSummary = await runLoggerTests();
  results.push({ suite: "Logger & Auditoría", ...logSummary });

  // 8. Pruebas de Rendimiento
  const perfSummary = await runPerformanceTests();
  results.push({ suite: "Rendimiento y Benchmarking", ...perfSummary });

  const globalDuration = (performance.now() - globalStart).toFixed(2);
  const totalTests = results.reduce((acc, r) => acc + r.total, 0);
  const totalPassed = results.reduce((acc, r) => acc + r.passed, 0);
  const totalFailed = results.reduce((acc, r) => acc + r.failed, 0);

  console.log(`\x1b[1m\x1b[35m===============================================================`);
  console.log(`                 REPORTE FINAL CONSOLIDADO                     `);
  console.log(`===============================================================\x1b[0m`);

  results.forEach(r => {
    const statusIcon = r.failed === 0 ? "\x1b[32m✔ PASS\x1b[0m" : "\x1b[31m✖ FAIL\x1b[0m";
    console.log(`  ${statusIcon} ${r.suite.padEnd(42)} [${r.passed}/${r.total}] \x1b[90m(${r.totalDurationMs}ms)\x1b[0m`);
  });

  console.log(`\x1b[1m---------------------------------------------------------------\x1b[0m`);
  console.log(`Total de Pruebas: \x1b[1m${totalTests}\x1b[0m | \x1b[32mExitosas: ${totalPassed}\x1b[0m | \x1b[31mFallidas: ${totalFailed}\x1b[0m | Tiempo Total: \x1b[33m${globalDuration}ms\x1b[0m`);

  if (totalFailed === 0) {
    console.log(`\n\x1b[1m\x1b[32m ¡TODAS LAS FUNCIONALIDADES Y PRUEBAS DE RENDIMIENTO HAN PASADO EXITOSAMENTE!\x1b[0m\n`);
  } else {
    console.log(`\n\x1b[1m\x1b[31m SE ENCONTRARON ${totalFailed} FALLOS EN LA SUITE.\x1b[0m\n`);
    process.exit(1);
  }
}

// Ejecución directa
runAllSuites();
