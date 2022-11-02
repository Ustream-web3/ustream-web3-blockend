const { assert, expect } = require("chai")
const { network, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("UserRegistry Unit Tests", function () {
          let userRegistry, deployer, user

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              user = accounts[1]
              userRegistry = await ethers.getContractFactory("UserRegistry")
              userRegistry = await userRegistry.connect(deployer).deploy()
              userRegistry = userRegistry.connect(user)
          })

          describe("User Account Handling", function () {
              describe("CreateUserProfile", function () {
                  it("Creates a user profile successfully and emits an event", async function () {
                      expect(
                          await userRegistry.createProfile(
                              "John Doe",
                              "JohnDoeUri"
                          )
                      ).to.emit("ProfileCreated")

                      const profile = await userRegistry.getUserProfile(
                          user.address
                      )
                      assert(profile.username.toString() == "John Doe")
                      assert(profile.profileImgUri.toString() == "JohnDoeUri")
                  })
                  it("Reverts if user account already exists", async function () {
                      await userRegistry.createProfile("John Doe", "JohnDoeUri")
                      await expect(
                          userRegistry.createProfile("John Doe", "JohnDoeUri")
                      ).to.be.revertedWith("UserRegistry__AccountExists")
                  })
                  it("returns the user profile", async function () {
                      await userRegistry.createProfile("John Doe", "JohnDoeUri")
                      const profile = await userRegistry.getUserProfile(
                          user.address
                      )
                      assert(profile.username.toString() == "John Doe")
                      assert(profile.profileImgUri.toString() == "JohnDoeUri")
                  })
              })

              describe("UpdateUserProfile", function () {
                  it("Reverts when an inexisting user updates profile", async function () {
                      await expect(
                          userRegistry.updateProfile("John Doe", "JohnDoeUri")
                      ).to.be.revertedWith("UserRegistry__AccountInexisting")
                  })

                  it("Updates a user profile successfully and emits an event", async function () {
                      await userRegistry.createProfile("John Doe", "JohnDoeUri")
                      expect(
                          await userRegistry.updateProfile(
                              "Jane Doe",
                              "JaneDoeUri"
                          )
                      ).to.emit("ProfileUpdated")

                      const profile = await userRegistry.getUserProfile(
                          user.address
                      )
                      assert(profile.username.toString() == "Jane Doe")
                      assert(profile.profileImgUri.toString() == "JaneDoeUri")
                  })
              })
          })
      })
