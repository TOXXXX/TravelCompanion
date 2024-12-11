import User from "./userModel.js";
import Comment from "./commentModel.js";
import Post from "./postModel.js";

export const getPostById = async (postId) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    return post;
  } catch (error) {
    throw new Error(`Unable to get post: ${error.message}`);
  }
};

export const getUserAllPosts = async (userId) => {
  try {
    const posts = await Post.find({ author: userId });
    return posts;
  } catch (error) {
    throw new Error(`Unable to get user posts: ${error.message}`);
  }
};
