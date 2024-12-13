import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { validTrimInput, validInputDate } from "../helpers.js";
import { getFollowingUsers, getUserById } from "../data/userService.js";
import { getFilteredPostsWithRoute, getPostById } from "../data/post.js";
import Post from "../models/posts.js";
import Comment from "../models/comments.js";

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
  try {
    res.render("posts/create", {
      title: "Create Post",
      customCSS: "posts"
    });
  } catch (e) {
    return res.status(400).render("error", {
      message: e.message
    });
  }
});

router.post("/create", isAuthenticated, async (req, res) => {
  try {
    let {
      postTitle,
      postDescription,
      postContent,
      postType,
      startDate,
      endDate
    } = req.body;

    postTitle = validTrimInput(postTitle, "string");
    postDescription = validTrimInput(postDescription, "string");
    postContent = validTrimInput(postContent, "string");
    postType = validTrimInput(postType, "string");

    let postData;
    let now = new Date();

    // console.log(req.session.userId);

    if (postType === "route") {
      let intendedTime = [];
      if (startDate && endDate) {
        intendedTime = [startDate, endDate];
      }
      postData = {
        uid: req.session.userId,
        title: postTitle,
        intro: postDescription,
        content: { description: postContent },
        isPlan: false,
        intendedTime: intendedTime,
        created: now,
        lastEdited: now,
        comments: [],
        likeByUsers: []
      };
    } else if (postType === "plan") {
      startDate = validInputDate(startDate);
      endDate = validInputDate(endDate);
      postData = {
        uid: req.session.userId,
        title: postTitle,
        intro: postDescription,
        content: { description: postContent },
        isPlan: true,
        intendedTime: [startDate, endDate],
        created: now,
        lastEdited: now,
        comments: [],
        likeByUsers: []
      };
    } else {
      throw new Error("Invalid post type");
    }

    // Save the post
    const newPost = new Post(postData);
    await newPost.save();
    // Redirect to display the new post
    return res.status(201).redirect(`/post/${newPost._id}`);
  } catch (e) {
    return res.status(400).render("error", {
      message: e.message
    });
  }
});

router.get("/:postId", async (req, res) => {
  try {
    const post = await getPostById(req.params.postId);
    let comments = await Comment.find({ postId: req.params.postId });
    if (!comments) {
      comments = [];
    }
    console.log(post);
    // console.log(req.session.userId);

    const postUserName = (await getUserById(post.uid)).userName;
    const numOfLikes = post.likeByUsers.length;
    const timed = post.intendedTime.length === 2;
    let startDate = "";
    let endDate = "";
    if (timed) {
      startDate = post.intendedTime[0].toDateString();
      endDate = post.intendedTime[1].toDateString();
    }

    return res.render("posts/postDetail", {
      title: `Post: ${post.title}`,
      customCSS: "posts",
      post: post,
      author: postUserName,
      comments: comments,
      likes: numOfLikes,
      timed: timed,
      startDate: startDate,
      endDate: endDate
    });
  } catch (e) {
    return res.status(400).render("error", {
      message: e.message
    });
  }
});

router.post("/:postId/comment", isAuthenticated, async (req, res) => {
  // TODO: Add a comment to the posts
});

export default router;
