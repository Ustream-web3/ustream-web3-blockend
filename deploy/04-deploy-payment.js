const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    let streamTokenAddress, vendorAddress

    const streamToken = await deployments.get("StreamToken")
    streamTokenAddress = streamToken.address
    const vendor = await deployments.get("Vendor")
    vendorAddress = vendor.address

    const args = [streamTokenAddress, vendorAddress]
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
