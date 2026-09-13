// ============================================================================
// Nombre de la prueba: Utilidades y Framework Ligero de Pruebas
// Breve nota: Proporciona funciones de aserción (assert, assertEqual, assertThrows),
//             formateo de consola con colores y medición de rendimiento para
//             ejecutar las pruebas de forma aislada y no destructiva.
// ============================================================================

export interface TestResult {
  name: string;
  passed: boolean;
  durationMs: number;
  error?: Error | string;
}

export class TestRunner {
  private suiteName: string;
  private results: TestResult[] = [];
  private startTime: number = 0;

  constructor(suiteName: string) {
    this.suiteName = suiteName;
  }

  start() {
    this.startTime = Date.now();
    console.log(`\n\x1b[1m\x1b[36m=======================================================`);
    console.log(` INICIANDO SUITE: ${this.suiteName}`);
    console.log(`=======================================================\x1b[0m\n`);
  }

  async test(name: string, fn: () => void | Promise<void>) {
    const start = performance.now();
    try {
      await fn();
      const durationMs = Number((performance.now() - start).toFixed(2));
      this.results.push({ name, passed: true, durationMs });
      console.log(`  \x1b[32m✔ PASS\x1b[0m ${name} \x1b[90m(${durationMs}ms)\x1b[0m`);
    } catch (err: any) {
      const durationMs = Number((performance.now() - start).toFixed(2));
      this.results.push({ name, passed: false, durationMs, error: err });
      console.log(`  \x1b[31m✖ FAIL\x1b[0m ${name} \x1b[90m(${durationMs}ms)\x1b[0m`);
      console.log(`    \x1b[31mError: ${err?.message || err}\x1b[0m`);
    }
  }

  summary(): { total: number; passed: number; failed: number; totalDurationMs: number } {
    const totalDurationMs = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log(`\n\x1b[1m--- Resumen: ${this.suiteName} ---\x1b[0m`);
    console.log(`Total pruebas: ${total} | \x1b[32mExitosas: ${passed}\x1b[0m | \x1b[31mFallidas: ${failed}\x1b[0m | Tiempo: ${totalDurationMs}ms\n`);

    return { total, passed, failed, totalDurationMs };
  }
}

export function assert(condition: boolean, message: string = "La condición falló"): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(message || `Esperado: ${JSON.stringify(expected)}, pero se obtuvo: ${JSON.stringify(actual)}`);
  }
}

export function assertThrows(fn: () => void, expectedMessageSubstr?: string): void {
  let threw = false;
  try {
    fn();
  } catch (err: any) {
    threw = true;
    if (expectedMessageSubstr && !String(err.message || err).includes(expectedMessageSubstr)) {
      throw new Error(`Se esperaba que el error contuviera "${expectedMessageSubstr}", pero se obtuvo: "${err.message || err}"`);
    }
  }
  if (!threw) {
    throw new Error("Se esperaba que la función lanzara una excepción, pero no lo hizo.");
  }
}

export async function assertThrowsAsync(fn: () => Promise<any>, expectedMessageSubstr?: string): Promise<void> {
  let threw = false;
  try {
    await fn();
  } catch (err: any) {
    threw = true;
    if (expectedMessageSubstr && !String(err.message || err).includes(expectedMessageSubstr)) {
      throw new Error(`Se esperaba que el error contuviera "${expectedMessageSubstr}", pero se obtuvo: "${err.message || err}"`);
    }
  }
  if (!threw) {
    throw new Error("Se esperaba que la función asíncrona lanzara una excepción, pero no lo hizo.");
  }
}
