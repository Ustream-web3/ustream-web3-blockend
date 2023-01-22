const { network } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let streamTokenAddress, vendorAddress, maticUsdPriceFeedAddress

    const streamToken = await deployments.get("StreamToken")
    streamTokenAddress = streamToken.address
    if (developmentChains.includes(network.name)) {
        const maticUsdAggregator = await deployments.get("MockV3Aggregator")
        maticUsdPriceFeedAddress = maticUsdAggregator.address
    } else {
        maticUsdPriceFeedAddress = networkConfig[chainId]["maticUsdPriceFeed"]
    }
    const vendor = await deployments.get("Vendor")
    vendorAddress = vendor.address

    const args = [streamTokenAddress, vendorAddress, maticUsdPriceFeedAddress]
    const payment = await deploy("Payment", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.POLYGONSCAN_API_KEY
    ) {
        log("Verifying...")
        await verify(payment.address, args)
    }

    log("-------------------------------")
}

module.exports.tags = ["all", "payment"]
