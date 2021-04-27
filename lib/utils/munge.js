const Comment = require("../models/Comment")

const commentsMunge = (comment) => {
    if (!comment.replies) return new Comment(comment)

    return {
        ...new Comment(comment),
        replies: comment.replies.map(comment => commentsMunge(comment))
    }
}

module.exports = {
    commentsMunge
}