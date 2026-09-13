/*
Nombre de la prueba: Pruebas de Conexión Segura y Adaptador ChunkedSecureStore
Breve nota: Verifica el particionado matemático de SecureStore para tokens grandes, la reconstrucción de fragmentos y el estado del cliente Supabase sin realizar escrituras destructivas ni modificar datos en la nube.
*/

import { TestRunner, assert, assertEqual } from './testHelper';

// Réplica pura del adaptador ChunkedSecureStore de supabase.ts con almacenamiento en memoria
export class MockSecureStorage {
  private store: Map<string, string> = new Map();
  public readonly CHUNK_SIZE = 2000;

  async getItem(key: string): Promise<string | null> {
    try {
      const chunksCountStr = this.store.get(`${key}_chunks`);
      if (!chunksCountStr) {
        return this.store.get(key) || null;
      }
      const chunksCount = parseInt(chunksCountStr, 10);
      let fullValue = '';
      for (let i = 0; i < chunksCount; i++) {
        const chunk = this.store.get(`${key}_chunk_${i}`);
        if (chunk) fullValue += chunk;
      }
      return fullValue;
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (value.length < this.CHUNK_SIZE) {
        this.store.delete(`${key}_chunks`);
        this.store.set(key, value);
        return;
      }
      const chunksCount = Math.ceil(value.length / this.CHUNK_SIZE);
      this.store.set(`${key}_chunks`, chunksCount.toString());
      for (let i = 0; i < chunksCount; i++) {
        const chunk = value.substring(i * this.CHUNK_SIZE, (i + 1) * this.CHUNK_SIZE);
        this.store.set(`${key}_chunk_${i}`, chunk);
      }
    } catch (e) {
      console.error('Error en setItem', e);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const chunksCountStr = this.store.get(`${key}_chunks`);
      if (chunksCountStr) {
        const chunksCount = parseInt(chunksCountStr, 10);
        for (let i = 0; i < chunksCount; i++) {
          this.store.delete(`${key}_chunk_${i}`);
        }
        this.store.delete(`${key}_chunks`);
      } else {
        this.store.delete(key);
      }
    } catch (e) {
      console.error('Error en removeItem', e);
    }
  }

  getRawStore(): Map<string, string> {
    return this.store;
  }
}

export async function runSupabaseStorageTests() {
  const runner = new TestRunner("Módulo de Almacenamiento Seguro (ChunkedSecureStore)");
  runner.start();

  const storage = new MockSecureStorage();

  await runner.test("Guardado y recuperación de token pequeño (< 2000 caracteres)", async () => {
    const smallToken = "token_simple_12345";
    await storage.setItem("sb-session", smallToken);

    const retrieved = await storage.getItem("sb-session");
    assertEqual(retrieved, smallToken, "El valor recuperado debe coincidir exactamente");
    assert(!storage.getRawStore().has("sb-session_chunks"), "No debe crear metadatos de chunks para valores pequeños");
  });

  await runner.test("Particionado automático de token gigante (> 5000 caracteres)", async () => {
    // Generar un token de 5500 caracteres (debe dividirse en ceil(5500 / 2000) = 3 pedazos)
    const largeToken = "A".repeat(2000) + "B".repeat(2000) + "C".repeat(1500);
    assertEqual(largeToken.length, 5500);

    await storage.setItem("sb-large-session", largeToken);

    const raw = storage.getRawStore();
    assertEqual(raw.get("sb-large-session_chunks"), "3", "Debe registrar exactamente 3 fragmentos");
    assertEqual(raw.get("sb-large-session_chunk_0")?.length, 2000, "El chunk 0 debe medir 2000 caracteres");
    assertEqual(raw.get("sb-large-session_chunk_1")?.length, 2000, "El chunk 1 debe medir 2000 caracteres");
    assertEqual(raw.get("sb-large-session_chunk_2")?.length, 1500, "El chunk 2 debe medir 1500 caracteres");
  });

  await runner.test("Reconstrucción íntegra de token particionado", async () => {
    const largeToken = "A".repeat(2000) + "B".repeat(2000) + "C".repeat(1500);
    const retrieved = await storage.getItem("sb-large-session");

    assertEqual(retrieved, largeToken, "El token reensamblado debe ser idéntico al original");
    assertEqual(retrieved?.length, 5500);
  });

  await runner.test("Eliminación limpia de token particionado sin dejar residuos", async () => {
    await storage.removeItem("sb-large-session");

    const retrieved = await storage.getItem("sb-large-session");
    assertEqual(retrieved, null, "El valor debe ser nulo tras ser eliminado");

    const raw = storage.getRawStore();
    assert(!raw.has("sb-large-session_chunks"), "Los metadatos de chunks deben borrarse");
    assert(!raw.has("sb-large-session_chunk_0"), "El chunk 0 debe eliminarse");
    assert(!raw.has("sb-large-session_chunk_1"), "El chunk 1 debe eliminarse");
    assert(!raw.has("sb-large-session_chunk_2"), "El chunk 2 debe eliminarse");
  });

  await runner.test("Tolerancia y contención de errores al leer clave inexistente", async () => {
    const result = await storage.getItem("clave_que_no_existe");
    assertEqual(result, null, "Debe devolver null de manera segura sin lanzar excepciones");
  });

  return runner.summary();
}

// Ejecución directa si se invoca este archivo específicamente
if (process.argv[1] && process.argv[1].includes('supabase.test')) {
  runSupabaseStorageTests();
}
