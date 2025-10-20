// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Identity} from "../src/Identity.sol";
import {IdentityRegistry} from "../src/IdentityRegistry.sol";
import {TrustedIssuersRegistry} from "../src/TrustedIssuersRegistry.sol";

/**
 * @title SetupForTesting
 * @dev Sets up a complete testing environment:
 *      1. Deploy Identity with deployer as owner
 *      2. Register it in IdentityRegistry
 *      3. Add deployer as trusted issuer
 *      4. Add a KYC claim to the identity
 */
contract SetupForTesting is Script {
    // Contract addresses from Deploy.s.sol output
    address constant IDENTITY_REGISTRY = 0x5FbDB2315678afecb367f032d93F642f64180aa3;
    address constant TRUSTED_ISSUERS_REGISTRY = 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Setting up testing environment for:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Identity with deployer as owner
        Identity identity = new Identity(deployer);
        console.log("Identity deployed at:", address(identity));
        console.log("Identity owner:", identity.owner());

        // 2. Register identity in IdentityRegistry
        IdentityRegistry identityRegistry = IdentityRegistry(IDENTITY_REGISTRY);
        identityRegistry.registerIdentity(deployer, address(identity));
        console.log("Identity registered for wallet:", deployer);

        // 3. Add deployer as trusted issuer with all claim topics
        TrustedIssuersRegistry trustedIssuersRegistry = TrustedIssuersRegistry(TRUSTED_ISSUERS_REGISTRY);
        uint256[] memory claimTopics = new uint256[](4);
        claimTopics[0] = 1; // KYC
        claimTopics[1] = 2; // AML
        claimTopics[2] = 3; // Accredited Investor
        claimTopics[3] = 4; // Residence

        trustedIssuersRegistry.addTrustedIssuer(deployer, claimTopics);
        console.log("Deployer added as trusted issuer for all claim topics");

        // 4. Add KYC claim to identity
        bytes memory claimData = abi.encodePacked("KYC Verified - Testing");
        identity.addClaim(
            1, // topic: KYC
            1, // scheme: ECDSA
            deployer, // issuer
            "", // signature (empty for testing)
            claimData,
            "" // uri (empty for testing)
        );
        console.log("KYC claim added to identity");

        vm.stopBroadcast();

        console.log("\n=== Setup Complete ===");
        console.log("Wallet:", deployer);
        console.log("Identity Contract:", address(identity));
        console.log("Status: Ready to test in web app!");
    }
}
