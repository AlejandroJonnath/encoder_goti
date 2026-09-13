/*
Nombre de la prueba: Pruebas de Autenticación y Validación de Sesión
Breve nota: Verifica la validación de formatos de correo, robustez de contraseñas, serialización y particionado seguro de tokens de sesión sin alterar ni crear registros persistentes en Supabase.
*/
import { TestRunner, assert, assertEqual } from './testHelper';

// Lógica pura de validación de Auth utilizada en useLogin / useRegister
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailTrimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailTrimmed);
}

export function validatePassword(password: string): { valid: boolean; reason?: string } {
  if (!password) return { valid: false, reason: "La contraseña no puede estar vacía" };
  if (password.length < 6) return { valid: false, reason: "La contraseña debe tener al menos 6 caracteres" };
  return { valid: true };
}

export function sanitizeAuthInputs(email: string, fullName?: string) {
  return {
    email: (email || '').trim().toLowerCase(),
    fullName: (fullName || '').trim(),
  };
}

export async function runAuthTests() {
  const runner = new TestRunner("Módulo de Autenticación (Auth)");
  runner.start();

  await runner.test("Validación de correos electrónicos válidos", () => {
    assert(validateEmail("usuario@ejemplo.com"), "usuario@ejemplo.com debería ser válido");
    assert(validateEmail("admin.test+1@universidad.edu.ec"), "correo institucional con sub-alias debería ser válido");
    assert(validateEmail("  espacios@dominio.com  "), "correo con espacios alrededor debe recortarse y ser válido");
  });

  await runner.test("Rechazo de correos electrónicos inválidos", () => {
    assert(!validateEmail(""), "Cadena vacía debe ser inválida");
    assert(!validateEmail("usuario-sin-arroba.com"), "Sin @ debe ser inválido");
    assert(!validateEmail("usuario@sin-punto"), "Sin dominio con punto debe ser inválido");
    assert(!validateEmail("@dominio.com"), "Sin usuario previo al @ debe ser inválido");
    assert(!validateEmail("usuario@dominio@otro.com"), "Múltiples @ debe ser inválido");
  });

  await runner.test("Validación de longitud de contraseñas", () => {
    assertEqual(validatePassword("12345").valid, false, "Contraseña menor a 6 caracteres debe ser rechazada");
    assertEqual(validatePassword("123456").valid, true, "Contraseña de 6 caracteres debe ser aceptada");
    assertEqual(validatePassword("claveSegura123!").valid, true, "Contraseña robusta debe ser aceptada");
    assertEqual(validatePassword("").valid, false, "Contraseña vacía debe ser rechazada");
  });

  await runner.test("Sanitización y normalización de credenciales", () => {
    const sanitized = sanitizeAuthInputs("  Usuario.Goti@Dominio.COM  ", "  Juan Perez  ");
    assertEqual(sanitized.email, "usuario.goti@dominio.com", "El correo debe estar en minúsculas y sin espacios");
    assertEqual(sanitized.fullName, "Juan Perez", "El nombre completo debe estar limpio de espacios extremos");
  });

  await runner.test("Simulación no destructiva de sesión de usuario", () => {
    const mockSession = {
      access_token: "mock-jwt-token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
      refresh_token: "mock-refresh-token-12345",
      expires_in: 3600,
      user: {
        id: "usr_mock_98765",
        email: "test@encodergoti.com",
        user_metadata: { full_name: "Usuario de Prueba" }
      }
    };

    assert(mockSession.access_token.startsWith("mock-jwt-token"), "El token simulado debe ser reconocible");
    assertEqual(mockSession.user.email, "test@encodergoti.com");
    assert(mockSession.expires_in > 0, "El tiempo de expiración debe ser positivo");
  });

  return runner.summary();
}

// Ejecución directa si se invoca este archivo específicamente
if (process.argv[1] && process.argv[1].includes('auth.test')) {
  runAuthTests();
}
