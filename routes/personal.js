import express from "express";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import xss from "xss";
import * as userService from "../data/userService.js";
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
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    }
  }),
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    if (!allowedTypes.test(file.mimetype)) {
      return cb(new Error("Only JPEG, JPG, and PNG files are allowed."), false);
    }
    cb(null, true);
  }
});

const uploadMiddleware = (req, res, next) => {
  upload.single("profilePicture")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.render("editPersonalPage", {
          title: "Edit Personal Page",
          user: req.session.user,
          customCSS: "editPersonalPage",
          errorMessage: "File size cannot exceed 1MB.",
          formData: { ...req.body }
        });
      } else if (err.message === "Only JPEG, JPG, and PNG files are allowed.") {
        return res.render("editPersonalPage", {
          title: "Edit Personal Page",
          user: req.session.user,
          customCSS: "editPersonalPage",
          errorMessage: err.message,
          formData: { ...req.body }
        });
      } else {
        return res.render("editPersonalPage", {
          title: "Edit Personal Page",
          user: req.session.user,
          customCSS: "editPersonalPage",
          errorMessage:
            "An error occurred during file upload. Please try again.",
          formData: { ...req.body }
        });
      }
    }
    next();
  });
};

router.get("/:username", isAuthenticated, async (req, res) => {
  try {
    const user = await userService.getUserByUsername(xss(req.params.username));
    const isCurrentUser = req.session.userName === xss(req.params.username);
    if (!user) {
      return res.status(401).redirect("/login");
    }
    if (user.isHidden) {
      return res.status(404).render("error", { message: "User not found" });
    }
    let personalPageComments = [];
    if (user.personalPageComments && user.personalPageComments.length > 0) {
      for (const commentId of user.personalPageComments) {
        const comment = await userService.getCommentById(commentId);
        if (comment) {
          personalPageComments.push(comment);
        }
      }
    }
    let isFollowing = false;
    if (!isCurrentUser) {
      isFollowing = await userService.isFollowing(req.session.userId, user._id);
    }

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
        personalPageComments: personalPageComments || [],
        posts: userPosts
      },
      isCurrentUser,
      isFollowing,
      successMessage: req.flash("successMessage"),
      errorMessage: req.flash("errorMessage"),
      customCSS: "personalPage",
      session: req.session
    });
  } catch (err) {
    res.status(404).render("error", { message: "User not found" });
  }
});

router.get("/:username/edit", isAuthenticated, async (req, res) => {
  try {
    const user = await userService.getUserByUsername(xss(req.params.username));
    if (!user) {
      throw new Error("User not found");
    }
    res.render("editPersonalPage", {
      title: "Edit Personal Page",
      user,
      customCSS: "editPersonalPage"
    });
  } catch (err) {
    res.status(403).render("error", { message: "Access denied" });
  }
});

router.post(
  "/:username/edit",
  isAuthenticated,
  uploadMiddleware,
  async (req, res) => {
    try {
      const sessionUser = await userService.getUserByUsername(
        req.session.userName,
        true
      );

      if (!sessionUser || sessionUser.userName !== xss(req.params.username)) {
        throw new Error("Unauthorized access");
      }

      let { formType, currentPassword, newPassword, confirmPassword } =
        req.body;

      formType = xss(formType);

      const renderWithError = (errorMessage, formData = {}) => {
        res.render("editPersonalPage", {
          title: "Edit Personal Page",
          user: sessionUser,
          customCSS: "editPersonalPage",
          errorMessage,
          formData
        });
      };

      if (formType === "password") {
        if (!currentPassword || !newPassword || !confirmPassword) {
          return renderWithError("All password fields are required.");
        }

        if (newPassword !== confirmPassword) {
          return renderWithError("New password do not match.");
        }

        if (newPassword === currentPassword) {
          return renderWithError(
            "New password is the same with current password."
          );
        }

        const passwordRegex =
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
          return renderWithError(
            "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
          );
        }

        const isCorrectPsw = await userService.verifyPassword(
          sessionUser.password,
          currentPassword
        );
        if (!isCorrectPsw) {
          return renderWithError("Current password is incorrect.");
        }

        const hashedPassword = await userService.hashPassword(newPassword);
        await userService.updateUserByUsername(xss(req.params.username), {
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
        bio: xss(req.body.bio) || "",
        email: xss(req.body.email) || "",
        phoneNumber: xss(req.body.phoneNumber) || "",
        profilePicture: profilePicturePath || sessionUser.profilePicture
      };
      const validationError = () => {
        if (updatedData.bio && updatedData.bio.length > 150) {
          return "Bio must not exceed 150 characters.";
        }

        if (
          updatedData.email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedData.email)
        ) {
          return "Invalid email format.";
        }

        if (
          updatedData.phoneNumber &&
          !/^[0-9\-+()\s]{7,15}$/.test(updatedData.phoneNumber)
        ) {
          return "Invalid phone number format.";
        }

        return null;
      };

      const errorMessage = validationError();
      if (errorMessage) {
        return renderWithError(errorMessage, updatedData);
      }
      await userService.updateUserByUsername(
        xss(req.params.username),
        updatedData
      );
      return res.redirect(`/personal/${xss(req.params.username)}/edit`);
    } catch (err) {
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
    const targetUser = await userService.getUserByUsername(
      xss(req.params.username)
    );

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
    return res.status(500).json({ error: err.message });
  }
});

router.get("/:username/followers", isAuthenticated, async (req, res) => {
  try {
    const targetUser = await userService.getUserByUsername(
      xss(req.params.username)
    );
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
    res.status(500).render("error", { message: "Unable to fetch followers." });
  }
});

router.get("/:username/following", isAuthenticated, async (req, res) => {
  try {
    const targetUser = await userService.getUserByUsername(
      xss(req.params.username)
    );
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
    res
      .status(500)
      .render("error", { message: "Unable to fetch following users." });
  }
});

router.post("/:username/comment", isAuthenticated, async (req, res) => {
  try {
    const targetUser = await userService.getUserByUsername(
      xss(req.params.username)
    );
    if (!targetUser) throw new Error("User not found");
    const commentText = xss(req.body.commentText);

    if (!commentText || commentText.length > 150) {
      return res.status(400).render("error", {
        message: "Comment must be 150 characters or fewer."
      });
    }
    const commentData = {
      uid: req.session.userId,
      content: commentText.trim()
    };

    await userService.addCommentToUser(targetUser._id, commentData);

    res.redirect(`/personal/${xss(req.params.username)}`);
  } catch (err) {
    res.status(500).render("error", { message: "Failed to add comment" });
  }
});
// Delete selected comments
router.post("/:username/delete-comments", isAuthenticated, async (req, res) => {
  try {
    const username = xss(req.params.username);
    let { commentId, selectedComments } = req.body;
    commentId = xss(commentId);
    selectedComments = xss(selectedComments);

    const sessionUser = await userService.getUserByUsername(
      req.session.userName
    );
    if (!sessionUser) {
      throw new Error("Unauthorized access - User not found");
    }
    const targetUser = await userService.getUserByUsername(username);
    if (!targetUser) throw new Error("Target user not found");
    if (commentId) {
      const comment = await userService.getCommentById(commentId);

      if (
        comment.uid.userName === sessionUser.userName ||
        sessionUser.userName === targetUser.userName
      ) {
        await userService.deleteCommentById(commentId);
      } else {
        throw new Error("Unauthorized access - Cannot delete comment");
      }
    }

    return res.redirect(`/personal/${username}`);
  } catch (err) {
    return res.redirect(`/personal/${xss(req.params.username)}`);
  }
});

export default router;
