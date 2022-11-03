// const { expectRevert, constants, time } = require("@openzeppelin/test-helpers")
// const { developmentChains } = require("../../helper-hardhat-config")
// const { assert } = require("chai")

// const THIRTY_DAYS = "30"
// const SIXTY_DAYS = "60"

// !developmentChains.includes(network.name)
//     ? describe.skip
//     : describe("Payment Unit Test", function () {
//           let payment,
//               token,
//               vendorContract,
//               PaymentFactory,
//               StreamTokenFactory,
//               admin,
//               merchant,
//               subscriber,
//               _

//           beforeEach(async () => {
//               ;[admin, merchant, subscriber, _] = await ethers.getSigners()

//               StreamTokenFactory = await ethers.getContractFactory(
//                   "StreamToken"
//               )
//               token = await StreamTokenFactory.deploy()

//               // Deploy Staker Contract
//               const VendorContract = await ethers.getContractFactory("Vendor")
//               vendorContract = await VendorContract.deploy(
//                   token.address,
//                   token.address
//               )

//               await token.approve(
//                   vendorContract.address,
//                   ethers.utils.parseEther("1000")
//               )

//               await token.transfer(
//                   vendorContract.address,
//                   ethers.utils.parseEther("1000")
//               )

//               PaymentFactory = await ethers.getContractFactory("Payment")
//               payment = await PaymentFactory.deploy(
//                   token.address,
//                   vendorContract.address
//               )

//               //   await token.transfer(subscriber, 1000)
//               //   await token.approve(payment.address, 1000, { from: subscriber })
//           })

//           it("should create a plan", async () => {
//               await payment
//                   .connect(admin)
//                   .createPlan("plan 1", 100, THIRTY_DAYS)
//               const plan1 = await payment.plans(0)
//               assert(plan1.planName === "plan 1")
//               assert(plan1.amount.toString() === "100")
//               assert(plan1.frequency() === THIRTY_DAYS)

//               await payment.createPlan("plan 2", 200, SIXTY_DAYS, {
//                   from: merchant,
//               })
//               const plan2 = await payment.plans(1)
//               assert(plan2.planName === "plan 2")
//               assert(plan2.amount.toString() === "200")
//               assert(plan2.frequency() === SIXTY_DAYS)
//           })

//           it("should not create a plan", async () => {
//               await expectRevert(
//                   payment.createPlan(token.address, 0, THIRTY_DAYS, {
//                       from: merchant,
//                   }),
//                   "amount needs to be > 0"
//               )
//               await expectRevert(
//                   payment.createPlan(token.address, 100, 0, { from: merchant }),
//                   "frequency needs to be > 0"
//               )
//           })

//           it("should create a subscription", async () => {
//               await payment.createPlan(token.address, 100, THIRTY_DAYS, {
//                   from: merchant,
//               })
//               await payment.subscribe(0, { from: subscriber })
//               const block = await web3.eth.getBlock("latest")
//               const subscription = await payment.subscriptions(subscriber, 0)
//               assert(subscription.subscriber === subscriber)
//               assert(
//                   subscription.start.toString() === block.timestamp.toString()
//               )
//               assert(
//                   subscription.nextPayment.toString() ===
//                       (block.timestamp + 86400 * 30).toString()
//               )
//           })

//           it("should NOT create a subscription", async () => {
//               await expectRevert(
//                   payment.subscribe(0, { from: subscriber }),
//                   "this plan does not exist"
//               )
//           })

//           it("should subscribe and pay", async () => {
//               let balanceMerchant, balanceSubscriber
//               await payment.createPlan(token.address, 100, THIRTY_DAYS, {
//                   from: merchant,
//               })

//               await payment.subscribe(0, { from: subscriber })
//               balanceMerchant = await token.balanceOf(merchant)
//               balanceSubscriber = await token.balanceOf(subscriber)
//               assert(balanceMerchant.toString() === "100")
//               assert(balanceSubscriber.toString() === "900")

//               await time.increase(THIRTY_DAYS + 1)
//               await payment.pay(subscriber, 0)
//               balanceMerchant = await token.balanceOf(merchant)
//               balanceSubscriber = await token.balanceOf(subscriber)
//               assert(balanceMerchant.toString() === "200")
//               assert(balanceSubscriber.toString() === "800")

//               await time.increase(THIRTY_DAYS + 1)
//               await payment.pay(subscriber, 0)
//               balanceMerchant = await token.balanceOf(merchant)
//               balanceSubscriber = await token.balanceOf(subscriber)
//               assert(balanceMerchant.toString() === "300")
//               assert(balanceSubscriber.toString() === "700")
//           })

//           it("should subscribe and NOT pay", async () => {
//               let balanceMerchant, balanceSubscriber
//               await payment.createPlan(token.address, 100, THIRTY_DAYS, {
//                   from: merchant,
//               })

//               await payment.subscribe(0, { from: subscriber })
//               await time.increase(THIRTY_DAYS - 1)
//               await expectRevert(payment.pay(subscriber, 0), "not due yet")
//           })

//           it("should cancel subscription", async () => {
//               await payment.createPlan(token.address, 100, THIRTY_DAYS, {
//                   from: merchant,
//               })
//               await payment.subscribe(0, { from: subscriber })
//               await payment.cancel(0, { from: subscriber })
//               const subscription = await payment.subscriptions(subscriber, 0)
//               assert(subscription.subscriber === constants.ZERO_ADDRESS)
//           })

//           it("should NOT cancel subscription", async () => {
//               await expectRevert(
//                   payment.cancel(0, { from: subscriber }),
//                   "this subscription does not exist"
//               )
//           })
//       })
