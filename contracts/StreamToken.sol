// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StreamToken is ERC20 {
    // initial supply is 50 -- 50WEI
    constructor() ERC20("$Stream", "STRM") {
        _mint(msg.sender, 100000000 * 10 ** 18);
    }
}
