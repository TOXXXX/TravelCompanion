import User from "../models/users.js";
import Comment from "../models/comments.js";
import Post from "../models/posts.js";
import bcrypt from "bcrypt";
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

    if (!currentUser) {
      throw new Error("Current user not found");
    }
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => id !== targetUserId
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id !== currentUserId
      );
      await currentUser.save();
      await targetUser.save();
      return {
        action: "unfollowed",
        message: `You have unfollowed ${targetUser.userName}.`
      };
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
      await currentUser.save();
      await targetUser.save();
      return {
        action: "followed",
        message: `You are now following ${targetUser.userName}.`
      };
    }
  } catch (error) {
    throw new Error(`Error toggling follow status: ${error.message}`);
  }
};

export const verifyPassword = async (hashedPassword, plainPassword) => {
  try {
    console.log("Hashed Password:", hashedPassword);
    console.log("Plain Password:", plainPassword);

    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (err) {
    console.error("Error in verifyPassword:", err.message);
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
