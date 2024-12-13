import express from "express";
import { isAuthenticated, isAuthenticatedAPI } from "../middleware/auth.js";
import { validTrimInput } from "../helpers.js";
import { getFollowingUsers } from "../data/userService.js";
import { getFilteredPostsWithRoute, LikePost } from "../data/post.js";

const router = express.Router();

// TODO: The unit of distance and duration still unclear
// TODO: Location is currently not available
router
  .route("/")
  .get(async (req, res) => {
    return res.render("posts/index", {
      title: "Posts",
      customCSS: "posts",
      user: req.session.userId || ""
    });
  })
  .post(async (req, res) => {
    try {
      const isPlan = validTrimInput(req.body.isPlan, "boolean");
      const isRoute = validTrimInput(req.body.isRoute, "boolean");
      const following = validTrimInput(req.body.following, "boolean");
      // Search can be empty string (after trimming), which means no search filter
      let search;
      try {
        search = validTrimInput(req.body.search, "string");
      } catch (e) {
        if (e.message === "input must not be empty or just white spaces") {
          search = "";
        } else {
          throw e;
        }
      }

      if (isPlan === false && isRoute === false) {
        throw new Error("You must show either plans or routes");
      }

      let following_user_ids = [];

      // TODO: Filter with following users not tested, need to test with actual following users
      if (following === true && req.session.userId) {
        // If following is true, show posts from users that the current user is following
        // Otherwise, show posts from everyone
        following_user_ids = await getFollowingUsers(req.session.userId);
      }

      let posts = await getFilteredPostsWithRoute(
        isPlan,
        isRoute,
        search,
        following,
        following_user_ids
      );

      posts = posts.map((item) => {
        return {
          id: item._id,
          title: item.title,
          intro: item.intro,
          type: item.isPlan ? "Plan" : "Route",
          comments: item.comments.length,
          likes: item.likeByUsers.length,
          liked: req.session.userId
            ? item.likeByUsers.includes(req.session.userId)
            : false,
          distance: item.routeInfo.routes.distance || "N/A",
          duration: item.routeInfo.routes.duration || "N/A"
        };
      });

      return res.status(200).json({ posts });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  });

router.post("/:id/like", isAuthenticatedAPI, async (req, res) => {
  try {
    const id = validTrimInput(req.params.id, "string");
    const user_id = req.session.userId;
    const { state, likeCount } = await LikePost(id, user_id);
    return res.status(200).json({ state, likes: likeCount });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

router.get("/create", isAuthenticated, (req, res) => {
  res.render("posts/create", {
    title: "Create Post",
    customCSS: "posts"
  });
});

export default router;
