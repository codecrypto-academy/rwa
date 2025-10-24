# Token Clone Factory

## Descripción

El `TokenCloneFactory` es un contrato que implementa el patrón **EIP-1167 Minimal Proxy** (también conocido como Clone Factory) para crear múltiples instancias del contrato `Token` de forma eficiente en gas.

## ¿Por qué usar Clone Factory?

### Ahorro de Gas

La creación de contratos Token completos es costosa en gas. El patrón Clone Factory reduce significativamente estos costos:

- **Deployment directo**: ~3,000,000 gas
- **Clone deployment**: ~365,000 gas
- **Ahorro**: ~2,635,000 gas por token (~88% de ahorro)

### Casos de Uso

Este patrón es ideal cuando necesitas:
- Crear múltiples tokens con configuraciones similares
- Reducir costos de deployment en producción
- Facilitar la creación de tokens para diferentes activos (RWA)
- Permitir que usuarios o administradores creen tokens bajo demanda

## Arquitectura

### Contratos Principales

1. **TokenCloneable.sol**: Versión del Token compatible con clonación
   - Hereda de contratos Upgradeable de OpenZeppelin
   - Usa `initialize()` en lugar de `constructor()`
   - Deshabilita inicializadores en el constructor para evitar re-inicialización

2. **TokenCloneFactory.sol**: Fábrica para crear clones
   - Despliega una implementación única de TokenCloneable
   - Crea clones usando `Clones.clone()`
   - Mantiene registro de todos los tokens creados
   - Ofrece métodos helper para configuración inicial

### Diferencias entre Token y TokenCloneable

| Aspecto | Token | TokenCloneable |
|---------|-------|----------------|
| Herencia base | ERC20, AccessControl, Pausable | ERC20Upgradeable, AccessControlUpgradeable, PausableUpgradeable |
| Inicialización | constructor() | initialize() |
| Costo deployment | ~3M gas | ~365K gas (usando factory) |
| Uso | Deployment directo | Clonado vía factory |

## Uso

### 1. Desplegar la Factory

```bash
forge script script/DeployTokenCloneFactory.s.sol:DeployTokenCloneFactory --rpc-url localhost --broadcast
```

Este comando:
- Despliega el contrato de implementación TokenCloneable
- Despliega el TokenCloneFactory
- Muestra la información de ahorro de gas

### 2. Crear un Token (Básico)

#### Via Script

```bash
forge script script/CreateTokenWithCloneFactory.s.sol:CreateTokenWithCloneFactory \
  --rpc-url localhost \
  --broadcast \
  --sig "run(address,string,string,uint8,address)" \
  <FACTORY_ADDRESS> \
  "Security Token" \
  "SEC" \
  18 \
  <ADMIN_ADDRESS>
```

#### Via Solidity

```solidity
TokenCloneFactory factory = TokenCloneFactory(factoryAddress);

address tokenAddress = factory.createToken(
    "Security Token",  // name
    "SEC",             // symbol
    18,                // decimals
    adminAddress       // admin
);
```

### 3. Crear un Token con Registries Pre-configurados

Este método permite crear un token y configurar los registries en una sola transacción:

```solidity
address tokenAddress = factory.createTokenWithRegistries(
    "Security Token",
    "SEC",
    18,
    adminAddress,
    identityRegistryAddress,
    trustedIssuersRegistryAddress,
    claimTopicsRegistryAddress
);
```

## Funcionalidades del Factory

### Métodos Principales

#### `createToken()`
Crea un nuevo token con configuración básica.

```solidity
function createToken(
    string memory name_,
    string memory symbol_,
    uint8 decimals_,
    address admin
) external returns (address token)
```

#### `createTokenWithRegistries()`
Crea un token con registries pre-configurados.

```solidity
function createTokenWithRegistries(
    string memory name_,
    string memory symbol_,
    uint8 decimals_,
    address admin,
    address identityRegistry,
    address trustedIssuersRegistry,
    address claimTopicsRegistry
) external returns (address token)
```

### Métodos de Consulta

#### `getTokensByAdmin(address admin)`
Retorna todos los tokens creados para un administrador específico.

#### `getTotalTokens()`
Retorna el número total de tokens creados por la factory.

#### `getTokenAt(uint256 index)`
Retorna la dirección del token en el índice especificado.

#### `getGasSavingsInfo()`
Retorna información sobre el ahorro de gas al usar clones.

## Tests

Los tests verifican:
- ✅ Deployment correcto del factory
- ✅ Creación de tokens individuales
- ✅ Creación de múltiples tokens
- ✅ Tracking de tokens por admin
- ✅ Configuración de registries
- ✅ Independencia entre clones
- ✅ Funcionalidad completa de tokens clonados
- ✅ Ahorro significativo de gas
- ✅ Validaciones de parámetros

### Ejecutar Tests

```bash
cd sc
forge test --match-contract TokenCloneFactoryTest -vv
```

### Resultados de Gas Medidos

```
Clone deployment gas:    364,903
Direct deployment gas: 3,736,079
Gas saved:            3,371,176 (90.2% ahorro)
```

## Consideraciones de Seguridad

### 1. Inicialización Única
- El constructor deshabilita inicializadores para prevenir re-inicialización
- Cada clone solo puede ser inicializado una vez

### 2. Roles y Permisos
- El admin recibe todos los roles (DEFAULT_ADMIN_ROLE, AGENT_ROLE, COMPLIANCE_ROLE)
- El factory no retiene ningún rol después de la creación

### 3. Independencia de Clones
- Cada clone es completamente independiente
- Los cambios en un clone no afectan a otros
- Cada clone tiene su propio estado y storage

### 4. Immutable Implementation
- La dirección de implementación es inmutable
- No puede ser cambiada después del deployment del factory

## Ventajas del Patrón

1. **Eficiencia de Gas**: Ahorro del ~90% en deployment
2. **Estandarización**: Todos los tokens siguen la misma implementación
3. **Mantenibilidad**: Código centralizado en un solo contrato de implementación
4. **Trazabilidad**: El factory mantiene registro de todos los tokens creados
5. **Flexibilidad**: Permite crear tokens con diferentes configuraciones

## Limitaciones

1. **No Upgradeable**: Los clones no son upgradeables (por diseño)
2. **Overhead de Llamadas**: Pequeño overhead en cada llamada debido al proxy
3. **Dependencia del Factory**: Se necesita el factory para crear nuevos tokens

## Comparación con Otros Patrones

### vs Deployment Directo
- ✅ Mucho más barato en gas
- ✅ Mantiene registro de tokens
- ⚠️ Pequeño overhead en llamadas

### vs Proxy Upgradeable (UUPS/Transparent)
- ✅ Más simple y económico
- ✅ No requiere gestión de upgrades
- ❌ No es upgradeable

### vs Beacon Proxy
- ✅ Más económico en deployment
- ❌ No permite actualizar implementación

## Recursos

- [EIP-1167: Minimal Proxy Contract](https://eips.ethereum.org/EIPS/eip-1167)
- [OpenZeppelin Clones](https://docs.openzeppelin.com/contracts/4.x/api/proxy#Clones)
- [Upgradeable Contracts](https://docs.openzeppelin.com/contracts/4.x/upgradeable)

## Próximos Pasos

1. ✅ Implementar TokenCloneable y TokenCloneFactory
2. ✅ Crear tests completos
3. ✅ Crear scripts de deployment
4. 🔄 Integrar con el frontend web
5. 🔄 Documentar ABIs para integración
6. 🔄 Desplegar en testnet

## Licencia

MIT

