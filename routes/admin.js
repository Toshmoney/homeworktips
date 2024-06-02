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

const { isLoggin, isAdmin } = require("../midlewares/auth");

const router = express.Router();

// Admin login route
router.route("/login").post([isAdmin],login);

// Tasks and offer management
router.route("/approve-post/:slug").post([isAdmin],getSinglePost);
router.route("/all-posts").get(getAllPost);
router.route("/create-post").post([isLoggin, isAdmin], createPost);
router.route("/post/:slug").patch([isLoggin, isAdmin], editSinglePost);
router.route("/post/:slug").delete([isLoggin, isAdmin], deletePost);
router.route("/delete-post").delete([isLoggin, isAdmin], deleteAllPost);

module.exports = router;