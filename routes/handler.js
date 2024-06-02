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

const router = express.Router();

// Register and login
router.route("/user/register").post(register)
router.route("/user/login").post(login);

// Fetch all supported banks
// router.route("/fetch-supported-banks").get([isLoggin], fetchSupportBanks);

// Allow user to withdraw their funds to their local banks
// router.route("/wallet-withdrawal").post([isLoggin, isVerified, verifyUserPin], withdrawalRequest);

// Post management
router.route("/:slug").get(getSinglePost);
router.route("/all-posts").get(getAllPost);
router.route("/create-post").post([isLoggin, isVerified, isWriter], createPost);
router.route("/post/:slug").patch([isLoggin, isVerified, isWriter], editSinglePost);
router.route("/post/:slug").delete([isLoggin, isVerified, isWriter], deletePost);
module.exports = router;