const express = require("express");
const { register, login } = require("../controller/auth.controller");
const {
    createPost,
    getSinglePost,
    getAllPost,
    editSinglePost,
    deleteAllPost,
    deletePost
} = require("../controller/post.controller");

const { isLoggin, isVerified, checkUserPin, verifyUserPin, isWriter } = require("../midlewares/auth");
const { getUserProfile, getWriterProfile, updateUserProfile, getUserPosts } = require("../controller/user.controller");
const { getComments, addComment } = require("../controller/comment.controller");

const router = express.Router();

// Register and login
router.route("/user/register").post(register)
router.route("/user/login").post(login);

// Fetch all supported banks
// router.route("/fetch-supported-banks").get([isLoggin], fetchSupportBanks);

// Allow user to withdraw their funds to their local banks
// router.route("/wallet-withdrawal").post([isLoggin, isVerified, verifyUserPin], withdrawalRequest);

// Post management
router.route("/post/:slug").get(getSinglePost);
router.route("/all-posts").get(getAllPost);
router.route("/create-post").post([isLoggin, isVerified, isWriter], createPost);
router.route("/post/:slug/comments").get(getComments);
router.route("/post/:slug/comment").post([isLoggin], addComment);
router.route("/post/:slug").patch([isLoggin, isVerified, isWriter], editSinglePost);
router.route("/post/:slug").delete([isLoggin, isVerified, isWriter], deletePost);
router.route("/writer/:userId").get(getWriterProfile)
router.route("/profile").get([isLoggin], getUserProfile)
router.route("/user/my-posts").get([isLoggin], getUserPosts)
router.route("/update-profile").put([isLoggin], updateUserProfile)
module.exports = router;