import express from "express";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import * as userService from "../data/userService.js";
import { isAuthenticated } from "../middleware/auth.js";

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
    console.log("Requested username:", req.params.username);

    const user = await userService.getUserByUsername(req.params.username);
    const isCurrentUser = req.session.userName === req.params.username;
    console.log("Fetched user:", user);

    if (!user) {
      return res.status(401).redirect("/login");
      // throw new Error("User not found")
    }
    let isFollowing = false;
    if (!isCurrentUser) {
      isFollowing = await userService.isFollowing(req.session.userId, user._id);
    }
    const posts = [];

    res.render("personalPage", {
      title: `${user.userName}'s Personal Page`,
      user: {
        userName: user.userName,
        bio: user.bio || "This user has not set a bio yet.",
        profilePicture: user.profilePicture || "/default-profile.svg",
        // backgroundPicture: user.backgroundPicture || "/default-background.jpg",
        email: user.email,
        phoneNumber: user.phoneNumber
      },
      posts,
      isCurrentUser,
      isFollowing,
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
        req.session.userName
      );
      if (!sessionUser || sessionUser.userName !== req.params.username) {
        throw new Error("Unauthorized access");
      }

      const { formType } = req.body;

      if (formType === "password") {
        const { currentPassword, newPassword, confirmPassword } = req.body;

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

        const passwordVerified = await userService.verifyPassword(
          sessionUser.password,
          currentPassword
        );
        if (!passwordVerified) {
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
        profilePicture:
          profilePicturePath ||
          req.body.profilePicture ||
          "/default-profile.svg"
      };

      await userService.updateUserByUsername(req.params.username, updatedData);

      return res.redirect(`/personal/${req.params.username}`);
    } catch (err) {
      console.error(err.message);
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
      throw new Error("Target user not found");
    }

    const result = await userService.toggleFollowUser(
      currentUserId,
      targetUser._id
    );

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in follow route:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/:username/comment", isAuthenticated, async (req, res) => {
  try {
    const targetUser = await userService.getUserByUsername(req.params.username);
    if (!targetUser) throw new Error("User not found");

    const commentData = {
      userId: req.session.userId,
      content: req.body.comment
    };

    await userService.addCommentToUser(targetUser._id, commentData);

    res.redirect(`/personal/${req.params.username}`);
  } catch (err) {
    console.error("Error in /personal/:username/comment:", err.message);
    res.status(500).render("error", { message: "Failed to add comment" });
  }
});

export default router;