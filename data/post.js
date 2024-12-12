import Post from "../models/posts.js";

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

export const createPost = async (userId, postData) => {
  try {
    const newPost = new Post({ ...postData, uid: userId });
    await newPost.save();
    return newPost;
  } catch (error) {
    throw new Error(`Unable to create post: ${error.message}`);
  }
};

// get posts based on checkbox filters
export const getFilteredPostsWithRoute = async (
  isPlan,
  isRoute,
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
  if (userIds.length > 0) {
    matchStage.$match.author = { $in: userIds };
  }

  try {
    const postsWithRoutes = await Post.aggregate([
      matchStage,
      {
        $lookup: {
          from: "routes",
          localField: "routeID",
          foreignField: "_id",
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
    return postsWithRoutes;
  } catch (error) {
    throw new Error(
      `Unable to get filtered, route included posts: ${error.message}`
    );
  }
};
