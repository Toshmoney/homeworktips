const slugify = require('slugify');
const Posts = require("../models/post.model");
const formatDate = require("../utils/formatDate");
const User = require('../models/user.model');


const createPost = async (req, res) => {
  const user = req.user;

  let imageUploadFile;
  let uploadPath;
  let newImageName;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: "Post image is missing!" });
  } else {
    imageUploadFile = req.files.image;
    newImageName = Date.now() + "-" + imageUploadFile.name;

    // Ensure the uploads directory exists
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

  const { title, summary, content } = req.body;
  const slugify = require('slugify');
  const slug = slugify(title, { lower: true, replacement: '-' });

  try {
    const createdPost = await Posts.create({
      title,
      content,
      image: newImageName,
      summary,
      author: user._id,
      slug
    });

    if (!createdPost) {
      throw new Error("There was an error creating the new blog post");
    }

    return res.status(201).json(createdPost);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create post: " + error.message });
  }
};

  
const getSinglePost = async (req, res) => {
  const slug = req.params['slug'];
  
  try {
    let foundPost = await Posts.findOne({ slug });
    
    if (!foundPost) {
      return res.status(404).json({ error: "Post doesn't exist or has been deleted!" });
    }
  
    const customImgUrl = `${process.env.base_url}/post/${foundPost.image}`;
    const author = foundPost.author;
    
    let contentAuthor = "Anonymous";
    const user = await User.findById(author);
    
    if (user) {
      contentAuthor = user.username;
    }
  
    foundPost = {
      title: foundPost.title,
      summary: foundPost.summary,
      content: foundPost.content,
      cover_img: customImgUrl,
      author: contentAuthor,
      createdAt: formatDate(foundPost.createdAt),
      updatedAt: formatDate(foundPost.updatedAt),
    };
  
    return res.status(200).json(foundPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred while retrieving the post." });
  }
};

  
  // ============== Get All Posts ================
  
  const getAllPost = async (req, res) => {
    try {
      const foundPosts = await Posts.find({ status: "approved" })
        .populate('author', ['username'])
        .sort({ createdAt: -1 })
        .limit(20);
  
      if (foundPosts.length === 0) {
        return res.status(404).json({ error: "No blog posts published yet!" });
      }
  
      res.status(200).json(foundPosts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while retrieving the posts." });
    }
  };
  
  
  // ============== Edit Single Post ================
  
  const editSinglePost = async(req, res)=>{
    let newImageName = null
    let uploadPath;
    let imageUploadFile;
    if(req.file){
    
        imageUploadFile = req.files.image;
        newImageName = Date.now() + imageUploadFile.name;
  
        uploadPath = require('path').resolve('./') + '/uploads/' + newImageName;
  
        imageUploadFile.mv(uploadPath, function(err){
          if(err){
            res.json({error: err});
          }
        })
    }
    const {content, title, summary} = req.body;
    const slug = req.params['slug']
    const postDoc = await Posts.findOneAndUpdate({slug},{
        title,
        content,
        summary,
        slug,
        image: newImageName ? newImageName : postDoc.image
    },{new:true, runValidators:true}
    
    )
    
    }
  
    const deletePost = async (req, res) => {
      try {
        const user = req.user.username;
        const slug = req.params['slug'];
    
        const postToDelete = await Posts.findOne({ slug }).populate('author', 'username');
    
        if (!postToDelete) {
          return res.status(404).json({ error: "Blog does not exist!" });
        }
    
        if (user !== postToDelete.author.username) {
          return res.status(401).json({ error: "You are not authorized!" });
        }
    
        await Posts.findOneAndDelete({ slug });
    
        return res.status(200).json({ message: "Blog post deleted successfully!" });
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: "An error occurred while deleting the post." });
      }
    };
    
  
    const deleteAllPost = async (req, res) => {
      try {
        const deletedPosts = await Posts.deleteMany({ author: req.user._id });
    
        if (deletedPosts.deletedCount === 0) {
          return res.status(404).json({ error: "No blog posts found for the current user!" });
        }
    
        return res.status(200).json({ message: "All posts deleted successfully!" });
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: "An error occurred while deleting the posts." });
      }
    };
    

    const rejectPost = async (req, res) => {
      try {
        const { slug } = req.params;
        const post = await Posts.findOne({ slug });
    
        if (!post) {
          return res.status(404).json({ error: "No post found" });
        }
    
        if (post.status === "rejected") {
          return res.status(200).json({ error: "Post already rejected by moderator" });
        }
    
        post.status = "rejected";
        await post.save();
    
        return res.status(200).json({ message: "Post rejected successfully!", post });
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: "An error occurred while rejecting the post." });
      }
    };
    
    const approvePost = async (req, res) => {
      try {
        const { slug } = req.params;
        const post = await Posts.findOne({ slug });
    
        if (!post) {
          return res.status(404).json({ error: "No post found" });
        }
    
        if (post.status === "approved") {
          return res.status(200).json({ message: "Post already approved by moderator" });
        }
    
        post.status = "approved";
        await post.save();
    
        return res.status(200).json({ message: "Post approved successfully!" });
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: "An error occurred while approving the post." });
      }
    };
    

    module.exports = {
        createPost,
        getSinglePost,
        getAllPost,
        editSinglePost,
        deleteAllPost,
        deletePost,
        approvePost,
        rejectPost
    }