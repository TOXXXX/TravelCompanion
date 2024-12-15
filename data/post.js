import Post from "../models/posts.js";
import User from "../models/users.js";
import Route from "../models/routes.js";
import mongoose from "mongoose";

export const getPostById = async (postId) => {
  try {
    const post = await Post.findById(postId).lean();
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

export const createPost = async (userId, postData) => {
  try {
    const newPost = new Post({ ...postData, uid: userId });
    await newPost.save();

    const objectIdUserId = new mongoose.Types.ObjectId(userId);
    await User.findByIdAndUpdate(
      objectIdUserId,
      { $push: { posts: newPost._id } },
      { new: true }
    );

    return newPost;
  } catch (error) {
    throw new Error(`Unable to create post: ${error.message}`);
  }
};

// get posts based on checkbox filters
export const getFilteredPostsWithRoute = async (
  isPlan,
  isRoute,
  search,
  following,
  userIds = []
) => {
  const matchStage = {
    $match: {}
  };

  // Filter for plan/route
  if (isPlan === false && isRoute === false) {
    throw new Error("Plan and Route cannot both be false");
  } else if (isPlan === true && isRoute === false) {
    matchStage.$match.isPlan = true;
  } else if (isPlan === false && isRoute === true) {
    matchStage.$match.isPlan = false;
  }
  // Do nothing if both are true

  // Filter for following users
  if (following) {
    matchStage.$match.uid = { $in: userIds };
  }

  try {
    const postsWithRoutes = await Post.aggregate([
      matchStage,
      {
        $addFields: {
          postIDString: { $toString: "$_id" } // Convert _id (ObjectId) to string
        }
      },
      {
        $lookup: {
          from: "routes",
          localField: "postIDString", // Use the string version of _id
          foreignField: "pid",
          as: "routeInfo"
        }
      },
      {
        $unwind: {
          path: "$routeInfo",
          preserveNullAndEmptyArrays: true // Keep posts without routes
        }
      }
    ]);
    // Filter by search term presence in title or intro
    if (search) {
      const searchRegex = new RegExp(search, "i");
      return postsWithRoutes.filter(
        (post) => searchRegex.test(post.title) || searchRegex.test(post.intro)
      );
    }
    return postsWithRoutes;
  } catch (error) {
    throw new Error(
      `Unable to get filtered, route included posts: ${error.message}`
    );
  }
};

export const deletePostById = async (postId) => {
  try {
    const route = await Route.find({ pid: postId });
    if (route.length > 0) {
      for (let i = 0; i < route.length; i++) {
        await Route.findByIdAndDelete(route[i]._id);
      }
    }

    const post = await Post.findByIdAndDelete(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    return post;
  } catch (e) {
    throw new Error(`Unable to delete post: ${e.message}`);
  }
};

export const updatePostById = async (postId, updateData) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: updateData },
      {
        new: true
      }
    ).lean();
    if (!updatedPost) {
      throw new Error("Post not found");
    }
    return updatedPost;
  } catch (e) {
    throw new Error(`Unable to update post: ${e.message}`);
  }
};
// Like a post

export const LikePost = async (postId, userId) => {
  try {
    let state = false; // The state of the like, true for liked, false for unliked
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    if (post.likeByUsers.includes(userId)) {
      state = false;
      post.likeByUsers.pull(userId);
    } else {
      state = true;
      post.likeByUsers.push(userId);
    }
    await post.save();
    return { state, likeCount: post.likeByUsers.length };
  } catch (error) {
    throw new Error(`Unable to like post: ${error.message}`);
  }
};

// Randomly select 3 posts
export const getRandomPosts = async () => {
  try {
    const posts = await Post.aggregate([
      { $sample: { size: 3 } },
      {
        $addFields: {
          postIDString: { $toString: "$_id" } // Convert _id (ObjectId) to string
        }
      },
      {
        $lookup: {
          from: "routes",
          localField: "postIDString", // Use the string version of _id
          foreignField: "pid",
          as: "routeInfo"
        }
      },
      {
        $unwind: {
          path: "$routeInfo",
          preserveNullAndEmptyArrays: true // Keep posts without routes
        }
      }
    ]);
    return posts;
  } catch (error) {
    throw new Error(`Unable to get random posts: ${error.message}`);
  }
};
