# Guía de Deployment - ERC-3643 RWA Platform

## Script de Deployment Automático

### Uso

```bash
# 1. Asegúrate de que Anvil esté corriendo
anvil

# 2. Ejecuta el script desde la raíz del proyecto
./deploy.sh
```

### ¿Qué hace el script?

1. **Limpia** los artefactos anteriores con `forge clean`
2. **Compila** todos los contratos con `forge build`
3. **Despliega** los contratos en la red local de Anvil:
   - Identity Registry
   - Trusted Issuers Registry
   - Claim Topics Registry
   - Token (ERC-3643)
   - MaxBalanceCompliance (límite: 1000 tokens)
   - MaxHoldersCompliance (límite: 100 holders)
   - TransferLockCompliance (lock: 30 días)

4. **Extrae** las direcciones de los contratos desplegados
5. **Crea** el archivo `web/.env.local` con:
   ```env
   NEXT_PUBLIC_TOKEN_ADDRESS=0x...
   NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0x...
   # ... más direcciones
   ```

6. **Crea** el archivo `web/src/config/contracts.ts` con:
   ```typescript
   export const CONTRACTS = {
     Token: '0x...' as `0x${string}`,
     // ... más contratos
   }
   ```

## Variables de Entorno

### Archivo `.env.local` (generado automáticamente)

```env
# Direcciones de Contratos
NEXT_PUBLIC_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_TRUSTED_ISSUERS_REGISTRY_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_CLAIM_TOPICS_REGISTRY_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
NEXT_PUBLIC_MAX_BALANCE_COMPLIANCE_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
NEXT_PUBLIC_MAX_HOLDERS_COMPLIANCE_ADDRESS=0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
NEXT_PUBLIC_TRANSFER_LOCK_COMPLIANCE_ADDRESS=0x0165878A594ca255338adfa4d48449f69242Eb8F

# Configuración de Red
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545

# Cuenta de Test
NEXT_PUBLIC_DEPLOYER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

## Uso en la Aplicación Web

### Hooks Personalizados

La aplicación incluye hooks de React para interactuar con los contratos:

```typescript
import { useTokenBalance, useTokenTransfer, useIsVerified } from '@/hooks/useToken'

function MyComponent() {
  const { data: balance } = useTokenBalance(address, tokenAddress)
  const { transfer, isPending } = useTokenTransfer(tokenAddress)
  const { data: isVerified } = useIsVerified(address, tokenAddress)

  // Usar los hooks...
}
```

### Hooks Disponibles

#### `useTokenBalance(address, tokenAddress)`
Obtiene el balance de tokens de una dirección.

#### `useTokenInfo(tokenAddress)`
Obtiene nombre, símbolo y decimales del token.

#### `useTokenTransfer(tokenAddress)`
Hook para realizar transferencias de tokens.

#### `useCanTransfer(from, to, amount, tokenAddress)`
Verifica si una transferencia es posible según las reglas de compliance.

#### `useIsVerified(address, tokenAddress)`
Verifica si una dirección tiene identidad verificada.

#### `useIsFrozen(address, tokenAddress)`
Verifica si una cuenta está congelada.

## Configuración de MetaMask

### Añadir Red Local

1. Abre MetaMask
2. Click en el selector de red
3. "Add Network" → "Add a network manually"
4. Configura:
   - **Network Name**: Localhost
   - **RPC URL**: http://localhost:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH

### Importar Cuenta de Test

Anvil proporciona 10 cuentas de test con 10,000 ETH cada una:

**Cuenta #0 (Deployer)**:
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Cuenta #1**:
```
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

Para importar en MetaMask:
1. Click en el ícono de cuenta
2. "Import Account"
3. Pega la Private Key
4. Click "Import"

## Verificación del Deployment

Después de ejecutar `./deploy.sh`, deberías ver:

```
🎉 Deployment Complete!
==============================================

Contract Addresses:
  Token:                    0x5FbDB2315678afecb367f032d93F642f64180aa3
  Identity Registry:        0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
  ...

Configuration Files Created:
  web/.env.local
  web/src/config/contracts.ts

Next Steps:
  1. Start the web app: cd web && npm run dev
  2. Open http://localhost:3000 in your browser
  3. Connect with MetaMask using one of the Anvil test accounts
```

## Troubleshooting

### Error: "Anvil is not running"

**Solución**: Inicia Anvil en una terminal separada:
```bash
anvil
```

### Error: "Failed to extract contract addresses"

**Posibles causas**:
1. Anvil no está corriendo
2. La cuenta no tiene suficiente ETH (poco probable con Anvil)
3. Error en la compilación de contratos

**Solución**: Revisa la salida del deployment para ver errores específicos.

### Error: "Token address not configured"

**Causa**: El archivo `.env.local` no existe o está vacío.

**Solución**:
```bash
# Ejecuta el script de deployment nuevamente
./deploy.sh

# O copia el ejemplo manualmente
cd web
cp .env.example .env.local
# Edita .env.local con las direcciones correctas
```

### MetaMask: "Nonce too high"

**Causa**: Anvil se reinició pero MetaMask mantiene el nonce anterior.

**Solución**:
1. MetaMask → Settings → Advanced
2. Click "Clear activity tab data"
3. Reconecta tu wallet

### Error al transferir: "Transfer not compliant"

**Posibles causas**:
1. La dirección no está verificada
2. Se excede el límite de balance (1000 tokens)
3. El período de lock está activo (30 días)
4. Se alcanzó el máximo de holders

**Solución**: Revisa el panel de "Compliance Status" en la página de Manage.

## Desarrollo Adicional

### Añadir Nuevos Contratos

Si añades nuevos contratos:

1. Actualiza `Deploy.s.sol` para incluir el nuevo contrato
2. Actualiza el script `deploy.sh` para extraer la nueva dirección
3. Añade la nueva dirección al `.env.example`
4. Re-ejecuta `./deploy.sh`

### Cambiar Configuración de Compliance

Para cambiar los parámetros de compliance (max balance, holders, lock period):

1. Edita `Deploy.s.sol`:
   ```solidity
   // Cambiar de 1000 a 500
   MaxBalanceCompliance maxBalanceCompliance = new MaxBalanceCompliance(deployer, 500 ether);
   ```

2. Re-ejecuta el deployment:
   ```bash
   ./deploy.sh
   ```

## Scripts Útiles

### Ver logs de Anvil

```bash
# Anvil muestra todas las transacciones en tiempo real
# No requiere configuración adicional
```

### Limpiar todo y empezar de nuevo

```bash
# Detener Anvil (Ctrl+C)
# Limpiar contratos
cd sc && forge clean

# Eliminar configuración web
rm web/.env.local
rm web/src/config/contracts.ts

# Reiniciar Anvil
anvil

# Re-deployar
./deploy.sh
```

### Verificar estado de los contratos

```bash
# Desde la consola de Foundry
cd sc
forge script script/Verify.s.sol --rpc-url http://localhost:8545
```

## Próximos Pasos

Una vez desplegado y funcionando:

1. **Registrar Identidades**: Crea identidades para inversores
2. **Añadir Claims KYC**: Verifica inversores
3. **Mintear Tokens**: Emite tokens a inversores verificados
4. **Probar Transfers**: Verifica las reglas de compliance
5. **Explorar Compliance**: Prueba diferentes escenarios de transferencia

Happy coding! 🚀
