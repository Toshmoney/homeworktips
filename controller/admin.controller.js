const User = require("../models/user.model");
const Posts = require("../models/post.model")
const withdrawal = require("../models/withdrawal.model");
const Wallet = require("../models/wallet.models")
const Transaction = require("../models/transaction.model")
const banUser = async(req, res)=>{
    try {
        const {userId} = req.params; 
    
        const user = await User.findById(userId);
    
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
    
        if(user.accountStatus === "banned"){
            return res.json({error:"This user is already banned before"})
        }
    
        user.accountStatus = "banned";
    
        await user.save();
    
        res.status(200).json({ message: "Account banned successfully", user: user });
      } catch (error) {
        console.error("Error toggling availability:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
}

const suspendUser = async(req, res)=>{
  try {
    const {userId} = req.params; 
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      if(user.accountStatus === "suspended"){
          return res.json({error:"This user is already on suspension"})
      }
  
      user.accountStatus = "suspended";
  
      await user.save();
  
      res.status(200).json({ message: "Account suspended successfully", user: user });
    } catch (error) {
      console.error("Error toggling availability:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
}

const removeSuspension = async(req, res)=>{
  try {
    const {userId} = req.params; 

      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      if(user.accountStatus != "suspended" || user.accountStatus != "banned"){
          return res.json({error:"This user is not on suspension therefore the request could not be made!"})
      }
  
      user.accountStatus = "active";
  
      await user.save();
  
      res.status(200).json({ message: "Suspension lifted successfully!", user: user });
    } catch (error) {
      console.error("Error toggling availability:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
}

const allUsers = async(req, res){
  try{
    const users = await User.find();
    const totalUsers = await User.countDocuments();
    return res.status(200).json({ users, totalUsers });
  }catch (error) {
    console.error("Error listing users:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

const makeUserAModerator = async (req, res) => {
  try {
    let { email } = req.body;
    email = email.toLowerCase(); 
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.userType = "moderator";
    await user.save();

    return res.status(200).json({ message: "User is now a moderator" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};

const revertUserToNormal = async(req, res)=>{
  const {userId} = req.params
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.userType = "writer";
    await user.save();

    return res.status(200).json({ message: "User is now a normal writer" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
}

const adminDeleteSinglePost = async(req, res)=>{
  const postId = req.params.postId;
  try {
    const deletedPost = await Posts.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
}

const adminDeleteAllPosts = async(req, res)=>{
  try {
    const deletedPosts = await Posts.deleteMany({});
    if(!deletedPosts){
      return res.status(404).json({ error: "Posts not found" });
    }
    return res.status(200).json({ message: "All posts deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
}

const approveWithdrawal = async (req, res) => {
  try {
    const { requestId } = req.params;

    const withdrawalRequest = await WithdrawalRequest.findById(requestId).populate("user", ['username']);

    if (!withdrawalRequest) {
      return res.status(404).json({ error: "Withdrawal request not found" });
    }

    const amountWithdrawn = withdrawalRequest.amount;
    const user = withdrawalRequest.user;

    const userWallet = await Wallet.findOne({ user: user._id });

    if (!userWallet) {
      return res.status(404).json({ error: "User wallet not found" });
    }

    if (userWallet.balance < amountWithdrawn) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    userWallet.balance -= amountWithdrawn;
    await userWallet.save();

    const approvedWithdrawalRequest = await WithdrawalRequest.findByIdAndUpdate(requestId, { status: "approved" }, { new: true });

    const transaction = new Transaction({
      user: user._id,
      amount: amountWithdrawn,
      type: "withdrawal",
      status: "completed"
    });
    await transaction.save();

    return res.status(200).json({ message: "Withdrawal request approved successfully", withdrawal: approvedWithdrawalRequest });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};

module.exports ={
    banUser,
    removeSuspension,
    suspendUser,
    allUsers,
    makeUserAModerator,
    revertUserToNormal,
    adminDeleteSinglePost,
    adminDeleteAllPosts
}