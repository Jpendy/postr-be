
const calculateVote = (voteHistory, vote) => {
    let voteValue;
    let newVoteHistoryValue;

    voteHistory = Number(voteHistory)
    vote = Number(vote)

    if (voteHistory === 1 && vote === 1) {
        newVoteHistoryValue = 0;
        voteValue = -1;
    }
    else if (voteHistory === 1 && vote === -1) {
        newVoteHistoryValue = -1;
        voteValue = -2;
    }
    else if (voteHistory === 0 && vote === 1) {
        newVoteHistoryValue = 1;
        voteValue = 1;
    }
    else if (voteHistory === 0 && vote === -1) {
        newVoteHistoryValue = -1;
        voteValue = -1;
    }
    else if (voteHistory === -1 && vote === 1) {
        newVoteHistoryValue = 1;
        voteValue = 2;
    }
    else if (voteHistory === -1 && vote === -1) {
        newVoteHistoryValue = 0;
        voteValue = 1;
    }
    return {
        voteValue,
        newVoteHistoryValue
    };
}

module.exports = {
    calculateVote
}