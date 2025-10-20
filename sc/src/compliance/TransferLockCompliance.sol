// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ICompliance} from "../ICompliance.sol";

/**
 * @title TransferLockCompliance
 * @dev Compliance module that enforces transfer lock period
 * Implements rule #3: Lock-up period for selling tokens
 */
contract TransferLockCompliance is ICompliance, Ownable {
    // Lock period duration in seconds
    uint256 public lockPeriod;

    // Token contract address
    address public tokenContract;

    // Mapping from address to their lock end time
    mapping(address => uint256) private lockEndTime;

    event LockPeriodSet(uint256 lockPeriod);
    event TransferLocked(address indexed account, uint256 lockEndTime);

    modifier onlyToken() {
        require(msg.sender == tokenContract, "Only token contract can call");
        _;
    }

    constructor(address initialOwner, uint256 _lockPeriod) Ownable(initialOwner) {
        lockPeriod = _lockPeriod;
        emit LockPeriodSet(_lockPeriod);
    }

    /**
     * @dev Set the token contract address
     * @param _token Token contract address
     */
    function setTokenContract(address _token) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        tokenContract = _token;
    }

    /**
     * @dev Set the lock period
     * @param _lockPeriod New lock period in seconds
     */
    function setLockPeriod(uint256 _lockPeriod) external onlyOwner {
        lockPeriod = _lockPeriod;
        emit LockPeriodSet(_lockPeriod);
    }

    /**
     * @dev Check if sender can transfer (lock period expired)
     * @param from Sender address
     */
    function canTransfer(address from, address /* to */, uint256 /* amount */) external view override returns (bool) {
        // Check if sender's lock period has expired
        return block.timestamp >= lockEndTime[from];
    }

    /**
     * @dev Called after transfer to set lock on recipient
     * @param to Recipient address
     */
    function transferred(address /* from */, address to, uint256 /* amount */) external override onlyToken {
        // Set lock period for recipient
        uint256 newLockEndTime = block.timestamp + lockPeriod;
        lockEndTime[to] = newLockEndTime;
        emit TransferLocked(to, newLockEndTime);
    }

    /**
     * @dev Called after minting to set lock on recipient
     * @param to Recipient address
     */
    function created(address to, uint256 /* amount */) external override onlyToken {
        // Set lock period for new token holder
        uint256 newLockEndTime = block.timestamp + lockPeriod;
        lockEndTime[to] = newLockEndTime;
        emit TransferLocked(to, newLockEndTime);
    }

    /**
     * @dev Called after burning - no action needed for this module
     */
    function destroyed(address /* from */, uint256 /* amount */) external override onlyToken {
        // No state changes needed
    }

    /**
     * @dev Get the lock end time for an address
     * @param account Address to check
     */
    function getLockEndTime(address account) external view returns (uint256) {
        return lockEndTime[account];
    }

    /**
     * @dev Check if an address is currently locked
     * @param account Address to check
     */
    function isLocked(address account) external view returns (bool) {
        return block.timestamp < lockEndTime[account];
    }

    /**
     * @dev Get remaining lock time for an address
     * @param account Address to check
     */
    function getRemainingLockTime(address account) external view returns (uint256) {
        if (block.timestamp >= lockEndTime[account]) {
            return 0;
        }
        return lockEndTime[account] - block.timestamp;
    }
}
