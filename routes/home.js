import express from "express";
import { getRandomPosts } from "../data/post.js";
import { getRandomUsers } from "../data/userService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let posts = await getRandomPosts();
    let users = await getRandomUsers();

    posts = posts.map((post) => {
      return {
        title: post.title,
        intro: post.intro,
        destinations: post.routeInfo
          ? `${post.routeInfo.origin.name.split(",")[0]} to ${post.routeInfo.destination.name.split(",")[0]}`
          : "N/A",
        duration: post.routeInfo ? post.routeInfo.duration : "N/A",
        intendedDates:
          post.intendedTime.length === 0
            ? "N/A"
            : post.intendedTime
                .map((date) => date.toISOString().split("T")[0])
                .join(" to "),
        likes: post.likeByUsers.length,
        comments: post.comments.length
      };
    });

    users = users.map((user) => {
      return {
        username: user.userName,
        bio: user.bio
      };
    });

    res.render("home", { title: "Home Page", customCSS: "home", posts, users });
  } catch (e) {
    return res.status(400).render("error", {
      message: e.message
    });
  }
});

export default router;
