const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const transactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ["withdrawal", "deposit"],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    required: true
  }
}, { timestamps: true });

const Transaction = model("Transaction", transactionSchema);

module.exports = Transaction;
