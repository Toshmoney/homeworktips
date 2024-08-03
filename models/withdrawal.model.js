const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const withdrawalRequestSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
}, { timestamps: true });

const WithdrawalRequest = model("Withdrawal", withdrawalRequestSchema);

module.exports = WithdrawalRequest;
