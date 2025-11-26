let mongoose = require('mongoose');
let UploadSchema = mongoose.Schema({
    imgUrl: {
        type: String,
        required: true
    }
    ,
    likeCount: {
        type: Number,
        default: 0
    }
    ,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }]
})

module.exports = mongoose.model('Upload', UploadSchema)