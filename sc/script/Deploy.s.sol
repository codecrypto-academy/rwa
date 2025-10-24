// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Token} from "../src/Token.sol";
import {IdentityRegistry} from "../src/IdentityRegistry.sol";
import {TrustedIssuersRegistry} from "../src/TrustedIssuersRegistry.sol";
import {ClaimTopicsRegistry} from "../src/ClaimTopicsRegistry.sol";
import {MaxBalanceCompliance} from "../src/compliance/MaxBalanceCompliance.sol";
import {MaxHoldersCompliance} from "../src/compliance/MaxHoldersCompliance.sol";
import {TransferLockCompliance} from "../src/compliance/TransferLockCompliance.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying contracts with the account:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy registries
        IdentityRegistry identityRegistry = new IdentityRegistry(deployer);
        console.log("IdentityRegistry deployed at:", address(identityRegistry));

        TrustedIssuersRegistry trustedIssuersRegistry = new TrustedIssuersRegistry(deployer);
        console.log("TrustedIssuersRegistry deployed at:", address(trustedIssuersRegistry));

        ClaimTopicsRegistry claimTopicsRegistry = new ClaimTopicsRegistry(deployer);
        console.log("ClaimTopicsRegistry deployed at:", address(claimTopicsRegistry));

        // Deploy token
        Token token = new Token("Security Token", "SEC", 18, deployer);
        console.log("Token deployed at:", address(token));

        // Set registries in token
        token.setIdentityRegistry(address(identityRegistry));
        token.setTrustedIssuersRegistry(address(trustedIssuersRegistry));
        token.setClaimTopicsRegistry(address(claimTopicsRegistry));

        // Deploy compliance modules
        // Max balance: 1000 tokens
        MaxBalanceCompliance maxBalanceCompliance = new MaxBalanceCompliance(deployer, 1000 ether);
        maxBalanceCompliance.setTokenContract(address(token));
        console.log("MaxBalanceCompliance deployed at:", address(maxBalanceCompliance));

        // Max holders: 100
        MaxHoldersCompliance maxHoldersCompliance = new MaxHoldersCompliance(deployer, 100);
        maxHoldersCompliance.setTokenContract(address(token));
        console.log("MaxHoldersCompliance deployed at:", address(maxHoldersCompliance));

        // Transfer lock: 30 days
        TransferLockCompliance transferLockCompliance = new TransferLockCompliance(deployer, 30 days);
        transferLockCompliance.setTokenContract(address(token));
        console.log("TransferLockCompliance deployed at:", address(transferLockCompliance));

        // Add compliance modules to token
        token.addComplianceModule(address(maxBalanceCompliance));
        token.addComplianceModule(address(maxHoldersCompliance));
        token.addComplianceModule(address(transferLockCompliance));

        // Setup claim topics (require KYC = topic 1)
        claimTopicsRegistry.addClaimTopic(1);

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("Token:", address(token));
        console.log("IdentityRegistry:", address(identityRegistry));
        console.log("TrustedIssuersRegistry:", address(trustedIssuersRegistry));
        console.log("ClaimTopicsRegistry:", address(claimTopicsRegistry));
        console.log("MaxBalanceCompliance:", address(maxBalanceCompliance));
        console.log("MaxHoldersCompliance:", address(maxHoldersCompliance));
        console.log("TransferLockCompliance:", address(transferLockCompliance));
    }
}
