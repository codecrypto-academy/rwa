

# Compliance Aggregator

## 📋 Descripción

El **ComplianceAggregator** es un contrato único que centraliza todas las reglas de compliance para múltiples tokens en un solo lugar, eliminando la necesidad de desplegar módulos de compliance separados para cada token.

## 🎯 Problema que Resuelve

### Antes (Módulos Separados)

```
Token 1 ──┬──► MaxBalanceCompliance #1
          ├──► MaxHoldersCompliance #1  
          └──► TransferLockCompliance #1

Token 2 ──┬──► MaxBalanceCompliance #2
          ├──► MaxHoldersCompliance #2
          └──► TransferLockCompliance #2

Token 3 ──┬──► MaxBalanceCompliance #3
          ├──► MaxHoldersCompliance #3
          └──► TransferLockCompliance #3

= 9 contratos deployados
= 9x costos de gas
= 9x gestión de contratos
```

### Ahora (Aggregator)

```
Token 1 ──┐
Token 2 ──┤──► ComplianceAggregator (único contrato)
Token 3 ──┘

= 1 contrato deployado
= 1x costos de gas
= 1x gestión centralizada
```

## 💡 Ventajas

### 1. **Reducción de Costos**
- Un solo deployment en lugar de múltiples
- Ahorro de ~60-70% en costos de compliance
- Gestión centralizada simplificada

### 2. **Gestión Simplificada**
- Configurar reglas para todos los tokens desde un único contrato
- Actualizar reglas sin redesplegar
- Vista unificada de compliance

### 3. **Flexibilidad**
- Reglas independientes por token
- Habilitar/deshabilitar reglas específicas
- Configuración granular

### 4. **Consistencia**
- Lógica de compliance estandarizada
- Comportamiento predecible
- Más fácil de auditar

## 📊 Reglas Soportadas

El ComplianceAggregator implementa tres reglas principales:

### 1. Max Balance (Saldo Máximo)
```solidity
// Ejemplo: Máximo 1000 tokens por wallet
maxBalance: 1000 ether
```
- Limita la cantidad máxima de tokens que puede tener una dirección
- Configurable por token
- Set a `0` para deshabilitar

### 2. Max Holders (Holders Máximos)
```solidity
// Ejemplo: Máximo 100 holders
maxHolders: 100
```
- Limita el número total de holders del token
- Tracking automático de holders
- Set a `0` para deshabilitar

### 3. Transfer Lock (Bloqueo de Transferencia)
```solidity
// Ejemplo: Lock de 30 días
lockPeriod: 30 days
```
- Período de bloqueo después de recibir tokens
- Previene venta inmediata
- Set a `0` para deshabilitar

## 🚀 Uso

### 1. Deploy del Aggregator

```solidity
// Deploy una sola vez
ComplianceAggregator aggregator = new ComplianceAggregator(owner);
```

### 2. Configurar Reglas para un Token

```solidity
// Configurar Token 1: Todas las reglas
aggregator.configureToken(
    address(token1),
    1000 ether,  // maxBalance
    100,         // maxHolders  
    30 days      // lockPeriod
);

// Configurar Token 2: Solo maxBalance
aggregator.configureToken(
    address(token2),
    500 ether,   // maxBalance
    0,           // maxHolders deshabilitado
    0            // lockPeriod deshabilitado
);

// Configurar Token 3: Solo lockPeriod
aggregator.configureToken(
    address(token3),
    0,           // maxBalance deshabilitado
    0,           // maxHolders deshabilitado
    90 days      // lockPeriod
);
```

### 3. Añadir al Token

```solidity
// Cada token usa el mismo agregador
token1.addComplianceModule(address(aggregator));
token2.addComplianceModule(address(aggregator));
token3.addComplianceModule(address(aggregator));
```

### 4. Actualizar Reglas

```solidity
// Actualizar maxBalance para token1
aggregator.setMaxBalance(address(token1), 2000 ether);

// Actualizar maxHolders para token2
aggregator.setMaxHolders(address(token2), 200);

// Actualizar lockPeriod para token3
aggregator.setLockPeriod(address(token3), 60 days);
```

## 📖 API Reference

### Configuración

#### `configureToken()`
Configura todas las reglas para un token de una vez.

```solidity
function configureToken(
    address token,
    uint256 maxBalance,
    uint256 maxHolders,
    uint256 lockPeriod
) external onlyOwner
```

**Parámetros:**
- `token`: Dirección del token
- `maxBalance`: Saldo máximo por wallet (0 = deshabilitado)
- `maxHolders`: Número máximo de holders (0 = deshabilitado)
- `lockPeriod`: Período de bloqueo en segundos (0 = deshabilitado)

**Ejemplo:**
```solidity
aggregator.configureToken(
    0x123...,     // token address
    1000 ether,   // max 1000 tokens per wallet
    50,           // max 50 holders
    30 days       // 30 day lock period
);
```

#### `setMaxBalance()`
Actualiza el saldo máximo para un token.

```solidity
function setMaxBalance(address token, uint256 maxBalance) external onlyOwner
```

#### `setMaxHolders()`
Actualiza el número máximo de holders para un token.

```solidity
function setMaxHolders(address token, uint256 maxHolders) external onlyOwner
```

#### `setLockPeriod()`
Actualiza el período de bloqueo para un token.

```solidity
function setLockPeriod(address token, uint256 lockPeriod) external onlyOwner
```

### Consultas

#### `getTokenRules()`
Obtiene todas las reglas configuradas para un token.

```solidity
function getTokenRules(address token) external view returns (
    uint256 maxBalance,
    uint256 maxHolders,
    uint256 lockPeriod,
    uint256 currentHolders,
    bool isConfigured
)
```

**Ejemplo:**
```solidity
(
    uint256 maxBalance,
    uint256 maxHolders,
    uint256 lockPeriod,
    uint256 currentHolders,
    bool isConfigured
) = aggregator.getTokenRules(tokenAddress);
```

#### `getHolderCount()`
Obtiene el número actual de holders de un token.

```solidity
function getHolderCount(address token) external view returns (uint256)
```

#### `getIsHolder()`
Verifica si una dirección es holder de un token.

```solidity
function getIsHolder(address token, address account) external view returns (bool)
```

#### `isLocked()`
Verifica si una dirección está bloqueada para un token.

```solidity
function isLocked(address token, address account) external view returns (bool)
```

#### `getRemainingLockTime()`
Obtiene el tiempo restante de bloqueo para una dirección.

```solidity
function getRemainingLockTime(address token, address account) external view returns (uint256)
```

#### `getHolders()`
Obtiene la lista de holders activos de un token.

```solidity
function getHolders(address token) external view returns (address[] memory)
```

⚠️ **Nota:** Esta función puede ser costosa en gas para tokens con muchos holders.

#### `isRuleEnabled()`
Verifica si una regla específica está habilitada para un token.

```solidity
function isRuleEnabled(address token, string calldata ruleName) external view returns (bool)
```

**Nombres de reglas:**
- `"maxBalance"`
- `"maxHolders"`
- `"lockPeriod"`

**Ejemplo:**
```solidity
bool hasMaxBalance = aggregator.isRuleEnabled(tokenAddress, "maxBalance");
bool hasMaxHolders = aggregator.isRuleEnabled(tokenAddress, "maxHolders");
bool hasLockPeriod = aggregator.isRuleEnabled(tokenAddress, "lockPeriod");
```

## 🎯 Casos de Uso

### Caso 1: Token con todas las reglas

```solidity
// Real Estate Token - Protección completa
aggregator.configureToken(
    address(realEstateToken),
    10000 ether,  // Max 10k tokens por inversor
    200,          // Max 200 inversores
    180 days      // Lock de 6 meses
);

realEstateToken.addComplianceModule(address(aggregator));
```

### Caso 2: Token solo con límite de balance

```solidity
// Stablecoin - Solo límite anti-ballena
aggregator.configureToken(
    address(stablecoin),
    1000000 ether,  // Max 1M por wallet
    0,              // Sin límite de holders
    0               // Sin lock period
);

stablecoin.addComplianceModule(address(aggregator));
```

### Caso 3: Token solo con lock period

```solidity
// Reward Token - Solo prevenir dump
aggregator.configureToken(
    address(rewardToken),
    0,       // Sin límite de balance
    0,       // Sin límite de holders
    7 days   // Lock de 1 semana
);

rewardToken.addComplianceModule(address(aggregator));
```

### Caso 4: Múltiples tokens con reglas diferentes

```solidity
// Gold Token - Muy restrictivo
aggregator.configureToken(
    address(goldToken),
    100 ether,    // Max 100 tokens
    50,           // Max 50 holders
    365 days      // Lock de 1 año
);

// Silver Token - Moderadamente restrictivo
aggregator.configureToken(
    address(silverToken),
    1000 ether,   // Max 1000 tokens
    500,          // Max 500 holders
    90 days       // Lock de 3 meses
);

// Bronze Token - Poco restrictivo
aggregator.configureToken(
    address(bronzeToken),
    10000 ether,  // Max 10k tokens
    0,            // Sin límite de holders
    30 days       // Lock de 1 mes
);

// Todos usan el mismo aggregator
goldToken.addComplianceModule(address(aggregator));
silverToken.addComplianceModule(address(aggregator));
bronzeToken.addComplianceModule(address(aggregator));
```

## 🔧 Scripts de Deployment

### Script de Deploy

```solidity
// script/DeployComplianceAggregator.s.sol
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ComplianceAggregator} from "../src/compliance/ComplianceAggregator.sol";

contract DeployComplianceAggregator is Script {
    function run() external returns (ComplianceAggregator) {
        address owner = msg.sender;
        
        vm.startBroadcast();
        
        ComplianceAggregator aggregator = new ComplianceAggregator(owner);
        
        vm.stopBroadcast();
        
        console.log("ComplianceAggregator deployed at:", address(aggregator));
        return aggregator;
    }
}
```

### Uso del Script

```bash
# Deploy en local
forge script script/DeployComplianceAggregator.s.sol --rpc-url localhost --broadcast

# Deploy en testnet
forge script script/DeployComplianceAggregator.s.sol --rpc-url sepolia --broadcast --verify
```

## 🧪 Tests

El ComplianceAggregator incluye 24 tests comprehensivos:

```bash
# Ejecutar tests
forge test --match-contract ComplianceAggregatorTest -vv

# Con gas report
forge test --match-contract ComplianceAggregatorTest --gas-report
```

**Tests incluidos:**
- ✅ Configuración de tokens
- ✅ Múltiples tokens independientes
- ✅ Max balance enforcement
- ✅ Max holders tracking
- ✅ Transfer lock enforcement  
- ✅ Reglas combinadas
- ✅ Habilitar/deshabilitar reglas
- ✅ Edge cases y validaciones

## 📊 Comparación de Costos

### Deployment

| Enfoque | Contratos | Gas Estimado |
|---------|-----------|--------------|
| Módulos Separados (3 tokens) | 9 contratos | ~2.7M gas |
| **ComplianceAggregator** | **1 contrato** | **~900K gas** |
| **Ahorro** | **-8 contratos** | **~1.8M gas (67%)** |

### Gestión

| Aspecto | Módulos Separados | ComplianceAggregator |
|---------|-------------------|---------------------|
| Actualizar regla | 3 txs (una por módulo) | 1 tx |
| Ver estado | Consultar 3 contratos | Consultar 1 contrato |
| Añadir token | Deploy 3 contratos | Solo configurar |

## ⚠️ Consideraciones

### 1. Token No Configurado

Si un token no está configurado, el aggregator permite todas las transferencias:

```solidity
// Token sin configurar
token.addComplianceModule(address(aggregator));
// ✅ Todas las transferencias permitidas

// Solución: Configurar el token
aggregator.configureToken(address(token), maxBalance, maxHolders, lockPeriod);
```

### 2. Deshabilitar Reglas

Para deshabilitar una regla, se establece en `0`:

```solidity
// Deshabilitar maxBalance
aggregator.setMaxBalance(address(token), 0);

// Deshabilitar todas las reglas
aggregator.configureToken(address(token), 0, 0, 0);
```

### 3. Max Holders y Balance Actual

No puedes reducir `maxHolders` por debajo del número actual de holders:

```solidity
// Si tienes 50 holders actuales
aggregator.setMaxHolders(address(token), 30); // ❌ Revert
aggregator.setMaxHolders(address(token), 50); // ✅ OK
aggregator.setMaxHolders(address(token), 100); // ✅ OK
```

### 4. Gas Considerations

La función `getHolders()` puede ser costosa para tokens con muchos holders. Úsala con cuidado en transacciones on-chain.

## 🔐 Seguridad

### Permisos

- Solo el `owner` puede configurar reglas
- Los tokens llaman automáticamente a las funciones de compliance
- Sin riesgo de re-entrancy (solo lecturas de balance)

### Validaciones

- ✅ Verificación de direcciones válidas
- ✅ Verificación de configuración previa
- ✅ Prevención de reducción de maxHolders bajo el actual
- ✅ Handles de balances cero correctamente

### Tests de Seguridad

```bash
# Tests de permisos
forge test --match-test "RevertWhen"

# Tests de edge cases
forge test --match-contract ComplianceAggregatorTest -vv
```

## 📈 Próximas Mejoras

### Corto Plazo
- [ ] Eventos más detallados
- [ ] Paginación para `getHolders()`
- [ ] Whitelist de direcciones exentas

### Mediano Plazo
- [ ] Reglas dinámicas basadas en tiempo
- [ ] Límites por período (ej: max transfers por día)
- [ ] Integración con oráculos

### Largo Plazo
- [ ] Reglas basadas en governance
- [ ] Compliance programable (plugins)
- [ ] Multi-chain support

## 🎓 Referencias

- [ERC-3643 Standard](https://erc3643.org/)
- [OpenZeppelin Ownable](https://docs.openzeppelin.com/contracts/4.x/api/access#Ownable)
- [ICompliance Interface](/sc/src/ICompliance.sol)

## 📞 Soporte

Para preguntas o issues:
1. Revisar esta documentación
2. Consultar los tests en `test/ComplianceAggregator.t.sol`
3. Ver ejemplos de uso en la sección de Casos de Uso

---

**¡Compliance centralizado y eficiente! 🎉**

