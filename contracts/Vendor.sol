// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "./StreamToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./library/PriceConverter.sol";

error Vendor__YearlyEarnLimitReached();

contract Vendor is Ownable {
    using PriceConverter for uint256;

    struct EarningAddress {
        bool startedStreaming;
        uint256 dollarWorthOfTokensEarned;
        uint256 maxEarnTime;
    }

    // Our Token Contract
    StreamToken streamToken;

    // token price for ETH
    uint256 public constant tokensPerEth = 10;
    uint256 public constant MINIMUM_USD = 0.5 * 1e18;
    uint256 public s_maxTokenEarn;
    AggregatorV3Interface private s_priceFeed;
    address[] private s_buyers;

    // Event that log buy operation
    event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);
    event SellTokens(
        address seller,
        uint256 amountOfTokens,
        uint256 amountOfETH
    );

    mapping(address => uint256) private s_addressToAmountBought;
    mapping(address => EarningAddress) public addressToTokensEarned;

    // ethToUSd => 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
    constructor(address tokenAddress, address priceFeedAddress) {
        streamToken = StreamToken(tokenAddress);
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /**
     * @notice Allow users to buy tokens for coin
     */

    function buyTokens() public payable returns (uint256 tokenAmount) {
        require(msg.value > 0, "Send ETH to buy some tokens");
        // require(msg.value.getConversionRate(s_priceFeed) > MINIMUM_USD, "Didn't send enough!"); // 1 * 10 ^ 18

        uint256 amountToBuy = msg.value * tokensPerEth;

        // check if the Vendor Contract has enough amount of tokens for the transaction
        uint256 vendorBalance = streamToken.balanceOf(address(this));
        require(
            vendorBalance >= amountToBuy,
            "Vendor contract has not enough tokens in its balance"
        );

        // Transfer token to the msg.sender
        bool sent = streamToken.transfer(msg.sender, amountToBuy);
        s_buyers.push(msg.sender);
        s_addressToAmountBought[msg.sender] = msg.value;

        require(sent, "Failed to transfer token to user");

        // emit the event
        emit BuyTokens(msg.sender, msg.value, amountToBuy);

        return amountToBuy;
    }

    /**
     * @notice Allow users to sell tokens for ETH
     */
    function sellTokens(uint256 tokenAmountToSell) public {
        // Check that the requested amount of tokens to sell is more than 0
        require(
            tokenAmountToSell > 0,
            "Specify an amount of token greater than zero"
        );

        // Check that the user's token balance is enough to do the swap
        uint256 userBalance = streamToken.balanceOf(msg.sender);
        require(
            userBalance >= tokenAmountToSell,
            "Your balance is lower than the amount of tokens you want to sell"
        );

        // Check that the Vendor's balance is enough to do the swap
        uint256 amountOfETHToTransfer = tokenAmountToSell / tokensPerEth;
        uint256 ownerETHBalance = address(this).balance;
        require(
            ownerETHBalance >= amountOfETHToTransfer,
            "Vendor has not enough funds to accept the sell request"
        );

        bool sent = streamToken.transferFrom(
            msg.sender,
            address(this),
            tokenAmountToSell
        );
        require(sent, "Failed to transfer tokens from user to vendor");

        (sent, ) = msg.sender.call{value: amountOfETHToTransfer}("");
        require(sent, "Failed to send ETH to the user");
    }

    /**
     * @notice Allow the owner of the contract to withdraw ETH
     */
    function withdraw() public onlyOwner {
        uint256 ownerBalance = address(this).balance;
        require(ownerBalance > 0, "Owner has not balance to withdraw");

        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to send user balance back to the owner");
    }

    function streamToEarn(address streamer, uint256 amount) external {
        EarningAddress storage earningAddress = addressToTokensEarned[streamer];
        // condition for streamers
        if (earningAddress.startedStreaming == false) {
            require(
                amount <= s_maxTokenEarn,
                "Amount is greater than max earn limit"
            );
            uint256 earnTime = block.timestamp + 31536000;
            earningAddress.maxEarnTime = earnTime;
            earningAddress.startedStreaming = true;
            // send $ worth of token
            // Transfer token to the streamer
            bool sent = streamToken.transfer(streamer, amount);
            require(sent, "Failed to transfer token to vendor");
            earningAddress.dollarWorthOfTokensEarned =
                earningAddress.dollarWorthOfTokensEarned +
                amount;
        }
        // if the yearly limit is passed unlock a new year limit and revert earnings to zero
        else if (block.timestamp >= earningAddress.maxEarnTime) {
            uint256 newEarnTime = block.timestamp + 31536000;
            earningAddress.maxEarnTime = newEarnTime;
            earningAddress.dollarWorthOfTokensEarned = 0;
            // Transfer token to the streamer
            bool sent = streamToken.transfer(streamer, amount);
            require(sent, "Failed to transfer token to streamer");
        }
        // condition for maximum token limit
        else if (earningAddress.dollarWorthOfTokensEarned >= s_maxTokenEarn) {
            revert Vendor__YearlyEarnLimitReached();
        } else {
            uint256 earnTime = block.timestamp + 31536000;
            earningAddress.maxEarnTime = earnTime;
            earningAddress.startedStreaming = true;
            // send $ worth of token
            // Transfer token to the streamer
            bool sent = streamToken.transfer(streamer, amount);
            require(sent, "Failed to transfer token to streamer");
            earningAddress.dollarWorthOfTokensEarned =
                earningAddress.dollarWorthOfTokensEarned +
                amount;
        }
    }

    function setMaxTokenWorth(uint256 max) external onlyOwner {
        s_maxTokenEarn = max;
    }

    function getMaxTokenWorth() external view returns (uint256) {
        return s_maxTokenEarn;
    }
}
