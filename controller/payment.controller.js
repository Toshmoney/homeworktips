const withdrawal = require("../models/withdrawal.model")

const withdrawalRequest = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;

    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be greater than zero" });
    }

    const userWallet = await Wallet.findOne({ user: userId });

    if (!userWallet) {
      return res.status(404).json({ error: "User wallet not found" });
    }

    if (userWallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const withdrawalRequest = await withdrawal.create({
      user: userId,
      amount: amount
    });

    return res.status(201).json({ message: "Withdrawal request submitted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};


module.exports = {
  withdrawalRequest
}