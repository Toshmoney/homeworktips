const express = require("express");
const { register, login, verifyEmail } = require("../controller/auth.controller");
const {
    createPost,
    getSinglePost,
    getAllPost,
    editSinglePost,
    deleteAllPost,
    deletePost
} = require("../controller/post.controller");

const { isLoggin, isVerified, checkUserPin, verifyUserPin, isWriter, isSuspended } = require("../midlewares/auth");
const { getUserProfile, getWriterProfile, updateUserProfile, getUserPosts, getEarnings, followUser, unfollowUser, getAuthorPosts } = require("../controller/user.controller");
const { getComments, addComment, addReply } = require("../controller/comment.controller");

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
router.route("/create-post").post([isLoggin, isVerified, isWriter,], createPost);
router.route("/post/:slug/comments").get(getComments);
router.route("/post/:slug/comment").post([isLoggin, isSuspended], addComment);
router.route('/post/:slug/comment/:commentId/reply').post([isLoggin, isSuspended], addReply);
router.route("/post/:slug").patch([isLoggin, isVerified, isWriter, isSuspended], editSinglePost);
router.route("/post/:slug").delete([isLoggin, isVerified, isWriter], deletePost);
router.route("/writer/:userId").get(getWriterProfile)
router.route("/profile").get([isLoggin], getUserProfile)
router.route("/user/my-posts").get([isLoggin], getUserPosts)
router.route("/author/:id/posts").get( getAuthorPosts)
router.route("/user/earnings").get([isLoggin], getEarnings)
router.route('/author/:userId/follow').post([isLoggin, isSuspended], followUser)
router.route('/author/:userId/unfollow').post([isLoggin, isSuspended], unfollowUser)
router.route("/update-profile").put([isLoggin, isSuspended], updateUserProfile)
router.route("/verify").get( verifyEmail)
module.exports = router;