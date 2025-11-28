let mongoose = require('mongoose');
let CommentSchema = mongoose.Schema({
    text: {
        type: String,
        required:true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    postId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    }
})
module.exports = mongoose.model('comment',CommentSchema);