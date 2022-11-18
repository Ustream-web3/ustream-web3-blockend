const networkConfig = {
    31337: {
        name: "localhost",
        entryFee: "10000000000000000",
        votingStartTime: "1668636000",
        thursdayVotingEndTime: "1668650400",
    },
    80001: {
        name: "matic",
        maticUsdPriceFeed: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada", // mumbai matic/usd
        entryFee: "10000000000000000",
        votingStartTime: "1668636000",
        thursdayVotingEndTime: "1668650400",
    },
    137: {
        name: "polygon",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}
