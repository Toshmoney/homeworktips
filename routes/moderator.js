const express = require("express");
const { login } = require("../controller/auth.controller");
const {
    createPost,
    getSinglePost,
    getAllPost,
    approvePost,
    rejectPost,
    deleteAllPost,
    deletePost
} = require("../controller/post.controller");

const { isLoggin, isAdmin, isModerator } = require("../midlewares/auth");

const router = express.Router();

// Moderator login route
router.route("/login").post([isModerator],login);

// post management for moderators
router.route("/approve-post/:slug").post([isAdmin],getSinglePost);
router.route("/all-posts").get(getAllPost);
router.route("/create-post").post([isLoggin, isModerator], createPost);
router.route("/approve-post").post([isLoggin, isModerator], approvePost);
router.route("/reject-post").post([isLoggin, isModerator], rejectPost);
router.route("/post/:slug").delete([isLoggin, isModerator], deletePost);
router.route("/delete-post").delete([isLoggin, isModerator], deleteAllPost);

module.exports = router;