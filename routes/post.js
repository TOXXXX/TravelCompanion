import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.render("posts/index", {
    title: "Posts",
    customCSS: "posts"
  });
});

router.get("/create", isAuthenticated, (req, res) => {
  res.render("posts/create", {
    title: "Create Post",
    customCSS: "posts"
  });
});

export default router;
