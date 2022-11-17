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
    : describe("MoviesDao Unit Test", () => {
          let owner
          let addr1
          let addr2
          let addrs

          let moviesDaoContract
          let tokenContract
          let StreamTokenFactory

          let vendorTokensSupply
          let tokensPerEth

          beforeEach(async () => {
              ;[owner, addr1, addr2, ...addrs] = await ethers.getSigners()

              // Deploy ExampleExternalContract contract
              StreamTokenFactory = await ethers.getContractFactory(
                  "StreamToken"
              )
              tokenContract = await StreamTokenFactory.deploy()

              // Deploy Staker Contract
              const MoviesDaoContract = await ethers.getContractFactory(
                  "MoviesDao"
              )
              moviesDaoContract = await MoviesDaoContract.deploy(
                  entryFee,
                  votingStartTime,
                  thursdayVotingEndTime,
                  tokenContract.address
              )

              //   await tokenContract.approve(
              //       vendorContract.address,
              //       ethers.utils.parseEther("1000")
              //   )

              await tokenContract.increaseAllowance(
                  moviesDaoContract.address,
                  ethers.utils.parseEther("1000")
              )
          })

          describe("Admin Methods", () => {
              it("should allow only chairperson set admin", async () => {
                  await expect(
                      moviesDaoContract.connect(addr1).setAdmin(addr2.address)
                  ).to.be.revertedWith("MoviesDao__NotChairperson()")
              })
              it("should sets an account to admin", async () => {
                  await moviesDaoContract.setAdmin(addr1.address)
                  const isAdmin = await moviesDaoContract.getIsAdmin(
                      addr1.address
                  )
                  assert(isAdmin)
              })
              it("should accept proposals from only admin", async () => {
                  await expect(
                      moviesDaoContract
                          .connect(addr1)
                          .createProposals(_proposalTitles, movieVoteAllowance)
                  ).to.be.revertedWith("MoviesDao__NotAdmin()")
              })
              it("should allow only admins update entry fee", async () => {
                  await expect(
                      moviesDaoContract.connect(addr1).setEntryFee(1000)
                  ).to.be.revertedWith("MoviesDao__NotAdmin()")
              })
              it("should allow only admins update voting time", async () => {
                  await expect(
                      moviesDaoContract
                          .connect(addr1)
                          .updateVotingTime(1000, 2000)
                  ).to.be.revertedWith("MoviesDao__NotAdmin()")
              })
          })

          //   describe("Create proposal method", () => {
          //       it("should create a proposal and emit an event for each", async () => {
          //           for (i = 0; i <= _proposalTitles.length; i++) {
          //               await expect(
          //                   moviesDaoContract.createProposals(
          //                       [_proposalTitles[i]],
          //                       movieVoteAllowance
          //                   )
          //               )[0]
          //                   .to.emit(moviesDaoContract, "ProposalCreated")
          //                   .withArgs(0, [_proposalTitles[i]], 0, 1)
          //           }
          //       })
          //   })
      })
