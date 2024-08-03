const express = require("express");
const cors = require('cors');
const { login } = require("../controller/auth.controller");
const {
    createPost,
    approvePost,
    rejectPost,
    deleteAllPost,
    deletePost,
    getAllUserPost
} = require("../controller/post.controller");

const { isLoggin, isModerator } = require("../midlewares/auth");
const { allUsers, makeUserAModerator, revertUserToNormal, suspendUser, removeSuspension, adminDeleteAllPosts, adminDeleteSinglePost } = require("../controller/admin.controller");

const router = express.Router();

router.use(cors({origin:"*"}))

// Moderator login route
router.route("/login").post([isModerator],login);

// post management for moderators
router.route("/approve-post/:slug").post([isLoggin, isModerator],approvePost);
router.route("/all-posts").get(getAllUserPost);
router.route("/create-post").post([isLoggin, isModerator], createPost);
router.route("/reject-post/:slug").post([isLoggin, isModerator], rejectPost);
router.route("/post/:slug").delete([isLoggin, isModerator], adminDeleteSinglePost);
router.route("/delete-post").delete([isLoggin, isModerator], adminDeleteAllPosts);
router.route("/all-users").get([isLoggin, isModerator], allUsers);
router.route("/user-to-mod/:userId").post([isLoggin, isModerator], makeUserAModerator);
router.route("/user-to-normal/:userId").post([isLoggin, isModerator], revertUserToNormal);
router.route("/lift-suspension/:userId").post([isLoggin, isModerator], removeSuspension);
router.route("/suspend-user/:userId").post([isLoggin, isModerator], suspendUser);

module.exports = router;