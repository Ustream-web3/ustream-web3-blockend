const { ethers, network } = require("hardhat")
const fs = require("fs")

const frontEndContractsFile =
    "../ustream-web3-frontend/ustream/constants/networkMapping.json"
frontEndAbiLocation = "../ustream-web3-frontend/ustream/constants/"

require("dotenv").config()

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const moviesDao = await ethers.getContract("MoviesDao")
    fs.writeFileSync(
        `${frontEndAbiLocation}MoviesDao.json`,

        moviesDao.interface.format(ethers.utils.FormatTypes.json)
    )

    const payment = await ethers.getContract("Payment")
    fs.writeFileSync(
        `${frontEndAbiLocation}Payment.json`,

        payment.interface.format(ethers.utils.FormatTypes.json)
    )

    const skitsDao = await ethers.getContract("SkitsDao")
    fs.writeFileSync(
        `${frontEndAbiLocation}SkitsDao.json`,

        skitsDao.interface.format(ethers.utils.FormatTypes.json)
    )

    const streamToken = await ethers.getContract("StreamToken")
    fs.writeFileSync(
        `${frontEndAbiLocation}StreamToken.json`,

        streamToken.interface.format(ethers.utils.FormatTypes.json)
    )

    const userRegistry = await ethers.getContract("UserRegistry")
    fs.writeFileSync(
        `${frontEndAbiLocation}UserRegistry.json`,

        userRegistry.interface.format(ethers.utils.FormatTypes.json)
    )

    const vendor = await ethers.getContract("Vendor")
    fs.writeFileSync(
        `${frontEndAbiLocation}Vendor.json`,

        vendor.interface.format(ethers.utils.FormatTypes.json)
    )
}

async function updateContractAddresses() {
    const chainId = network.config.chainId.toString()
    const moviesDao = await ethers.getContract("MoviesDao")
    const payment = await ethers.getContract("Payment")
    const skitsDao = await ethers.getContract("SkitsDao")
    const streamToken = await ethers.getContract("StreamToken")
    const userRegistry = await ethers.getContract("UserRegistry")
    const vendor = await ethers.getContract("Vendor")

    // let frontendContracts =
    // console.log(frontendContracts)
    const contractAddresses = JSON.parse(
        fs.readFileSync(frontEndContractsFile, "utf8")
    )

    if (chainId in contractAddresses) {
        if (
            !contractAddresses[chainId]["MoviesDao"].includes(moviesDao.address)
        )
            contractAddresses[chainId]["MoviesDao"].push(moviesDao.address)
        if (!contractAddresses[chainId]["Payment"].includes(payment.address))
            contractAddresses[chainId]["Payment"].push(payment.address)
        if (!contractAddresses[chainId]["SkitsDao"].includes(skitsDao.address))
            contractAddresses[chainId]["SkitsDao"].push(skitsDao.address)
        if (
            !contractAddresses[chainId]["StreamToken"].includes(
                streamToken.address
            )
        )
            contractAddresses[chainId]["StreamToken"].push(streamToken.address)
        if (
            !contractAddresses[chainId]["UserRegistry"].includes(
                userRegistry.address
            )
        )
            contractAddresses[chainId]["UserRegistry"].push(
                userRegistry.address
            )
        if (!contractAddresses[chainId]["Vendor"].includes(vendor.address))
            contractAddresses[chainId]["Vendor"].push(vendor.address)
    } else {
        contractAddresses[chainId] = { MoviesDao: [moviesDao.address] }
        contractAddresses[chainId] = { Payment: [payment.address] }
        contractAddresses[chainId] = { SkitsDao: [skitsDao.address] }
        contractAddresses[chainId] = { StreamToken: [streamToken.address] }

        contractAddresses[chainId] = { UserRegistry: [userRegistry.address] }
        contractAddresses[chainId] = { Vendor: [vendor.address] }
    }

    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "frontend"]
