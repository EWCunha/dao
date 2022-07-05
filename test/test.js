const DAO = artifacts.require("DAO")
const { expectRevert, time } = require("@openzeppelin/test-helpers")
const { web3 } = require("@openzeppelin/test-helpers/src/setup")

contract("DAO", (accounts) => {
    let dao
    beforeEach(async () => {
        dao = await DAO.new(20, 10, 67, { from: accounts[0] })
    })

    it("Should NOT deploy if quorum not between 0 and 100", async () => {
        await expectRevert(DAO.new(20, 10, 0, { from: accounts[0] }), "quorum must be between 0 and 100")
        await expectRevert(DAO.new(20, 10, 101, { from: accounts[0] }), "quorum must be between 0 and 100")
    })

    it("Should add investor contribution", async () => {
        const investedBefore = await Promise.all(
            [
                dao.investors(accounts[1]),
                dao.investors(accounts[2]),
                dao.investors(accounts[3]),
                dao.investors(accounts[4])
            ]
        )
        const sharesBefore = await Promise.all(
            [
                dao.shares(accounts[1]),
                dao.shares(accounts[2]),
                dao.shares(accounts[3]),
                dao.shares(accounts[4])
            ]
        )
        const [totalSharesBefore, availableFundsBefore] = await Promise.all(
            [
                dao.totalShares(),
                dao.availableFunds()
            ]
        )

        await Promise.all(
            [
                dao.contribute({ from: accounts[1], value: 100 }),
                dao.contribute({ from: accounts[2], value: 200 }),
                dao.contribute({ from: accounts[3], value: 100 })
            ]
        )

        const investedAfter = await Promise.all(
            [
                dao.investors(accounts[1]),
                dao.investors(accounts[2]),
                dao.investors(accounts[3]),
                dao.investors(accounts[4])
            ]
        )
        const sharesAfter = await Promise.all(
            [
                dao.shares(accounts[1]),
                dao.shares(accounts[2]),
                dao.shares(accounts[3]),
                dao.shares(accounts[4])
            ]
        )
        const [totalSharesAfter, availableFundsAfter] = await Promise.all(
            [
                dao.totalShares(),
                dao.availableFunds()
            ]
        )

        investedBefore.map(invested => assert(invested === false))
        sharesBefore.map(share => assert(parseInt(share) === 0))
        assert(investedAfter[0] === true)
        assert(investedAfter[1] === true)
        assert(investedAfter[2] === true)
        assert(investedAfter[3] === false)
        assert(parseInt(sharesAfter[0]) === 100)
        assert(parseInt(sharesAfter[1]) === 200)
        assert(parseInt(sharesAfter[2]) === 100)
        assert(parseInt(sharesAfter[3]) === 0)
        assert(parseInt(totalSharesAfter - totalSharesBefore) === 400)
        assert(parseInt(availableFundsAfter - availableFundsBefore) === 400)
    })

    it("Should NOT add investor contribution after contribution end", async () => {
        await time.increase(20001)
        await expectRevert(dao.contribute({ from: accounts[1], value: 100 }), "cannot contribute after contribution end")
    })

    it("Should redeem share from investor", async () => {
        await Promise.all(
            [
                dao.contribute({ from: accounts[1], value: 100 }),
                dao.contribute({ from: accounts[2], value: 100 })
            ]
        )
        const sharesBefore = await Promise.all([dao.shares(accounts[1]), dao.shares(accounts[2])])
        const investedBefore = await Promise.all([dao.investors(accounts[1]), dao.investors(accounts[2])])
        const [totalSharesBefore, availableFundsBefore] = await Promise.all(
            [
                dao.totalShares(),
                dao.availableFunds()
            ]
        )

        await Promise.all(
            [
                dao.redeemShare(50, { from: accounts[1] }),
                dao.redeemShare(100, { from: accounts[2] })
            ]
        )

        const sharesAfter = await Promise.all([dao.shares(accounts[1]), dao.shares(accounts[2])])
        const investedAfter = await Promise.all([dao.investors(accounts[1]), dao.investors(accounts[2])])
        const [totalSharesAfter, availableFundsAfter] = await Promise.all(
            [
                dao.totalShares(),
                dao.availableFunds()
            ]
        )

        sharesBefore.map(share => assert(parseInt(share) === 100))
        investedBefore.map(invested => assert(invested === true))
        assert(parseInt(sharesAfter[0]) === 50)
        assert(parseInt(sharesAfter[1]) === 0)
        assert(investedAfter[0] === true)
        assert(investedAfter[1] === false)
        assert(parseInt(availableFundsAfter - availableFundsBefore) === -150)
        assert(parseInt(totalSharesAfter - totalSharesBefore) === -150)
    })

    it("Should NOT redeem share from investor if investor does not have enough shares", async () => {
        await dao.contribute({ from: accounts[1], value: 100 })
        await expectRevert(dao.redeemShare(150, { from: accounts[1] }), "not enough shares")
    })

    it("Should NOT redeem share from investor if smart contract does not have enough funds", async () => {
        await dao.contribute({ from: accounts[1], value: 100 })
        await dao.withdrawEther(100, accounts[0], { from: accounts[0] })
        await expectRevert(dao.redeemShare(100, { from: accounts[1] }), "not enough available funds")
    })

    it("Should transfer shares between investors", async () => {
        await Promise.all(
            [
                dao.contribute({ from: accounts[1], value: 100 }),
                dao.contribute({ from: accounts[2], value: 100 })
            ]
        )

        const sharesBefore = await Promise.all(
            [
                dao.shares(accounts[1]),
                dao.shares(accounts[2]),
                dao.shares(accounts[3])
            ]
        )
        const investedBefore = await Promise.all(
            [
                dao.investors(accounts[1]),
                dao.investors(accounts[2]),
                dao.investors(accounts[3])
            ]
        )

        await Promise.all(
            [
                dao.transferShare(50, accounts[3], { from: accounts[1] }),
                dao.transferShare(100, accounts[3], { from: accounts[2] })
            ]
        )

        const sharesAfter = await Promise.all(
            [
                dao.shares(accounts[1]),
                dao.shares(accounts[2]),
                dao.shares(accounts[3])
            ]
        )
        const investedAfter = await Promise.all(
            [
                dao.investors(accounts[1]),
                dao.investors(accounts[2]),
                dao.investors(accounts[3])
            ]
        )

        assert(parseInt(sharesBefore[0]) === 100)
        assert(parseInt(sharesBefore[1]) === 100)
        assert(parseInt(sharesBefore[2]) === 0)
        assert(investedBefore[0] === true)
        assert(investedBefore[1] === true)
        assert(investedBefore[2] === false)
        assert(parseInt(sharesAfter[0]) === 50)
        assert(parseInt(sharesAfter[1]) === 0)
        assert(parseInt(sharesAfter[2]) === 150)
        assert(investedAfter[0] === true)
        assert(investedAfter[1] === false)
        assert(investedAfter[2] === true)
    })

    it("Should NOT transfer shares between investors if investor does not have enough shares", async () => {
        await dao.contribute({ from: accounts[1], value: 100 })
        await expectRevert(dao.transferShare(150, accounts[3], { from: accounts[1] }), "not enough shares")
    })

    it("Should create new proposal", async () => {
        await dao.contribute({ from: accounts[1], value: 100 })
        const proposalIdBefore = await dao.nextProposalId()
        const availableFundsBefore = await dao.availableFunds()
        const voteTime = parseInt(await dao.voteTime())

        const tx = await dao.createProposal("DAI", 50, accounts[5], { from: accounts[1] })
        const block = await web3.eth.getBlock(tx.receipt.blockNumber)

        const proposalIdAfter = await dao.nextProposalId()
        const availableFundsAfter = await dao.availableFunds()
        const proposals = await dao.proposals(parseInt(proposalIdBefore))

        assert(parseInt(proposalIdBefore) === 0)
        assert(parseInt(availableFundsAfter - availableFundsBefore) === -50)
        assert(parseInt(proposalIdAfter) === 1)
        assert(proposals.id.toNumber() === 0)
        assert(proposals.name === "DAI")
        assert(proposals.amount.toNumber() === 50)
        assert(proposals.recipient === accounts[5])
        assert(proposals.votes.toNumber() === 0)
        assert(proposals.end.toNumber() === block.timestamp + voteTime)
        assert(proposals.executed === false)
    })

    it("Should NOT create new proposal if sender is not investor", async () => {
        await dao.contribute({ from: accounts[1], value: 100 })
        await expectRevert(dao.createProposal("DAI", 50, accounts[5], { from: accounts[2] }), "only investors")
    })

    it("Should NOT create new proposal if amount is greater than funds", async () => {
        await dao.contribute({ from: accounts[1], value: 100 })
        await expectRevert(dao.createProposal("DAI", 150, accounts[5], { from: accounts[1] }), "amount too big")
    })

    it("Should add vote from investor", async () => {
        await dao.contribute({ from: accounts[1], value: 100 })
        await dao.createProposal("DAI", 50, accounts[5], { from: accounts[1] })
        const voteBefore = await dao.votes(accounts[1], 0)
        const proposalVotesBefore = (await dao.proposals(0)).votes
        const shares = parseInt(await dao.shares(accounts[1]))

        await dao.vote(0, { from: accounts[1] })

        const voteAfter = await dao.votes(accounts[1], 0)
        const proposalVotesAfter = (await dao.proposals(0)).votes

        assert(voteBefore === false)
        assert(parseInt(proposalVotesBefore) === 0)
        assert(voteAfter === true)
        assert(parseInt(proposalVotesAfter) === shares)
    })

    it("Should NOT add vote if sender is not investor", async () => {
        await dao.contribute({ from: accounts[1], value: 100 })
        await dao.createProposal("DAI", 50, accounts[5], { from: accounts[1] })
        await expectRevert(dao.vote(0, { from: accounts[4] }), "only investors")
    })

    it("Should NOT add vote if investor has already voted", async () => {
        await dao.contribute({ from: accounts[1], value: 100 })
        await dao.createProposal("DAI", 50, accounts[5], { from: accounts[1] })
        await dao.vote(0, { from: accounts[1] })
        await expectRevert(dao.vote(0, { from: accounts[1] }), "investor can only vote once for a proposal")
    })

    it("Should NOT add vote if vote period has ended", async () => {
        await dao.contribute({ from: accounts[1], value: 100 })
        await dao.createProposal("DAI", 50, accounts[5], { from: accounts[1] })
        const proposalEnd = (await dao.proposals(0)).end.toNumber()
        await time.increase(proposalEnd * 1000)
        await expectRevert(dao.vote(0, { from: accounts[1] }), "can only vote until proposal end")
    })

    it("Should execute proposal", async () => {
        await dao.contribute({ from: accounts[1], value: 100 })
        await dao.createProposal("DAI", 50, accounts[5], { from: accounts[1] })
        await dao.vote(0, { from: accounts[1] })
        const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[5]))
        const proposalExecutedBefore = (await dao.proposals(0)).executed
        const incraseTime = parseInt(await dao.voteTime())
        await time.increase(incraseTime * 1000 + 1)

        await dao.executeProposal(0, { from: accounts[0] })

        const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[5]))
        const proposalExecutedAfter = (await dao.proposals(0)).executed

        assert(balanceAfter.sub(balanceBefore).toNumber() === 50)
        assert(proposalExecutedBefore === false)
        assert(proposalExecutedAfter === true)
    })

    it("Should NOT execute proposal if sender is not admin", async () => {
        await dao.contribute({ from: accounts[1], value: 100 })
        await dao.createProposal("DAI", 50, accounts[5], { from: accounts[1] })
        await dao.vote(0, { from: accounts[1] })
        const incraseTime = parseInt(await dao.voteTime())
        await time.increase(incraseTime * 1000 + 1)

        await expectRevert(dao.executeProposal(0, { from: accounts[5] }), "only admin")
    })

    it("Should NOT execute proposal before proposal end", async () => {
        await dao.contribute({ from: accounts[1], value: 100 })
        await dao.createProposal("DAI", 50, accounts[5], { from: accounts[1] })
        await dao.vote(0, { from: accounts[1] })

        await expectRevert(dao.executeProposal(0, { from: accounts[0] }), "cannot execute a proposal before end date")
    })

    it("Should NOT execute proposal if already executed", async () => {
        await dao.contribute({ from: accounts[1], value: 100 })
        await dao.createProposal("DAI", 50, accounts[5], { from: accounts[1] })
        await dao.vote(0, { from: accounts[1] })
        const incraseTime = parseInt(await dao.voteTime())
        await time.increase(incraseTime * 1000 + 1)
        await dao.executeProposal(0, { from: accounts[0] })
        const proposalExecuted = (await dao.proposals(0)).executed

        await expectRevert(dao.executeProposal(0, { from: accounts[0] }), "cannot execute a proposal already executed")
    })

    it("Should NOT execute proposal if votes below quorum", async () => {
        await dao.contribute({ from: accounts[1], value: 100 })
        await dao.contribute({ from: accounts[2], value: 1000 })
        await dao.createProposal("DAI", 50, accounts[5], { from: accounts[1] })
        await dao.vote(0, { from: accounts[1] })
        const incraseTime = parseInt(await dao.voteTime())
        await time.increase(incraseTime * 1000 + 1)

        await expectRevert(dao.executeProposal(0, { from: accounts[0] }), "cannot execute a proposal with votes below quorum")
    })

    it("Should withdraw ether", async () => {
        await dao.contribute({ from: accounts[1], value: 100 })
        const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[5]))
        const availableFundsBefore = await dao.availableFunds()

        await dao.withdrawEther(50, accounts[5], { from: accounts[0] })

        const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[5]))
        const availableFundsAfter = await dao.availableFunds()

        assert(balanceAfter.sub(balanceBefore).toNumber() === 50)
        assert(availableFundsAfter.sub(availableFundsBefore).toNumber() === -50)
    })

    it("Should NOT withdraw ether if sender not admin", async () => {
        await dao.contribute({ from: accounts[1], value: 100 })
        await expectRevert(dao.withdrawEther(50, accounts[5], { from: accounts[1] }), "only admin")
    })

    it("Should NOT withdraw ether if not enough available funds", async () => {
        await dao.contribute({ from: accounts[1], value: 100 })
        await expectRevert(dao.withdrawEther(150, accounts[5], { from: accounts[0] }), "not enough availableFunds")
    })
})