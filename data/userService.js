import User from "../models/users.js";
import Comment from "../models/comments.js";
import Post from "../models/posts.js";

export const createUser = async (userData) => {
  try {
    const user = new User(userData);
    await user.save();
    return user;
  } catch (error) {
    throw new Error(`Unable to create user: ${error.message}`);
  }
};

export const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId)
      .populate("posts")
      .populate("personalPageComments");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error(`Unable to get user: ${error.message}`);
  }
};

// get User
export const getUserByUsername = async (username) => {
  try {
    const user = await User.findOne({ userName: username })
      .populate("posts")
      .populate("personalPageComments");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error(`Unable to get user by username: ${error.message}`);
  }
};

// Update User
export const updateUserById = async (userId, updateData) => {
  try {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true
    });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error(`Unable to update user: ${error.message}`);
  }
};

// update Username
export const updateUserByUsername = async (username, updateData) => {
  try {
    const user = await User.findOneAndUpdate({ username }, updateData, {
      new: true
    });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error(`Unable to update user by username: ${error.message}`);
  }
};

// Delete User
export const deleteUserById = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error(`Unable to delete user: ${error.message}`);
  }
};

// Add Comment
export const addCommentToUser = async (userId, commentData) => {
  try {
    const comment = new Comment(commentData);
    await comment.save();

    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { personalPageComments: comment._id } },
      { new: true }
    ).populate("personalPageComments");

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error(`Unable to add comment: ${error.message}`);
  }
};

// getPosts
export const getFollowingPosts = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const posts = await Post.find({ uid: { $in: user.following } }).sort({
      created: -1
    });
    return posts;
  } catch (error) {
    throw new Error(`Unable to get following posts: ${error.message}`);
  }
};

// CheckFollowing
export const isFollowing = async (currentUserId, targetUserId) => {
  try {
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      throw new Error("Current user not found");
    }
    return currentUser.following.includes(targetUserId);
  } catch (error) {
    throw new Error(`Unable to check following status: ${error.message}`);
  }
};

// Follow
export const followUser = async (currentUserId, targetUserId) => {
  try {
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      throw new Error("Current user not found");
    }

    if (!currentUser.following.includes(targetUserId)) {
      currentUser.following.push(targetUserId);
      await currentUser.save();
    }
  } catch (error) {
    throw new Error(`Unable to follow user: ${error.message}`);
  }
};

// Unfollow
export const unfollowUser = async (currentUserId, targetUserId) => {
  try {
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      throw new Error("Current user not found");
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId.toString()
    );
    await currentUser.save();
  } catch (error) {
    throw new Error(`Unable to unfollow user: ${error.message}`);
  }
};
