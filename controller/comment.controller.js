const Post = require("../models/post.model");
const Comment = require("../models/comment.model");

const getComments = async (req, res) => {
    const { slug } = req.params;

  try {
    const post = await Post.findOne({ slug });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comments = await Comment.find({ postId: post._id }).populate('author', 'username');
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addComment = async (req, res) => {
    const { slug } = req.params;
  const { text } = req.body;

  try {
    const post = await Post.findOne({ slug });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = new Comment({ text, postId: post._id, author: req.user._id });
    await newComment.save();

    post.comments.push(newComment);
    await post.save();

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {addComment, getComments };
