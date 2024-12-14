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
    matchStage.$match.author = { $in: userIds };
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
          foreignField: "postID",
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