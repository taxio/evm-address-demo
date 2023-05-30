// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Echo {
    constructor() {}

    function say(string memory message) external pure returns (string memory) {
        return message;
    }
}
