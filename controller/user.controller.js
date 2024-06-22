const User = require("../models/user.model");
const Wallet = require("../models/wallet.models");
const formatDate = require("../utils/formatDate");
const path = require('path');
const fs = require('fs');
const Post = require("../models/post.model");
const Comment = require("../models/comment.model");

const getUserProfile = async(req, res)=>{
  console.log(req.user);
  try {
    let user = await Wallet.findOne({user: req.user}).populate("user")
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User wallet: " + user);
    // console.log("User wallet: " + user.user);

    // user = {
    //   balance,
    //   username:user.username,
    //   email:user.email,
    //   availability:user.availability,
    //   skillsets:user.skillsets,
    //   joined: formatDate(user.createdAt),
    //   profileUpdated:formatDate(user.updatedAt)
    // }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "An error occurred while retrieving the profile." });
  }
}

const getWriterProfile = async(req, res)=>{
  const {userId} = req.params
  try {
    let user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user = {
      username: user.username,
      email: user.email,
      availability:user.availability,
      skillsets:user.skillsets,
      joined: formatDate(user.createdAt),
      profileUpdated:formatDate(user.updatedAt),
      profilePic: user.profilePicture,
      cover: user.profileCover,
      desc: user.profileDescription
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "An error occurred while retrieving the profile." });
  }
}

const followUser = async (req, res) => {
  const { userId } = req.params;
  const { currentUserId } = req.body;

  try {
    let user = await User.findById(userId);
    let currentUser = await User.findById(currentUserId);

    if (!user || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.followers.includes(currentUserId)) {
      user.followers.push(currentUserId);
      currentUser.following.push(userId);
      await user.save();
      await currentUser.save();
    }

    await user.save();
    await currentUser.save();
    return res.status(200).json({ message: "Followed successfully", followers:user.followers });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ error: "An error occurred while following the user." });
  }
};

const unfollowUser = async (req, res) => {
  const { userId } = req.params;
  const { currentUserId } = req.body;

  try {
    let user = await User.findById(userId);
    let currentUser = await User.findById(currentUserId);

    if (!user || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    user.followers = user.followers.filter(id => id.toString() !== currentUserId);
    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);

    await user.save();
    await currentUser.save();

    return res.status(200).json({ message: "Unfollowed successfully" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ error: "An error occurred while unfollowing the user." });
  }
};


const updateUserProfile = async (req, res) => {
  const user = req.user._id;

  // Check if files are provided
  if (!req.files || !req.files.image) {
    return res.status(400).json({ error: "Profile picture is missing!" });
  }

  const imageUploadFile = req.files.image;
  const newImageName = Date.now() + imageUploadFile.name;
  const uploadPath = require('path').resolve('./') + '/uploads/' + newImageName;

  // Ensure uploads directory exists
  if (!fs.existsSync(path.join(__dirname, '../uploads'))) {
    fs.mkdirSync(path.join(__dirname, '../uploads'));
  }

  try {
    // Move the uploaded file to the uploads directory
    await imageUploadFile.mv(uploadPath);
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      user,
      { ...req.body, profilePicture: newImageName },
      { runValidators: true, new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    return res.status(500).json({ error: "Failed to upload image: " + err.message });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    const posts = await Post.find({ author: userId });

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ postId: post._id });
        const reward = Math.floor(post.views / 1000) * 0.1;

        return {
          ...post._doc,
          commentCount,
          reward,
        };
      })
    );

    res.status(200).json(postsWithDetails);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user's posts: " + err.message });
  }
};


const getEarnings = async (req, res) => {
  const userId = req.user._id;

  try {
    const posts = await Post.find({ author: userId });

    const totalEarnings = posts.reduce((acc, post) => {
      const earningsFromPost = Math.floor(post.views / 1000) * 0.1;
      return acc + earningsFromPost;
    }, 0);

    res.status(200).json({ totalEarnings, posts });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
};



module.exports = {
    updateUserProfile,
    getUserProfile,
    getWriterProfile,
    getUserPosts,
    getEarnings,
    followUser,
    unfollowUser
}
