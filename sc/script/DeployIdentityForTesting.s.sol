// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Identity} from "../src/Identity.sol";
import {IdentityRegistry} from "../src/IdentityRegistry.sol";

/**
 * @title DeployIdentityForTesting
 * @dev Script to deploy an Identity contract with deployer as owner for testing
 * This allows the deployer to add claims to the identity for testing purposes
 */
contract DeployIdentityForTesting is Script {
    function run() external {
        // Get deployer address
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Get wallet address to register (can be same as deployer for testing)
        address walletToRegister = vm.envOr("WALLET_ADDRESS", deployer);

        // Get IdentityRegistry address
        address identityRegistryAddress = vm.envAddress("IDENTITY_REGISTRY_ADDRESS");

        console.log("========================================");
        console.log("Deploying Identity for Testing");
        console.log("========================================");
        console.log("Deployer:", deployer);
        console.log("Wallet to register:", walletToRegister);
        console.log("Identity owner (deployer for testing):", deployer);
        console.log("IdentityRegistry:", identityRegistryAddress);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Identity with DEPLOYER as owner (not the wallet owner)
        // This allows deployer to add claims for testing
        Identity identity = new Identity(deployer);
        console.log("Identity deployed at:", address(identity));

        // Register the identity in the registry
        IdentityRegistry registry = IdentityRegistry(identityRegistryAddress);
        registry.registerIdentity(walletToRegister, address(identity));
        console.log("Identity registered for wallet:", walletToRegister);

        vm.stopBroadcast();

        console.log("========================================");
        console.log("SUCCESS!");
        console.log("========================================");
        console.log("You can now add claims to this identity from your deployer wallet");
        console.log("");
        console.log("Example: Add KYC claim");
        console.log("  Identity Address:", address(identity));
        console.log("  Wallet Address:", walletToRegister);
        console.log("  Owner:", deployer);
    }
}
