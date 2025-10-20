# Testing Guide - ERC-3643 RWA Platform

## Como Deployer: Guía de Testing

### Contexto Importante

El estándar ERC-3643 tiene una arquitectura de permisos específica:

- **IdentityRegistry Owner** → Puede registrar identidades (TÚ como deployer)
- **Identity Owner** → Puede agregar claims a su propia identidad (normalmente el inversor)
- **Trusted Issuers** → Pueden emitir claims verificados (configurado en TrustedIssuersRegistry)

### Problema: ¿Por qué no puedo agregar claims directamente?

Cuando despliegas una Identity normalmente, el **owner** es el wallet del inversor, no el tuyo. Por lo tanto:

```
Flujo Normal (Producción):
1. Inversor crea su Identity → Inversor es owner
2. Trusted Issuer verifica KYC → Emite claim firmado
3. Inversor agrega el claim a su Identity → Solo él puede hacerlo
```

### Solución para Testing

Tienes dos opciones:

---

## Opción 1: Desplegar Identity con TU address como owner

Usa el script especial de testing que hace a TU wallet el owner de la Identity:

### Paso 1: Configurar variables de entorno

```bash
cd sc

# En .env o export directamente:
export PRIVATE_KEY="tu_private_key"
export WALLET_ADDRESS="0x..." # Wallet a registrar (puede ser tu address)
export IDENTITY_REGISTRY_ADDRESS="0xBEc49fA140aCaA83533fB00A2BB19bDdd0290f25"
```

### Paso 2: Ejecutar el script de testing

```bash
# Para Anvil local
forge script script/DeployIdentityForTesting.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast

# O usa el helper:
forge script script/DeployIdentityForTesting.s.sol:DeployIdentityForTesting \
  --rpc-url http://localhost:8545 \
  --broadcast -vvv
```

**Resultado:**
- ✅ Identity desplegada con TU address como owner
- ✅ Identity registrada en el IdentityRegistry
- ✅ AHORA puedes agregar claims desde la UI

### Paso 3: Agregar claims desde la UI

1. Conecta tu wallet (el deployer)
2. Ve a `/manage`
3. Click en "Issue Claim"
4. Ingresa el `WALLET_ADDRESS` que registraste
5. Selecciona tipo de claim (KYC, AML, etc.)
6. Confirma la transacción

**¡Funcionará!** Porque eres el owner de la Identity.

---

## Opción 2: Workflow Completo (Simulando Producción)

Si quieres probar el flujo completo como sería en producción:

### Paso 1: Desplegar Identity normal

```solidity
// El owner será el wallet del inversor
forge create src/Identity.sol:Identity \
  --constructor-args "0xInvestorWalletAddress" \
  --rpc-url http://localhost:8545 \
  --private-key $PRIVATE_KEY
```

### Paso 2: Registrar la Identity (como deployer)

Desde la UI:
- Click "Register New"
- Wallet: `0xInvestorWalletAddress`
- Identity: `<deployed_identity_address>`

### Paso 3: El inversor agrega sus propios claims

El inversor debe:
1. Conectar SU wallet (no la tuya)
2. Ir a "Issue Claim"
3. Ingresar su propia address
4. Agregar claims a su Identity

---

## Flujo Completo de Testing Recomendado

### 1. Setup Inicial (una sola vez)

```bash
cd sc

# Asegúrate de tener Anvil corriendo
anvil

# En otra terminal, despliega el sistema
./deploy.sh
```

### 2. Configurar Trusted Issuer (tú como deployer)

Desde la UI (`/manage`):
1. Click en "Manage" (Manage Issuers)
2. "Add New Issuer"
3. Issuer Address: Tu wallet address
4. Selecciona Claim Topics: ✓ KYC, ✓ AML
5. Confirma

### 3. Crear Identity para Testing

```bash
# Opción A: Con tu address como owner (más fácil para testing)
export WALLET_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY)
export IDENTITY_REGISTRY_ADDRESS="0xBEc49fA140aCaA83533fB00A2BB19bDdd0290f25"

forge script script/DeployIdentityForTesting.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast -vvv
```

Guarda el address de la Identity desplegada (se muestra en el output).

### 4. Agregar Claims desde la UI

1. Ve a `http://localhost:3000/manage`
2. Conecta tu wallet (deployer)
3. Click "Issue Claim"
4. Wallet Address: `$WALLET_ADDRESS` (tu address)
5. Claim Type: KYC
6. Claim Data: "Verified by deployer for testing"
7. Confirma transacción
8. Repite para AML claim

### 5. Mint Tokens

Desde consola de Foundry:

```bash
cast send <TOKEN_ADDRESS> \
  "mint(address,uint256)" \
  $WALLET_ADDRESS \
  1000000000000000000000 \  # 1000 tokens (con 18 decimals)
  --rpc-url http://localhost:8545 \
  --private-key $PRIVATE_KEY
```

### 6. Verificar Compliance

En la UI (`/manage`):
- Deberías ver:
  - ✓ Identity Verified
  - ✓ Balance: 1000 tokens
  - ✓ Can transfer (después del lock period)

### 7. Probar Transfer

Después de 30 días (o usa `vm.warp` en tests):

```bash
# Fast forward time (solo en Anvil local)
cast rpc evm_increaseTime 2592000  # 30 days in seconds
cast rpc evm_mine
```

Desde la UI:
1. Recipient: Otra address con identity y claims
2. Amount: 100
3. Transfer

---

## Scripts Útiles

### Ver estado de un wallet

```bash
# Balance de tokens
cast call <TOKEN_ADDRESS> \
  "balanceOf(address)(uint256)" \
  $WALLET_ADDRESS \
  --rpc-url http://localhost:8545

# ¿Está verificado?
cast call <TOKEN_ADDRESS> \
  "isVerified(address)(bool)" \
  $WALLET_ADDRESS \
  --rpc-url http://localhost:8545

# ¿Tiene identity registrada?
cast call <IDENTITY_REGISTRY_ADDRESS> \
  "isRegistered(address)(bool)" \
  $WALLET_ADDRESS \
  --rpc-url http://localhost:8545

# Obtener address de Identity
cast call <IDENTITY_REGISTRY_ADDRESS> \
  "getIdentity(address)(address)" \
  $WALLET_ADDRESS \
  --rpc-url http://localhost:8545
```

---

## Troubleshooting

### "Only token contract can call"
- Estás intentando llamar funciones de compliance directamente
- Usa las funciones del Token contract en su lugar

### "Transfer not compliant"
Verifica:
1. ✅ Sender tiene Identity registrada
2. ✅ Sender tiene claims KYC + AML
3. ✅ Recipient tiene Identity registrada
4. ✅ Recipient tiene claims KYC + AML
5. ✅ Transfer no excede max balance (1000 tokens)
6. ✅ Lock period ha expirado (30 días desde mint/recepción)
7. ✅ No se excede max holders

### "Recipient not verified"
El recipient necesita:
1. Identity contract desplegada
2. Registrada en IdentityRegistry
3. Claims de KYC y AML agregados

### No puedo agregar claims
Verifica:
1. ¿Eres el owner del contrato Identity?
   ```bash
   cast call <IDENTITY_ADDRESS> "owner()(address)" --rpc-url http://localhost:8545
   ```
2. Si no, usa el script `DeployIdentityForTesting.s.sol`

---

## Resumen Rápido

```bash
# 1. Deploy sistema
./deploy.sh

# 2. Agregar trusted issuer (desde UI)
# /manage → Manage Issuers → Add (tu address)

# 3. Deploy Identity con tu address como owner
export WALLET_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY)
forge script script/DeployIdentityForTesting.s.sol --rpc-url http://localhost:8545 --broadcast

# 4. Agregar claims (desde UI)
# /manage → Issue Claim → KYC + AML

# 5. Mint tokens
cast send <TOKEN_ADDRESS> "mint(address,uint256)" $WALLET_ADDRESS 1000000000000000000000 \
  --rpc-url http://localhost:8545 --private-key $PRIVATE_KEY

# 6. Fast forward time
cast rpc evm_increaseTime 2592000
cast rpc evm_mine

# 7. Transfer (desde UI)
# /manage → Transfer Tokens
```

---

## Direcciones de Contratos (Actualizar según tu deploy)

```bash
Token: 0xfbC22278A96299D91d41C453234d97b4F5Eb9B2d
IdentityRegistry: 0xBEc49fA140aCaA83533fB00A2BB19bDdd0290f25
TrustedIssuersRegistry: 0xD84379CEae14AA33C123Af12424A37803F885889
ClaimTopicsRegistry: 0x2B0d36FACD61B71CC05ab8F3D2355ec3631C0dd5
```

(Estas direcciones están en `web/src/config/contracts.ts`)
