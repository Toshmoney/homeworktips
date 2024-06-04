const User = require("../models/user.model");

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

module.exports ={
    banUser,
    removeSuspension,
    suspendUser,
    allUsers
}