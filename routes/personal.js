import express from "express";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import * as userService from "../data/userService.js";
import * as postService from "../data/post.js";
import { isAuthenticated } from "../middleware/auth.js";
import Post from "../models/posts.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only JPEG, JPG, and PNG files are allowed."));
  }
});

router.get("/:username", isAuthenticated, async (req, res) => {
  try {
    // console.log("Requested username:", req.params.username);

    const user = await userService.getUserByUsername(req.params.username);
    // const isCurrentUser = req.session.userName === req.params.username;
    const isCurrentUser = req.session.userId === user._id.toString();

    // console.log("Fetched user:", user);
    // console.log("Comments fetched for user:", user.personalPageComments);
    if (!user) {
      return res.status(401).redirect("/login");
    }

    let isFollowing = false;
    if (!isCurrentUser) {
      isFollowing = await userService.isFollowing(req.session.userId, user._id);
    }

    // const posts = await postService.getUserAllPosts(user._id);
    const userPosts = await Post.find({ uid: user._id }).lean();
    const followersCount = user.followers?.length || 0;
    const followingCount = user.following?.length || 0;

    res.render("personalPage", {
      title: `${user.userName}'s Personal Page`,
      user: {
        userName: user.userName,
        bio: user.bio || "This user has not set a bio yet.",
        profilePicture: user.profilePicture || "/default-profile.svg",
        email: user.email || "This user has not set email yet.",
        phoneNumber: user.phoneNumber || "This user has not set number yet.",
        followersCount,
        followingCount,
        personalPageComments: user.personalPageComments,
        posts: userPosts
      },
      isCurrentUser,
      isFollowing,
      successMessage: req.flash("successMessage"),
      errorMessage: req.flash("errorMessage"),
      customCSS: "personalPage"
    });
  } catch (err) {
    console.error("Error in /personal/:username:", err.message);
    res.status(404).render("error", { message: "User not found" });
  }
});

router.get("/:username/edit", isAuthenticated, async (req, res) => {
  try {
    const user = await userService.getUserByUsername(req.params.username);
    if (!user) {
      throw new Error("User not found");
    }
    res.render("editPersonalPage", {
      title: "Edit Personal Page",
      user,
      customCSS: "editPersonalPage"
    });
  } catch (err) {
    console.error(err);
    res.status(403).render("error", { message: "Access denied" });
  }
});

router.post(
  "/:username/edit",
  isAuthenticated,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const sessionUser = await userService.getUserByUsername(
        req.session.userName,
        true
      );
      console.log("Session user:", sessionUser);
      console.log("Password field:", sessionUser.password);
      if (!sessionUser || sessionUser.userName !== req.params.username) {
        throw new Error("Unauthorized access");
      }

      const { formType, currentPassword, newPassword, confirmPassword } =
        req.body;

      if (formType === "password") {
        if (!currentPassword || !newPassword || !confirmPassword) {
          return res.render("editPersonalPage", {
            title: "Edit Personal Page",
            user: sessionUser,
            customCSS: "editPersonalPage",
            errorMessage: "All password fields are required."
          });
        }

        if (newPassword !== confirmPassword) {
          return res.render("editPersonalPage", {
            title: "Edit Personal Page",
            user: sessionUser,
            customCSS: "editPersonalPage",
            errorMessage: "New passwords do not match."
          });
        }

        const isPasswordCorrect = await userService.verifyPassword(
          sessionUser.password,
          currentPassword
        );
        if (!isPasswordCorrect) {
          return res.render("editPersonalPage", {
            title: "Edit Personal Page",
            user: sessionUser,
            customCSS: "editPersonalPage",
            errorMessage: "Current password is incorrect."
          });
        }

        const hashedPassword = await userService.hashPassword(newPassword);
        await userService.updateUserByUsername(req.params.username, {
          password: hashedPassword
        });

        return res.render("editPersonalPage", {
          title: "Edit Personal Page",
          user: sessionUser,
          customCSS: "editPersonalPage",
          successMessage: "Password updated successfully!"
        });
      }

      let profilePicturePath = "";

      if (req.file) {
        const resizedImagePath = `/uploads/resized-${req.file.filename}`;
        await sharp(req.file.path)
          .resize(200, 200)
          .toFile(`public${resizedImagePath}`);
        profilePicturePath = resizedImagePath;
      }

      const updatedData = {
        bio: req.body.bio || "",
        email: req.body.email || "",
        phoneNumber: req.body.phoneNumber || "",
        profilePicture:
          profilePicturePath ||
          req.body.profilePicture ||
          "/default-profile.svg"
      };
      if (
        updatedData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedData.email)
      ) {
        return res.render("editPersonalPage", {
          title: "Edit Personal Page",
          user: sessionUser,
          customCSS: "editPersonalPage",
          errorMessage: "Invalid email format."
        });
      }

      if (
        updatedData.phoneNumber &&
        !/^[0-9\-+()\s]{7,15}$/.test(updatedData.phoneNumber)
      ) {
        return res.render("editPersonalPage", {
          title: "Edit Personal Page",
          user: sessionUser,
          customCSS: "editPersonalPage",
          errorMessage: "Invalid phone number format."
        });
      }

      await userService.updateUserByUsername(req.params.username, updatedData);

      return res.redirect(`/personal/${req.params.username}`);
    } catch (err) {
      console.error("Error in edit route:", err.message);
      res.render("editPersonalPage", {
        title: "Edit Personal Page",
        user: req.session.user,
        customCSS: "editPersonalPage",
        errorMessage: "An unexpected error occurred. Please try again."
      });
    }
  }
);

router.post("/:username/toggleFollow", isAuthenticated, async (req, res) => {
  try {
    const currentUserId = req.session.userId;
    const targetUser = await userService.getUserByUsername(req.params.username);

    if (!targetUser) {
      return res.status(404).json({ error: "Target user not found" });
    }

    const result = await userService.toggleFollowUser(
      currentUserId,
      targetUser._id
    );

    return res.status(200).json({
      isFollowing: result.isFollowing,
      message: result.message
    });
  } catch (err) {
    console.error("Error in follow route:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

router.get("/:username/followers", isAuthenticated, async (req, res) => {
  try {
    const targetUser = await userService.getUserByUsername(req.params.username);
    if (!targetUser) {
      throw new Error("User not found");
    }

    const followers = await userService.getUserDetailsByIds(
      targetUser.followers
    );
    // const recommendedUsers = await userService.getRecommendedUsers(req.session.userId);
    res.render("followersPage", {
      title: `${targetUser.userName}'s Followers`,
      user: targetUser,
      followers,
      // recommendedUsers,
      customCSS: "followersPage"
    });
  } catch (err) {
    console.error("Error in followers route:", err.message);
    res.status(500).render("error", { message: "Unable to fetch followers." });
  }
});

router.get("/:username/following", isAuthenticated, async (req, res) => {
  try {
    const targetUser = await userService.getUserByUsername(req.params.username);
    if (!targetUser) {
      throw new Error("User not found");
    }

    const following = await userService.getUserDetailsByIds(
      targetUser.following
    );
    const recommendedUsers = await userService.getRecommendedUsers(
      req.session.userId
    );
    res.render("followingPage", {
      title: `${targetUser.userName}'s Following`,
      user: targetUser,
      following,
      recommendedUsers,
      customCSS: "followingPage"
    });
  } catch (err) {
    console.error("Error in following route:", err.message);
    res
      .status(500)
      .render("error", { message: "Unable to fetch following users." });
  }
});

router.post("/:username/comment", isAuthenticated, async (req, res) => {
  try {
    const targetUser = await userService.getUserByUsername(req.params.username);
    if (!targetUser) throw new Error("User not found");

    const commentData = {
      uid: req.session.userId,
      content: req.body.commentText
    };

    await userService.addCommentToUser(targetUser._id, commentData);

    res.redirect(`/personal/${req.params.username}`);
  } catch (err) {
    console.error("Error in /personal/:username/comment:", err.message);
    res.status(500).render("error", { message: "Failed to add comment" });
  }
});
// Delete selected comments
router.post("/:username/delete-comments", isAuthenticated, async (req, res) => {
  try {
    const { username } = req.params;
    const { commentId, selectedComments } = req.body;
    console.log("Delete Request Received:");
    console.log("commentId:", commentId);
    console.log("selectedComments:", selectedComments);
    const sessionUser = await userService.getUserByUsername(
      req.session.userName
    );
    if (!sessionUser) {
      throw new Error("Unauthorized access - User not found");
    }
    console.log("Session User:", sessionUser);
    const targetUser = await userService.getUserByUsername(username);
    console.log("Target User:", targetUser);
    // if (!sessionUser || sessionUser.userName !== username) {
    //   throw new Error("Unauthorized access");
    // }
    if (!targetUser) throw new Error("Target user not found");
    console.log(
      `Checking authorization for session user: ${sessionUser.userName}, target user: ${targetUser.userName}`
    );
    if (commentId) {
      const comment = await userService.getCommentById(commentId);

      if (
        comment.uid.userName === sessionUser.userName ||
        sessionUser.userName === targetUser.userName
        // username !== sessionUser.userName
      ) {
        await userService.deleteCommentById(commentId);
      } else {
        throw new Error("Unauthorized access - Cannot delete comment");
      }
    }

    return res.redirect(`/personal/${username}`);
  } catch (err) {
    console.error("Error in /delete-comments route:", err.message);
    return res.redirect(`/personal/${req.params.username}`);
  }
});

export default router;
