const mongoose = require("mongoose");
const {Schema, model} = mongoose;

const postSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    summary:{
        type:String,
        required:true
    },

    status: {
        type:String,
        required:true,
        enum:["pending", "approved", "rejected"],
        default: "pending"
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    image :{
        type:String,
    },
    comments:{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    },
    slug:{
        type:String
    },
    content:{
        type:String,
        required:true
    },
    category:{
        type: String,
    },
    views:{
        type:Number,
        default:0
    },
    reward:{
        type:Number,
        default:0
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
},
{
    timestamps:true
}

);

const postModel = new model("Post", postSchema);

module.exports = postModel