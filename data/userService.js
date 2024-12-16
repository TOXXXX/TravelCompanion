import User from "../models/users.js";
import Comment from "../models/comments.js";
import Post from "../models/posts.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
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
export const getUserByUsername = async (username, includePassword = false) => {
  try {
    let query = User.findOne({ userName: username })
      .populate("posts")
      // .populate("personalPageComments")
      .populate({
        path: "personalPageComments",
        populate: { path: "uid", select: "userName profilePicture" }
      })
      .populate("followers following", "userName profilePicture");

    if (includePassword) {
      query = query.select(
        "userName bio profilePicture email phoneNumber followers following role isHidden password"
      );
    } else {
      query = query.select(
        "userName bio profilePicture email phoneNumber followers following role isHidden"
      );
    }

    const user = await query;
    if (!user) {
      throw new Error("User not found");
    }
    if (user.isHidden) {
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
    const user = await User.findOneAndUpdate(
      { userName: username },
      updateData,
      {
        new: true
      }
    );
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

// Follow or Unfollow Logic
export const toggleFollowUser = async (currentUserId, targetUserId) => {
  try {
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      throw new Error("Invalid user(s) provided.");
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId.toString()
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId.toString()
      );
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    return {
      isFollowing: !isFollowing,
      message: isFollowing
        ? `You have unfollowed ${targetUser.userName}.`
        : `You are now following ${targetUser.userName}.`
    };
  } catch (error) {
    throw new Error(`Error toggling follow status: ${error.message}`);
  }
};

export const verifyPassword = async (hashedPassword, plainPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (err) {
    throw new Error("Password verification failed");
  }
};

export const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error(`Error hashing password: ${error.message}`);
  }
};

export const isFollowing = async (currentUserId, targetUserId) => {
  try {
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      throw new Error("Current user not found");
    }
    return currentUser.following.includes(targetUserId.toString());
  } catch (error) {
    throw new Error(`Unable to check following status: ${error.message}`);
  }
};

export const getFollowingUsers = async (currentUserId) => {
  try {
    const currentUser = await User.findById(
      new mongoose.Types.ObjectId(currentUserId)
    );
    if (!currentUser) {
      throw new Error("Current user not found");
    }
    return currentUser.following;
  } catch (error) {
    throw new Error(`Unable to retrive all following users: ${error.message}`);
  }
};
export const getUserDetailsByIds = async (userIds) => {
  try {
    const users = await User.find({ _id: { $in: userIds } }).select(
      "userName profilePicture bio"
    );
    return users;
  } catch (error) {
    throw new Error(`Unable to fetch user details: ${error.message}`);
  }
};
export const getRecommendedUsers = async (currentUserId) => {
  try {
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      throw new Error("Current user not found");
    }

    const following = currentUser.following;

    const recommendedUsers = await User.find({
      _id: { $nin: [currentUserId, ...following] }
    })
      .limit(3)
      .select("userName profilePicture bio");

    return recommendedUsers;
  } catch (error) {
    throw new Error(`Unable to fetch recommended users: ${error.message}`);
  }
};

export const getCommentById = async (commentId) => {
  try {
    const comment = await Comment.findById(commentId).populate(
      "uid",
      "userName"
    );
    if (!comment) throw new Error("Comment not found");
    return comment;
  } catch (error) {
    throw new Error(`Unable to get comment: ${error.message}`);
  }
};
export const deleteCommentById = async (commentId) => {
  try {
    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) throw new Error("Comment not found");
    await User.updateMany(
      { personalPageComments: commentId },
      { $pull: { personalPageComments: commentId } }
    );
    return comment;
  } catch (error) {
    throw new Error(`Unable to delete comment: ${error.message}`);
  }
};

export const deleteCommentsByIds = async (commentIds, userId) => {
  try {
    const comments = await Comment.find({ _id: { $in: commentIds } });

    for (const comment of comments) {
      if (comment.uid.toString() !== userId.toString()) {
        throw new Error("Unauthorized to delete some comments");
      }
    }

    await Comment.deleteMany({ _id: { $in: commentIds } });
    await User.updateOne(
      { _id: userId },
      { $pull: { personalPageComments: { $in: commentIds } } }
    );
  } catch (err) {
    throw new Error(`Failed to delete selected comments: ${err.message}`);
  }
};

// Randomly select 3 users
export const getRandomUsers = async () => {
  try {
    const users = await User.aggregate([{ $sample: { size: 3 } }]);
    return users;
  } catch (error) {
    throw new Error(`Unable to get random users: ${error.message}`);
  }
};

export const searchUsers = async (search) => {
  try {
    const users = await User.find();
    const searchRegex = new RegExp(search, "i");
    return users.filter((user) => {
      return searchRegex.test(user.userName) || searchRegex.test(user.bio);
    });
  } catch (e) {
    throw new Error(`Unable to search users: ${e.message}`);
  }
};
