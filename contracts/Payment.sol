// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./StreamToken.sol";
import "./library/PriceConverter.sol";

contract Payment is Ownable {
    using PriceConverter for uint256;

    StreamToken streamToken;
    uint256 public nextPlanId;
    address private i_vendorAddress;
    AggregatorV3Interface private s_priceFeed;

    struct Plan {
        string planName;
        address merchant;
        // address token;
        uint256 amount;
        uint256 frequency;
    }
    struct Subscription {
        address subscriber;
        uint256 start;
        uint256 nextPayment;
    }
    mapping(uint256 => Plan) public plans;
    mapping(address => mapping(uint256 => Subscription)) public subscriptions;

    event PlanCreated(
        string planName,
        address merchant,
        uint256 planId,
        uint256 date
    );
    event SubscriptionCreated(address subscriber, uint256 planId, uint256 date);
    event SubscriptionCancelled(
        address subscriber,
        uint256 planId,
        uint256 date
    );
    event PaymentSent(
        address from,
        address to,
        uint256 amount,
        uint256 planId,
        uint256 date
    );

    constructor(
        address tokenAddress,
        address vendorAddress,
        address priceFeedAddress
    ) {
        streamToken = StreamToken(tokenAddress);
        i_vendorAddress = vendorAddress;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function createPlan(
        string memory _planName,
        /*address token,*/ uint256 amount,
        uint256 frequency
    ) external onlyOwner {
        // require(token != address(0), "address cannot be null address");
        require(amount > 0, "amount needs to be > 0");
        require(frequency > 0, "frequency needs to be > 0");
        plans[nextPlanId] = Plan(
            _planName,
            msg.sender,
            // token,
            amount,
            frequency /* 1 year = 31,536,000; 2 months =  5,356,800 */
        );
        nextPlanId++;
    }

    function subscribe(uint256 planId) external payable {
        Plan storage plan = plans[planId]; // accesing plan details
        require(plan.merchant != address(0), "this plan does not exist");
        // transfer subscription funds
        uint256 amountToBuy = plan.amount * 1e18; // 1 * 10 ^ 18
        require(
            msg.value.getConversionRate(s_priceFeed) == amountToBuy,
            "Value not equal to subscription amount!"
        );
        // Transfer token to the vendor contract
        // (bool sent) = streamToken.transferFrom(msg.sender, i_vendorAddress, plan.amount);
        // require(sent, "Failed to transfer token to vendor");
        emit PaymentSent(
            msg.sender,
            plan.merchant,
            plan.amount,
            planId,
            block.timestamp
        );

        subscriptions[msg.sender][planId] = Subscription(
            msg.sender,
            block.timestamp,
            block.timestamp + plan.frequency
        );
        emit SubscriptionCreated(msg.sender, planId, block.timestamp);
    }

    function cancel(uint256 planId) external {
        Subscription storage subscription = subscriptions[msg.sender][planId];
        require(
            subscription.subscriber != address(0),
            "this subscription does not exist"
        );
        delete subscriptions[msg.sender][planId];
        emit SubscriptionCancelled(msg.sender, planId, block.timestamp);
    }

    // pay function for an expired plan
    function pay(address subscriber, uint256 planId) external {
        Subscription storage subscription = subscriptions[subscriber][planId];
        Plan storage plan = plans[planId];
        // IERC20 token = IERC20(plan.token);
        require(
            subscription.subscriber != address(0),
            "this subscription does not exist"
        );
        require(
            block.timestamp > subscription.nextPayment,
            "subscription not due yet"
        );

        streamToken.transferFrom(subscriber, plan.merchant, plan.amount);
        emit PaymentSent(
            subscriber,
            plan.merchant,
            plan.amount,
            planId,
            block.timestamp
        );
        subscription.nextPayment = subscription.nextPayment + plan.frequency;
    }

    function getSubscriptionStatus(
        address subscriber,
        uint256 planId
    ) external view returns (bool) {
        Subscription storage subscription = subscriptions[subscriber][planId];
        if (block.timestamp > subscription.nextPayment) {
            return false;
        } else {
            return true;
        }
    }
}
