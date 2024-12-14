import Comment from "../models/comments.js";

export const getPostComments = async (postId) => {
  try {
    const comments = await Comment.find({ postId: postId }).lean();
    return comments;
  } catch (error) {
    throw new Error(`Unable to get comments: ${error.message}`);
  }
};

export const createComment = async (commentData) => {
  try {
    const newComment = new Comment(commentData);
    await newComment.save();
    return newComment;
  } catch (error) {
    throw new Error(`Unable to create comment: ${error.message}`);
  }
};

export const deleteCommentById = async (commentId) => {
  try {
    const comment = await Comment.findByIdAndDelete(commentId).lean();
    return comment;
  } catch (error) {
    throw new Error(`Unable to delete comment: ${error.message}`);
  }
};
