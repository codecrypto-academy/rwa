// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {IdentityCloneFactory} from "../src/IdentityCloneFactory.sol";

contract DeployCloneFactory is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying IdentityCloneFactory...");
        console.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the IdentityCloneFactory
        IdentityCloneFactory factory = new IdentityCloneFactory(deployer);

        vm.stopBroadcast();

        console.log("IdentityCloneFactory deployed at:", address(factory));
        console.log("Implementation contract:", factory.implementation());
        console.log("\nYou can now create Identity clones by calling:");
        console.log("factory.createIdentity(ownerAddress)");
    }
}
