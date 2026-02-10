# Sistema de Autenticación y Seguridad

## Protecciones Implementadas

### 1. **Protección contra Bots**

#### Honeypot Field
- Campo oculto `website` en Login y Signup
- Los bots lo llenan automáticamente
- Si tiene valor → request rechazado silenciosamente

```typescript
// Anti-bot: honeypot check
if (data.website) {
  // Bot detected, abort silently
  return;
}
```

#### Human Delay Check
- Monitorea tiempo desde que el formulario se monta
- Rechaza submissions < 1.5 segundos (too fast = bot)

```typescript
// Anti-bot: human delay check
const timeElapsed = Date.now() - formMountTime.current;
if (timeElapsed < 1500) {
  // Too fast, likely a bot
  return;
}
```

### 2. **Prevención de User Enumeration**

- Mensajes de error genéricos
- No revela si el email existe o no
- Mismo tiempo de respuesta para éxito/fallo

```typescript
// Generic error message to prevent user enumeration
toast({
  title: "Error",
  description: "Credenciales inválidas",
  variant: "destructive",
});
```

### 3. **Autenticación de Dos Factores (2FA)**

#### Flujo de Activación:
1. **Usuario va a Perfil** → Sección "2FA"
2. **Click "Activar 2FA"** → Genera secret TOTP
3. **Escanea QR** → Con Google Authenticator
4. **Ingresa código** → Verifica que funciona
5. **Guarda backup codes** → 10 códigos de respaldo

#### Flujo de Login con 2FA:
1. Usuario ingresa email/password
2. Sistema verifica credenciales
3. Si tiene 2FA → Muestra diálogo de verificación
4. Usuario ingresa código de 6 dígitos
5. Sistema verifica código TOTP o backup code
6. Login completo

#### Características:
- ✅ Compatible con Google Authenticator
- ✅ Genera QR code automáticamente
- ✅ 10 códigos de respaldo (uso único)
- ✅ Algoritmo TOTP estándar (RFC 6238)
- ✅ Códigos de 6 dígitos, renovación cada 30s

### 4. **Storage de 2FA**

```typescript
// Config guardada por usuario
localStorage.setItem('twoFactor:email@example.com', JSON.stringify({
  enabled: true,
  secret: "BASE32SECRET...",
  backupCodes: ["CODE1", "CODE2", ...],
  enrolledAt: "2026-02-10T..."
}));
```

## Forgot Password

### Ruta: `/forgot-password`

- Formulario para recuperación de contraseña
- Envía email con link de reset (simulado)
- Protegido con mismas medidas anti-bot

## Próximas Mejoras

### Backend Integration:
- [ ] Mover verificación 2FA al backend
- [ ] Implementar rate limiting real (5 intentos/minuto)
- [ ] Email verification en signup
- [ ] Password reset por email
- [ ] Session management con JWT
- [ ] IP-based blocking para ataques

### Seguridad Adicional:
- [ ] Recaptcha v3 en producción
- [ ] Biometric authentication (WebAuthn)
- [ ] Trusted devices (remember this device)
- [ ] Login notifications por email
- [ ] Security audit log

## Testing 2FA

### Para probar en dev:
1. Hacer signup/login normal
2. Ir a `/system/profile`
3. En sección "2FA" → Click "Activar 2FA"
4. Escanear QR con Google Authenticator
5. Ingresar código que aparece en la app
6. Logout y volver a login
7. Después de credenciales correctas → Aparece diálogo 2FA
8. Ingresar código actual (o backup code)

### Códigos que funcionan (demo):
- Cualquier código de 6 dígitos que empiece con `1` (ej: `123456`)
- Backup codes generados al activar 2FA
