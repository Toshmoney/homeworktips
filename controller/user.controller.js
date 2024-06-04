const User = require("../models/user.model");

const getUserProfile = async(req, res)=>{
    const {userId} = req.param;
    const user = await User.findById(userId);
    if(!user){
        return res.status(404).json({error:"User Doesn't exist or has been banned!"})
    }

    return res.status(200).json({user})
}

const updateUserProfile = async (req, res) => {
  const user = req.user._id;

  let imageUploadFile;
  let uploadPath;
  let newImageName;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: "Profile picture is missing!" });
  } else {
    imageUploadFile = req.files.profilePicture;
    newImageName = Date.now() + "-" + imageUploadFile.name;

    const path = require('path');
    const fs = require('fs');
    const uploadsDir = path.resolve('./uploads/');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    uploadPath = path.join(uploadsDir, newImageName);

    try {
      await imageUploadFile.mv(uploadPath);
    } catch (err) {
      return res.status(500).json({ error: "Failed to upload image: " + err.message });
    }
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(user, { ...req.body, profilePicture: newImageName }, { runValidators: true, new: true });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update profile: " + err.message });
  }
};



module.exports = {
    updateUserProfile,
    getUserProfile,
}
