# Quick Start: Token Clone Factory

## 🚀 Prueba Rápida en Local

### 1. Iniciar Anvil

```bash
# Terminal 1
anvil
```

### 2. Compilar Contratos

```bash
# Terminal 2
cd sc
forge build
```

### 3. Desplegar el Factory y Crear un Token

```bash
# Opción A: Deploy y crear todo automáticamente
forge script script/CreateTokenWithCloneFactory.s.sol:CreateTokenWithCloneFactory --rpc-url localhost --broadcast

# Opción B: Paso a paso
# 1. Primero deploy el factory
forge script script/DeployTokenCloneFactory.s.sol:DeployTokenCloneFactory --rpc-url localhost --broadcast

# 2. Luego crear tokens (reemplaza FACTORY_ADDRESS con la dirección del paso anterior)
forge script script/CreateTokenWithCloneFactory.s.sol:CreateTokenWithCloneFactory \
  --rpc-url localhost \
  --broadcast \
  --sig "run(address,string,string,uint8,address)" \
  FACTORY_ADDRESS \
  "Real Estate Token" \
  "RET" \
  18 \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### 4. Ejecutar Tests

```bash
# Todos los tests
forge test

# Solo tests del Clone Factory
forge test --match-contract TokenCloneFactoryTest -vv

# Con detalles de gas
forge test --match-contract TokenCloneFactoryTest --gas-report
```

## 📊 Comparación de Costos

### Deployment Directo de Token

```bash
# Costo: ~3,700,000 gas
forge create --rpc-url localhost \
  --constructor-args "My Token" "MTK" 18 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  src/Token.sol:Token
```

### Deployment con Clone Factory

```bash
# 1. Deploy factory una sola vez
# Costo: ~3,800,000 gas (incluye implementation)
forge script script/DeployTokenCloneFactory.s.sol --rpc-url localhost --broadcast

# 2. Crear tokens (cada uno)
# Costo: ~365,000 gas por token
# Ahorro: ~3,335,000 gas por token adicional (90%)
```

## 💡 Ejemplo de Uso en Solidity

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {TokenCloneFactory} from "./TokenCloneFactory.sol";
import {TokenCloneable} from "./TokenCloneable.sol";

contract MyPlatform {
    TokenCloneFactory public factory;
    
    constructor(address factoryAddress) {
        factory = TokenCloneFactory(factoryAddress);
    }
    
    // Crear un token simple
    function createSimpleToken(
        string memory name,
        string memory symbol,
        address admin
    ) external returns (address) {
        return factory.createToken(name, symbol, 18, admin);
    }
    
    // Crear un token con configuración completa
    function createConfiguredToken(
        string memory name,
        string memory symbol,
        address admin,
        address identityRegistry,
        address trustedIssuersRegistry,
        address claimTopicsRegistry
    ) external returns (address) {
        return factory.createTokenWithRegistries(
            name,
            symbol,
            18,
            admin,
            identityRegistry,
            trustedIssuersRegistry,
            claimTopicsRegistry
        );
    }
    
    // Obtener todos los tokens de un admin
    function getAdminTokens(address admin) 
        external 
        view 
        returns (address[] memory) 
    {
        return factory.getTokensByAdmin(admin);
    }
}
```

## 🔧 Interacción con Cast

```bash
# Variables
FACTORY_ADDRESS="0x..."
ADMIN_ADDRESS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

# Crear un token
cast send $FACTORY_ADDRESS \
  "createToken(string,string,uint8,address)" \
  "Security Token" "SEC" 18 $ADMIN_ADDRESS \
  --rpc-url localhost \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Ver tokens totales creados
cast call $FACTORY_ADDRESS "getTotalTokens()" --rpc-url localhost

# Ver tokens de un admin
cast call $FACTORY_ADDRESS \
  "getTokensByAdmin(address)" \
  $ADMIN_ADDRESS \
  --rpc-url localhost

# Ver información de ahorro de gas
cast call $FACTORY_ADDRESS "getGasSavingsInfo()" --rpc-url localhost
```

## 📈 Casos de Uso Reales

### 1. Plataforma de Tokenización de Real Estate

```solidity
// Cada propiedad es un token diferente
address property1 = factory.createToken("Manhattan Apt 301", "MHT301", 18, admin);
address property2 = factory.createToken("LA House 123", "LAH123", 18, admin);
address property3 = factory.createToken("Miami Condo 4A", "MIA4A", 18, admin);

// Ahorro: ~10M gas vs deployment directo
```

### 2. Plataforma de Activos Múltiples

```solidity
// Diferentes tipos de activos
address goldToken = factory.createToken("Gold Backed Token", "GOLD", 18, admin);
address silverToken = factory.createToken("Silver Backed Token", "SLVR", 18, admin);
address artToken = factory.createToken("Art Collection Token", "ART", 18, admin);
```

### 3. Testing y Desarrollo

```solidity
// Crear múltiples tokens para testing sin preocuparse por gas
for (uint i = 0; i < 100; i++) {
    factory.createToken(
        string.concat("Test Token ", vm.toString(i)),
        string.concat("TST", vm.toString(i)),
        18,
        testAdmin
    );
}
```

## 🎯 Siguiente Paso: Integración Web

Ver `TOKEN_CLONE_FACTORY.md` para:
- Arquitectura detallada
- Consideraciones de seguridad
- Integración con frontend
- Comparación con otros patrones

## 📚 Documentación Completa

- `TOKEN_CLONE_FACTORY.md` - Documentación completa del patrón
- `CHANGELOG.md` - Historial de cambios
- `README.md` - Información general del proyecto

