# Changelog - ERC-3643 RWA Platform

## [1.1.0] - Automated Deployment & Web Integration

### Añadido

#### 🚀 Script de Deployment Automático (`deploy.sh`)
- Script bash completo para deployment end-to-end
- Limpieza automática con `forge clean`
- Compilación y deployment de contratos
- Extracción automática de direcciones de contratos
- Generación de `.env.local` para Next.js
- Generación de `contracts.ts` con tipos TypeScript
- Validación de Anvil antes del deployment
- Output con colores y resumen detallado

#### 🎣 Custom React Hooks (`src/hooks/useToken.ts`)
- `useTokenBalance` - Consulta de balance
- `useTokenInfo` - Información del token (nombre, símbolo, decimales)
- `useTokenTransfer` - Transferencias con confirmación
- `useCanTransfer` - Validación de compliance
- `useIsVerified` - Estado de verificación
- `useIsFrozen` - Estado de cuenta congelada
- Soporte para direcciones de contratos customizables
- Integración con wagmi hooks

#### 📝 Configuración de Ambiente
- `.env.example` - Template de variables de entorno
- Soporte para `NEXT_PUBLIC_*` variables
- Configuración automática de contract addresses
- Chain ID y RPC URL configurables

#### 📚 Documentación
- `DEPLOYMENT.md` - Guía completa de deployment
- Instrucciones de MetaMask
- Troubleshooting común
- Scripts útiles para desarrollo
- Sección de próximos pasos

### Modificado

#### 🌐 Página de Manage (`src/app/manage/page.tsx`)
- Integración completa con contratos deployados
- Display en tiempo real de balance
- Validación de compliance antes de transferir
- Estados de transacción (pending, confirming, success)
- Panel de compliance con status dinámico
- Mensajes de error mejorados
- Validación de direcciones Ethereum

#### 📖 README.md
- Sección de Quick Start con deployment automático
- Instrucciones de MetaMask detalladas
- Prerequisitos actualizados (añadido jq)
- Ejemplos de deployment manual
- Configuración de red local

#### ⚙️ Settings Claude Code (`.claude/settings.local.json`)
- Permisos añadidos para `chmod`
- Permisos para todos los comandos usados

### Archivos Creados

```
/deploy.sh                          # Script principal de deployment
/DEPLOYMENT.md                      # Documentación de deployment
/CHANGELOG.md                       # Este archivo
/web/.env.example                   # Template de variables
/web/src/hooks/useToken.ts         # Custom hooks React
/web/src/config/contracts.ts       # (Generado por deploy.sh)
/web/.env.local                    # (Generado por deploy.sh)
```

### Flujo de Trabajo Mejorado

#### Antes:
```bash
# Múltiples pasos manuales
forge clean
forge build
forge script ... --broadcast
# Copiar direcciones manualmente
# Editar .env.local manualmente
# Editar código para usar direcciones
cd web && npm run dev
```

#### Ahora:
```bash
anvil &                # Terminal 1
./deploy.sh            # Terminal 2 - Hace todo automáticamente
cd web && npm run dev  # Terminal 2 - Listo!
```

### Mejoras Técnicas

#### Smart Contracts
- ✅ Todos los tests pasando (15/15)
- ✅ Deployment script optimizado
- ✅ Logs con console.log en deploy script

#### Web Application
- ✅ Integración completa con wagmi/viem
- ✅ Manejo de estados de transacción
- ✅ Validación de compliance en tiempo real
- ✅ Manejo de errores mejorado
- ✅ TypeScript types correctos para addresses

### Próximas Funcionalidades Planeadas

- [ ] Página de Deploy funcional con UI para crear tokens
- [ ] Sistema de registro de identidades
- [ ] Interfaz para añadir KYC claims
- [ ] Panel de administración para token agents
- [ ] Gestión de trusted issuers
- [ ] Dashboard de analytics
- [ ] Soporte para múltiples tokens
- [ ] Export de transaction history
- [ ] Notificaciones de compliance

## [1.0.0] - Initial Release

### Añadido

#### Smart Contracts
- Implementación completa del estándar ERC-3643
- Identity.sol - Gestión de identidades on-chain
- IdentityRegistry.sol - Registro de identidades
- TrustedIssuersRegistry.sol - Emisores de claims verificados
- ClaimTopicsRegistry.sol - Topics de claims requeridos
- Token.sol - Token ERC-3643 con compliance
- MaxBalanceCompliance.sol - Límite de 1000 tokens por wallet
- MaxHoldersCompliance.sol - Límite de holders totales
- TransferLockCompliance.sol - Período de lock de 30 días

#### Testing
- 15 tests comprehensivos
- Cobertura de todos los módulos de compliance
- Tests de integración
- Tests de verificación de identidad

#### Web Application
- Next.js 15 con App Router
- Tailwind CSS para styling
- Wagmi para integración Web3
- Páginas: Home, Deploy, Manage
- Componente WalletConnect
- Web3Provider con React Query

#### Documentación
- README.md completo
- CLAUDE.md para Claude Code
- Ejemplos de uso
- Arquitectura del sistema

---

## Convenciones de Versioning

Este proyecto sigue [Semantic Versioning](https://semver.org/):
- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nueva funcionalidad compatible
- **PATCH**: Bug fixes compatibles

## Tipos de Cambios

- **Añadido**: Nueva funcionalidad
- **Modificado**: Cambios en funcionalidad existente
- **Deprecado**: Funcionalidad que será removida
- **Removido**: Funcionalidad removida
- **Corregido**: Bug fixes
- **Seguridad**: Actualizaciones de seguridad
