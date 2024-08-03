const User = require("../models/user.model");
const Posts = require("../models/post.model")
const withdrawal = require("../models/withdrawal.model");
const Wallet = require("../models/wallet.models")
const Transaction = require("../models/transaction.model");
const formatDate = require("../utils/formatDate");
const nodemailer = require("nodemailer")


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send email function
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.ADMIN_EMAIL, 
    to: to,
    subject: subject,
    text: text
  };

  return transporter.sendMail(mailOptions);
};

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

      await sendEmail(
        user.email,
        'Account Suspended',
        `Hello ${user.username},\n\nYour account has been suspended. If you believe this is a mistake, please contact support.\n\nBest regards,\nHomeworktips Team`
      );
  
      res.status(200).json({ message: "Account suspended successfully", user: user });
    } catch (error) {
      console.error("Error toggling availability:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
}

const removeSuspension = async (req, res) => {
  try {
    const { userId } = req.params; 

    const user = await User.findById(userId);
  
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
  
    // Check if user is either suspended or banned
    if (user.accountStatus !== "suspended" && user.accountStatus !== "banned") {
      return res.status(400).json({ error: "This user is not suspended or banned; request could not be processed." });
    }
  
    user.accountStatus = "active";
    await user.save();
    await sendEmail(
      user.email,
      'Account Suspension Lifted',
      `Hello ${user.username},\n\nYour account has been successfully reactivated. If you have any questions, please contact support.\n\nBest regards,\nHomeworktips Team`
    );
    res.status(200).json({ message: "Suspension lifted successfully!", user: user });
  } catch (error) {
    console.error("Error lifting suspension:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const allUsers = async(req, res)=>{
  try{

    let wallets = await Wallet.find().populate("user");
    wallets = wallets.map((item) => {
      const wallet = item.toObject();
      return {
        user_id: wallet.user?._id,
        name: wallet.user?.username,
        email: wallet.user?.email,
        createdAt: formatDate(wallet.user?.createdAt),
        balance: wallet?.balance,
        userType: wallet?.user?.userType,
        accountStatus: wallet?.user?.accountStatus,
        
      };
    });
    
    const totalUsers = await User.countDocuments();
    return res.status(200).json({ users:wallets, totalUsers });
  }catch (error) {
    console.error("Error listing users:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

const makeUserAModerator = async (req, res) => {
  try {
    const {userId} = req.params
 
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.userType = "moderator";
    await user.save();

    await sendEmail(
      user.email,
      'Account Upgraded to Moderator!',
      `Hello ${user.username},\n\nYou have been given moderator role on homeworktips.info website. Please login to start acting like boss.\n\nBest regards,\nHomeworktips Team`
    );

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

    await sendEmail(
      user.email,
      'Account Downgraded to Normal User',
      `Hello ${user.username},\n\nWe're sorry to inform you that your account is no more on moderator role, you are back to normal user. If you have any questions, please contact support.\n\nBest regards,\nHomeworktips Team`
    );

    return res.status(200).json({ message: "User is now a normal writer" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
}

const adminDeleteSinglePost = async(req, res)=>{
  const {slug} = req.params.postId;
  try {
    const deletedPost = await Posts.findOneAndDelete({slug});
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
    const deletedPosts = await Posts.deleteMany();
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
    adminDeleteAllPosts,
    approveWithdrawal
}
