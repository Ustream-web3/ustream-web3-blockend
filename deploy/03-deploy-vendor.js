const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    let streamTokenAddress, maticUsdPriceFeedAddress

    const streamToken = await deployments.get("StreamToken")
    streamTokenAddress = streamToken.address
    if (developmentChains.includes(network.name)) {
        const maticUsdAggregator = await deployments.get("MockV3Aggregator")
        maticUsdPriceFeedAddress = maticUsdAggregator.address
    } else {
        maticUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [streamTokenAddress, maticUsdPriceFeedAddress]
    const vendor = await deploy("Vendor", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

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
