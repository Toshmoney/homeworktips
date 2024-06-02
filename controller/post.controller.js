const slugify = require('slugify');
const Posts = require("../models/post.model");
const formatDate = require("../utils/formatDate");
const User = require('../models/user.model');


const createPost = async(req, res)=>{

    const user = req.user;
  
      let imageUploadFile;
      let uploadPath;
      let newImageName;
  
      if(!req.files || Object.keys(req.files).length === 0){
        req.flash("error", "Post image is missing!");
      } else {
  
        imageUploadFile = req.files.image;
        newImageName = Date.now() + imageUploadFile.name;
  
        uploadPath = require('path').resolve('./uploads/') + newImageName;
  
        imageUploadFile.mv(uploadPath, function(err){
          if(err){
            req.flash("error", err);
          }
        })
  
      }
  
      const {title, summary, content} = req.body;
      const slug = slugify(title, { lower: true, replacement: '-' });
      try {
          const createdPost = await Posts.create({
              title,
              content,
              image : newImageName,
              summary,
              author : user,
              slug
          });
          if(!createdPost) throw new Error("There was an error creating new blog post")
          res.json(createdPost)
  
          } catch (error) {
             res.json(error) 
          }
  
  }
  
  const getSinglePost = async(req, res)=>{
    const slug = req.params['slug']
    try {
    let foundPost = await Posts.findOne({slug})
    if(!foundPost){
        res.status(404).json({message: "Post doesn't not exist or has been deleted!"})
    }
  
    const customimg = `${process.env.base_url}/post`
  
    const author = foundPost.author;
    let contentAuthor;
    const user = await User.findById({_id:author})
    if(!user){
      contentAuthor = "Anonymous"
    }

    contentAuthor = user.username
    foundPost = {
      title: foundPost.title,
      summary:foundPost.summary,
      content:foundPost.content,
      cover_img:`${customimg}/${foundPost.image}`,
      author:contentAuthor,
      createdAt: formatDate(foundPost.createdAt),
      updatedAt: formatDate(foundPost.updatedAt),
    };
  
    res.status(200).json(foundPost)
  
    } catch (error) {
        console.log(error);
    }
  };
  
  // ============== Get All Posts ================
  
  const getAllPost = async(req, res)=>{
    try {
    const foundPost = await Posts.find({status:"approved"})
    .sort({createdAt: -1})
    .limit(20)
    
    if(foundPost.length === 0){
      res.json({message : "No blog post published yet!"})
    }
  
    res.status(200).json(foundPost)
    } catch (error) {
        console.log(error);
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
            req.flash("error", err);
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
  
    const deletePost = async(req, res)=>{
      const slug = req.params['slug']
      const deletedPost = await Posts.findOneAndDelete({slug})
      if(!deletedPost) throw new Error('Blog does not exist!')
  
      res.json({message: "Blog post deleted successfully!"})
    }
  
    const deleteAllPost = async(req, res)=>{
      const deletedPosts = await Posts.deleteMany();
      if(!deletedPosts)throw new Error("Blog post is currently empty!");
      res.json({message: "All posts deleted successfully!"})
    }

    const rejectPost = async(req, res)=>{
      const {slug} = req.params;
      const post = await Posts.findOne({slug});
      if(!post){
        return res.status(404).json({error:"No post found"})
      }

      if(post.status === "rejected"){
        return res.status(200).json({error:"Post already rejected by moderator"})
      }

      post.status = "rejected";

      await post.save();
      return res.status(201).json({message:"Post rejected successfully!", post})
      
    }
    const approvePost = async(req, res)=>{
      const {slug} = req.params;
      const post = await Posts.findOne({slug});
      if(!post){
        return res.status(404).json({error:"No post found"})
      }

      if(post.status === "approved"){
        return res.status(200).json({error:"Post already approved by moderator"})
      }

      post.status = "approved";

      await post.save();
      return res.status(201).json({message:"Post approved successfully!"})
      
    }

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