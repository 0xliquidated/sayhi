// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SayHi {
    string public uniqueSignature;

    event HiSaid(string message);
    event GMSaid(string message);
    event GNSaid(string message);

    constructor(string memory _uniqueSignature) {
        uniqueSignature = _uniqueSignature;
    }

    function sayHi() public {
        emit HiSaid("Hi!");
    }

    function sayGM() public {
        emit GMSaid("Good Morning!");
    }

    function sayGN() public {
        emit GNSaid("Good Night!");
    }

    function getUniqueSignature() public view returns (string memory) {
        return uniqueSignature;
    }
}