// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Create2.sol";

import "./Echo.sol";

contract Factory {
    constructor() {}

    function deploy(bytes32 salt) public returns (address) {
        address echo = address(new Echo{salt: salt}());
        return echo;
    }

    function getAddress(bytes32 salt) public view returns (address) {
        return
            Create2.computeAddress(
                salt,
                keccak256(abi.encodePacked(type(Echo).creationCode))
            );
    }
}
