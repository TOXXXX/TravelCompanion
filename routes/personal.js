import express from "express";
import * as userService from "../data/userService.js";
import { isAuthenticated } from "../middleware/auth.js";

// import * as postService from "../data/postService.js";

const router = express.Router();
// Not authenticated yet
router.get("/:username", async (req, res) => {
  try {
    console.log("Requested username:", req.params.username);
    const user = await userService.getUserByUsername(req.params.username);
    console.log("Fetched user:", user);

    if (!user) throw new Error("User not found");

    const posts = [];
    const isFollowing = false;

    res.render("personalPage", {
      title: "Personal Page",
      user,
      posts,
      isFollowing,
      customCSS: "personalPage"
    });
  } catch (err) {
    console.error("Error in /personal/:username:", err.message);
    res.status(404).render("error", { message: "User not found" });
  }
});

router.get("/:username/edit", async (req, res) => {
  try {
    if (req.user.username !== req.params.username) {
      throw new Error("Unauthorized access");
    }

    const user = await userService.getUserByUsername(req.params.username);
    res.render("editPersonalPage", { user });
  } catch (err) {
    console.error(err);
    res.status(403).render("error", { message: "Access denied" });
  }
});

router.post("/:username/edit", async (req, res) => {
  try {
    if (req.user.username !== req.params.username) {
      throw new Error("Unauthorized access");
    }

    const updatedData = {
      bio: req.body.bio || "",
      profilePicture: req.body.profilePicture || "",
      backgroundPicture: req.body.backgroundPicture || ""
    };

    await userService.updateUser(req.user._id, updatedData);

    res.redirect(`/personal/${req.params.username}`);
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to update user" });
  }
});

router.post("/:username/follow", async (req, res) => {
  try {
    const targetUser = await userService.getUserByUsername(req.params.username);
    if (!targetUser) throw new Error("User not found");

    await userService.followUser(req.user._id, targetUser._id);

    res.redirect(`/personal/${req.params.username}`);
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to follow user" });
  }
});

router.post("/:username/unfollow", async (req, res) => {
  try {
    const targetUser = await userService.getUserByUsername(req.params.username);
    if (!targetUser) throw new Error("User not found");

    await userService.unfollowUser(req.user._id, targetUser._id);

    res.redirect(`/personal/${req.params.username}`);
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to unfollow user" });
  }
});

export default router;
