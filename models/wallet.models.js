const mongoose = require("mongoose");
const {Schema, model} = mongoose
const walletSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    balance : {
        type: Number,
        required: true,
        default:0
    }
});

const Wallet = new model("Wallet", walletSchema);

module.exports = Wallet;