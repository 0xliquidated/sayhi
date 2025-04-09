// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Ponzi is ERC20, Ownable {
    // Struct to store user data
    struct User {
        bool hasEntered; // Whether the user has entered the Ponzi game
        uint256 lastUpdate; // Last time the user's rewards were updated
        uint256 accumulatedTokens; // Tokens accumulated but not yet claimed
        uint256 emissionRate; // Tokens earned per second
    }

    // Mapping of user addresses to their data
    mapping(address => User) public users;

    // Base emission rate (tokens per second)
    uint256 public constant BASE_EMISSION_RATE = 1e18; // 1 token per second (adjust as needed)

    // Event emitted when a user enters the Ponzi game
    event EnteredPonzi(address indexed user, uint256 timestamp);

    // Event emitted when a user claims their tokens
    event Claimed(address indexed user, uint256 amount);

    // Event emitted when a user burns tokens to double their emission rate
    event BurnedAndDoubled(address indexed user, uint256 amountBurned, uint256 newEmissionRate);

    constructor() ERC20("Ponzi", "PONZI") Ownable(msg.sender) {}

    // Function for users to enter the Ponzi game
    function enterPonzi() external {
        User storage user = users[msg.sender];
        require(!user.hasEntered, "User has already entered the Ponzi game");

        user.hasEntered = true;
        user.lastUpdate = block.timestamp;
        user.emissionRate = BASE_EMISSION_RATE; // Start with base emission rate

        emit EnteredPonzi(msg.sender, block.timestamp);
    }

    // Function to calculate accumulated tokens for a user
    function calculateAccumulatedTokens(address userAddress) public view returns (uint256) {
        User storage user = users[userAddress];
        if (!user.hasEntered) {
            return 0;
        }

        uint256 timeElapsed = block.timestamp - user.lastUpdate;
        return user.accumulatedTokens + (timeElapsed * user.emissionRate);
    }

    // Function to update a user's accumulated tokens
    function updateAccumulatedTokens(address userAddress) internal {
        User storage user = users[userAddress];
        if (user.hasEntered) {
            user.accumulatedTokens = calculateAccumulatedTokens(userAddress);
            user.lastUpdate = block.timestamp;
        }
    }

    // Function for users to claim their accumulated tokens
    function claimTokens() external {
        updateAccumulatedTokens(msg.sender);
        User storage user = users[msg.sender];
        require(user.hasEntered, "User has not entered the Ponzi game");
        require(user.accumulatedTokens > 0, "No tokens to claim");

        uint256 amount = user.accumulatedTokens;
        user.accumulatedTokens = 0;
        _mint(msg.sender, amount);

        emit Claimed(msg.sender, amount);
    }

    // Function for users to burn their tokens and double their emission rate
    function burnAndDouble() external {
        updateAccumulatedTokens(msg.sender);
        User storage user = users[msg.sender];
        require(user.hasEntered, "User has not entered the Ponzi game");

        uint256 balance = balanceOf(msg.sender);
        require(balance > 0, "No tokens to burn");

        _burn(msg.sender, balance);
        user.emissionRate = user.emissionRate * 2;

        emit BurnedAndDoubled(msg.sender, balance, user.emissionRate);
    }

    // Function to get a user's current emission rate
    function getEmissionRate(address userAddress) external view returns (uint256) {
        return users[userAddress].emissionRate;
    }

    // Function to get a user's accumulated tokens without updating
    function getAccumulatedTokens(address userAddress) external view returns (uint256) {
        return calculateAccumulatedTokens(userAddress);
    }

    // Function to check if a user has entered the Ponzi game
    function hasUserEntered(address userAddress) external view returns (bool) {
        return users[userAddress].hasEntered;
    }
}