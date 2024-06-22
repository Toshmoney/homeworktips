const Post = require("../models/post.model");
const Comment = require("../models/comment.model");

const getComments = async (req, res) => {
  const { slug } = req.params;

  try {
    const post = await Post.findOne({ slug });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comments = await Comment.find({ postId: post._id, parentComment: null }).populate('author', 'username').populate({
      path: 'replies',
      populate: { path: 'author', select: 'username' }
    });
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

const addReply = async (req, res) => {
  const { slug, commentId } = req.params;
  const { text } = req.body;

  try {
    const post = await Post.findOne({ slug });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: 'Parent comment not found' });
    }

    const newReply = new Comment({ text, postId: post._id, author: req.user._id, parentComment: commentId });
    await newReply.save();

    parentComment.replies.push(newReply);
    await parentComment.save();

    res.status(201).json(newReply);
  } catch (error) {
    console.error('Error posting reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addComment, getComments, addReply };
