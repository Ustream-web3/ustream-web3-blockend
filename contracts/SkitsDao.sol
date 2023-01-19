//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./StreamToken.sol";

error SkitsDao__EntryFeeNotEnough();
error SkitsDao__UserAlreadyVoted();
error SkitsDao__NotAdmin();
error SkitsDao__NotChairperson();

contract SkitsDao {
    // Our Token Contract
    StreamToken streamToken;

    struct Voter {
        uint256 vote; // proposal index
        uint256 weight; // delegation
        bool voted; // isVoted?
    }

    struct Proposal {
        uint256 proposalId;
        bytes32 title; // skit title
        uint256 skitVoteCount;
        uint256 skitVoteAllowance;
    }

    /* State variables */
    uint256 public s_entryFee;
    uint256 public s_votingStartTime;
    uint256 public s_thursdayVotingEndTime;
    uint256 private s_proposalsCount = 0;

    /* Events */
    event SkitVote(address indexed user);
    event ProposalCreated(
        uint256 proposalId,
        bytes32 title,
        uint256 skitVoteCount,
        uint256 skitVoteAllowance
    );

    mapping(address => Voter) public voters;
    mapping(address => bool) public isAdmin;
    mapping(address => bool) public isChairperson;

    modifier votingLinesAreOpen(uint256 currentTime) {
        require(currentTime >= s_votingStartTime);
        require(currentTime <= s_thursdayVotingEndTime);
        _;
    }

    modifier onlyAdmin() {
        if (!isAdmin[msg.sender]) {
            revert SkitsDao__NotAdmin();
        }
        _;
    }

    modifier onlyChairperson() {
        if (!isChairperson[msg.sender]) {
            revert SkitsDao__NotChairperson();
        }
        _;
    }

    Proposal[] public proposals;

    /**
     * @param entryFee for the token
     */

    /* Functions */

    constructor(uint256 entryFee, address tokenAddress) {
        s_entryFee = entryFee;
        isAdmin[msg.sender] = true;
        isChairperson[msg.sender] = true;
        streamToken = StreamToken(tokenAddress);
    }

    function setAdmin(address userAddress) external onlyChairperson {
        isAdmin[userAddress] = true;
    }

    function createProposals(
        bytes32[] memory _proposalTitles,
        uint256 skitVoteAllowance
    ) external onlyAdmin {
        for (uint256 i = 0; i < _proposalTitles.length; i++) {
            s_proposalsCount += 1;
            proposals.push(
                Proposal({
                    proposalId: s_proposalsCount,
                    title: _proposalTitles[i],
                    skitVoteCount: 0,
                    skitVoteAllowance: skitVoteAllowance
                })
            );
            emit ProposalCreated(
                s_proposalsCount,
                _proposalTitles[i],
                0,
                skitVoteAllowance
            );
        }
    }

    function setEntryFee(uint256 amount) external onlyAdmin {
        s_entryFee = amount;
    }

    function voteSkits(
        uint256 proposal,
        uint256 currentTime
    ) public votingLinesAreOpen(currentTime) {
        Voter storage sender = voters[msg.sender];
        if (sender.vote == proposals[proposal].proposalId) {
            revert SkitsDao__UserAlreadyVoted();
        }

        // // Check that the user's token balance is enough to do the swap
        uint256 userBalance = streamToken.balanceOf(msg.sender);
        if (userBalance < s_entryFee) {
            revert SkitsDao__EntryFeeNotEnough();
        }

        // Transfer tokens to this contract

        bool sent = streamToken.transferFrom(
            msg.sender,
            address(this),
            s_entryFee
        );
        require(sent, "Failed to transfer tokens from user to vote skits");

        sender.weight = 1;
        sender.voted = true;
        sender.vote = proposals[proposal].proposalId;
        proposals[proposal].skitVoteCount += 1;
        //Emit an event when we update a dynamic array or mapping
        emit SkitVote(msg.sender);
    }

    /**
     * @dev used to update the voting start & end times
     * @param votingStartTime Current time that needs to be updated
     * @param votingEndTime Current time that needs to be updated
     */
    function updateVotingTime(
        uint256 votingStartTime,
        uint256 votingEndTime
    ) external onlyAdmin {
        s_votingStartTime = votingStartTime;
        s_thursdayVotingEndTime = votingEndTime;
    }

    /**
     * Here the winning vote count is initially assigned to 0
     * So we iterate and get through the skit votes to get the winner
     */
    function winningProposal() public view returns (uint256 winningProposal_) {
        uint256 winningVoteCount = 0;
        for (uint256 p = 0; p < proposals.length; p++) {
            if (proposals[p].skitVoteCount > winningVoteCount) {
                winningVoteCount = proposals[p].skitVoteCount;
                winningProposal_ = p;
            }
        }
    }

    /**
     * Here, the skit that won is returned with its title
     */
    function skitWinnerTitle() external view returns (bytes32 winnerTitle_) {
        winnerTitle_ = proposals[winningProposal()].title;
    }

    /** Getter Functions */
    function getEntryFee() public view returns (uint256) {
        return s_entryFee;
    }

    /**
     * @dev Gives ending epoch time of voting
     * @return endTime When the voting ends
     */
    function getVotingEndTime() public view returns (uint256 endTime) {
        endTime = s_thursdayVotingEndTime;
    }

    function getIsAdmin(address userAddress) public view returns (bool) {
        return isAdmin[userAddress];
    }
}
