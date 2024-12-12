import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { validTrimInput } from "../helpers.js";
import { getFollowingUsers } from "../data/userService.js";
import { getFilteredPostsWithRoute } from "../data/post.js";
import comments from "../models/comments.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let isPlan = true;
    let isRoute = true;
    let following = false;
    if (
      req.params.isPlan !== undefined ||
      req.params.isRoute !== undefined ||
      req.params.following !== undefined
    ) {
      // If no query parameters are provided, default to showing plans and routes and everyone's posts
      // Otherwise, use the query parameters to determine what to show
      isPlan = validTrimInput(req.params.isPlan, "boolean");
      isRoute = validTrimInput(req.params.isRoute, "boolean");
      following = validTrimInput(req.params.following, "boolean");
    }

    if (isPlan === false && isRoute === false) {
      throw new Error("You must show either plans or routes");
    }

    let following_user_ids = [];

    if (following === true) {
      // If following is true, show posts from users that the current user is following
      // Otherwise, show posts from everyone
      following_user_ids = await getFollowingUsers(req.user.id);
    }

    let posts = await getFilteredPostsWithRoute(
      isPlan,
      isRoute,
      following_user_ids
    );

    posts = posts.map((item) => {
      return {
        ...item,
        type: item.isPlan ? "Plan" : "Route",
        comments: item.comments.length,
        likes: item.comments.length
      };
    });

    return res.render("posts/index", {
      title: "Posts",
      posts: posts,
      customCSS: "posts"
    });
  } catch (e) {
    return res.status(400).render("error", {
      message: e.message
    });
  }
});

router.get("/create", isAuthenticated, (req, res) => {
  res.render("posts/create", {
    title: "Create Post",
    customCSS: "posts"
  });
});

export default router;
