const { network, ethers } = require("hardhat")
const { use, expect, assert } = require("chai")
// const { solidity } = require("ethereum-waffle")
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config")

const chainId = network.config.chainId
const entryFee = networkConfig[chainId].entryFee
const votingStartTime = networkConfig[chainId].votingStartTime
const thursdayVotingEndTime = networkConfig[chainId].thursdayVotingEndTime
const blackPanther = ethers.utils.formatBytes32String("Black Panther")
const justiceLeague = ethers.utils.formatBytes32String("Justice League")
const _proposalTitles = [blackPanther, justiceLeague]
const movieVoteAllowance = 1

// use(solidity)
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("SkitsDao Unit Test", () => {
          let owner
          let addr1
          let addr2
          let addrs

          let skitsDaoContract
          let tokenContract
          let StreamTokenFactory

          beforeEach(async () => {
              ;[owner, addr1, addr2, ...addrs] = await ethers.getSigners()

              // Deploy ExampleExternalContract contract
              StreamTokenFactory = await ethers.getContractFactory(
                  "StreamToken"
              )
              tokenContract = await StreamTokenFactory.deploy()

              // Deploy Staker Contract
              const SkitsDaoContract = await ethers.getContractFactory(
                  "SkitsDao"
              )
              skitsDaoContract = await SkitsDaoContract.deploy(
                  entryFee,
                  votingStartTime,
                  thursdayVotingEndTime,
                  tokenContract.address
              )

              await tokenContract.approve(
                  skitsDaoContract.address,
                  ethers.utils.parseEther("1000")
              )

              await tokenContract.increaseAllowance(
                  skitsDaoContract.address,
                  ethers.utils.parseEther("1000")
              )
          })

          describe("Admin Methods", () => {
              it("should allow only chairperson set admin", async () => {
                  await expect(
                      skitsDaoContract.connect(addr1).setAdmin(addr2.address)
                  ).to.be.revertedWith("SkitsDao__NotChairperson()")
              })
              it("should sets an account to admin", async () => {
                  await skitsDaoContract.setAdmin(addr1.address)
                  const isAdmin = await skitsDaoContract.getIsAdmin(
                      addr1.address
                  )
                  assert(isAdmin)
              })
              it("should accept proposals from only admin", async () => {
                  await expect(
                      skitsDaoContract
                          .connect(addr1)
                          .createProposals(_proposalTitles, movieVoteAllowance)
                  ).to.be.revertedWith("SkitsDao__NotAdmin()")
              })
              it("should allow only admins update entry fee", async () => {
                  await expect(
                      skitsDaoContract.connect(addr1).setEntryFee(1000)
                  ).to.be.revertedWith("SkitsDao__NotAdmin()")
              })
              it("should allow only admins update voting time", async () => {
                  await expect(
                      skitsDaoContract
                          .connect(addr1)
                          .updateVotingTime(1000, 2000)
                  ).to.be.revertedWith("SkitsDao__NotAdmin()")
              })
          })

          describe("Vote skits method", () => {
              it("should update voting time", async () => {
                  await skitsDaoContract.updateVotingTime(10, 20)
                  const startTime = await skitsDaoContract.s_votingStartTime()
                  const votingEndTime =
                      await skitsDaoContract.s_thursdayVotingEndTime()
                  assert(startTime.toString() == "10")
                  assert(votingEndTime.toString() == "20")
              })
          })
          it("should update entry fee", async () => {
              await skitsDaoContract.setEntryFee(10)
              const entryFee = await skitsDaoContract.getEntryFee()
              assert(entryFee.toString() == "10")
          })
      })
