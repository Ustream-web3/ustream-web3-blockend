const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const TOKEN_CAP = ethers.utils.parseEther("100000")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer, user } = await getNamedAccounts()

    let streamTokenAddress, maticUsdPriceFeedAddress, streamToken, vendor

    streamToken = await ethers.getContract("StreamToken")
    streamTokenAddress = streamToken.address
    if (developmentChains.includes(network.name)) {
        const maticUsdAggregator = await deployments.get("MockV3Aggregator")
        maticUsdPriceFeedAddress = maticUsdAggregator.address
    } else {
        maticUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [streamTokenAddress, maticUsdPriceFeedAddress]
    // Deploying vendor contract
    vendor = await deploy("Vendor", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    console.log("Vendor contract deployed!")
    console.log("Transferring tokens to vendor contract...")

    // streamToken = await streamToken.connect(deployer).deploy()
    // vendor = vendor.connect(user)
    const vendorAddress = vendor.address
    await streamToken.approve(vendorAddress, TOKEN_CAP)
    console.log("Approved ")
    await streamToken.transfer(vendorAddress, TOKEN_CAP)
    console.log("Tokens tranferred to vendor!")

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying...")
        await verify(vendor.address, args)
    }

    log("-------------------------------")
}

module.exports.tags = ["all", "vendor"]
