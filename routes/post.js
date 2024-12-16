import express from "express";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { isAuthenticated, isAuthenticatedAPI } from "../middleware/auth.js";
import { validTrimInput, validInputDate } from "../helpers.js";
import { getFollowingUsers, getUserById } from "../data/userService.js";
import {
  getFilteredPostsWithRoute,
  getPostById,
  deletePostById,
  updatePostById,
  LikePost
} from "../data/post.js";
import {
  getPostComments,
  createComment,
  deleteCommentById
} from "../data/comment.js";
import xss from "xss";
import Post from "../models/posts.js";
import User from "../models/users.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/posts");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  // limits: { fileSize: 1 * 1024 * 1024 },
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
        search = validTrimInput(xss(req.body.search), "string");
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
        // Post may not have route, so check if it exists
        let routes;
        if (item.routeInfo) {
          routes = item.routeInfo;
        } else {
          routes = {
            distance: "N/A",
            duration: "N/A",
            origin: "N/A",
            destination: "N/A"
          };
        }

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
          distance: routes.distance || "N/A",
          duration: routes.duration || "N/A",
          origin: routes.origin ? routes.origin.name.split(",")[0] : "N/A",
          destination: routes.destination
            ? routes.destination.name.split(",")[0]
            : "N/A",
          intendedTime:
            item.intendedTime.length === 0
              ? "N/A"
              : item.intendedTime
                  .map((date) => date.toISOString().split("T")[0])
                  .join(" to ")
        };
      });

      return res.status(200).json({ posts });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  });

router.post("/:id/like", isAuthenticatedAPI, async (req, res) => {
  try {
    const id = validTrimInput(xss(req.params.id), "string");
    const user_id = req.session.userId;
    const { state, likeCount } = await LikePost(id, user_id);
    return res.status(200).json({ state, likes: likeCount });
  } catch (e) {
    return res.status(400).json({ error: e.message });
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

router.post(
  "/create",
  isAuthenticated,
  upload.array("postPictures", 10),
  async (req, res) => {
    try {
      let {
        postTitle,
        postDescription,
        postContent,
        postType,
        startDate,
        endDate
      } = req.body;

      postTitle = xss(postTitle);
      postDescription = xss(postDescription);
      postContent = xss(postContent);
      postType = xss(postType);

      postTitle = validTrimInput(postTitle, "string");
      postDescription = validTrimInput(postDescription, "string");
      postContent = validTrimInput(postContent, "string");
      postType = validTrimInput(postType, "string");

      let images = [];
      if (req.files.length > 0) {
        if (req.files.length > 5) {
          throw new Error("You can only upload up to 5 images");
        }
        for (let i = 0; i < req.files.length; i++) {
          const image = req.files[i].path;
          const clientPicPath = `/uploads/posts/resized-${req.files[i].filename}`;
          await sharp(image)
            .resize({ width: 600, height: 600, fit: "inside" })
            .jpeg({ quality: 90 })
            //.png()
            .toFile(`public${clientPicPath}`);
          images.push(clientPicPath);
          fs.unlinkSync(image); // Delete the original image
        }
      }

      let postData;
      let now = new Date();

      if (postType === "route") {
        let intendedTime = [];
        if (startDate && endDate) {
          intendedTime = [startDate, endDate];
        }
        postData = {
          uid: req.session.userId,
          title: postTitle,
          intro: postDescription,
          content: {
            description: postContent,
            images: images
          },
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
          content: { description: postContent, images: images },
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
      await User.findByIdAndUpdate(
        req.session.userId,
        { $push: { posts: String(newPost._id) } },
        { new: true }
      );
      // Redirect to display the new post
      return res.status(201).redirect(`/route/new/${newPost._id}`);
    } catch (e) {
      return res.status(400).render("error", {
        message: e.message
      });
    }
  }
);

router.get("/:postId", async (req, res) => {
  try {
    const post = await getPostById(xss(req.params.postId));
    let comments = await getPostComments(xss(req.params.postId)); //tested
    for (let i = 0; i < comments.length; i++) {
      comments[i] = {
        _id: comments[i]._id,
        isAuthor: comments[i].uid == req.session.userId,
        author: (await getUserById(comments[i].uid)).userName,
        content: comments[i].content,
        created: comments[i].created,
        lastEdited: comments[i].lastEdited.toDateString()
      };
    }
    const isAuthor = post.uid == req.session.userId;
    const postUserName = (await getUserById(post.uid)).userName;
    const numOfLikes = post.likeByUsers.length;
    const timed = post.intendedTime.length === 2;
    let startDate = "";
    let endDate = "";
    if (timed) {
      startDate = post.intendedTime[0].toDateString();
      endDate = post.intendedTime[1].toDateString();
    }

    let postContentDes = post.content.description;
    if (postContentDes.includes("\n")) {
      postContentDes = postContentDes.split("\n").join("<br>");
    } else if (postContentDes.includes("\r")) {
      postContentDes = postContentDes.split("\r").join("<br>");
    }
    post.content.description = postContentDes;

    return res.render("posts/postDetail", {
      title: `Post: ${post.title}`,
      customCSS: "posts",
      post: post,
      author: postUserName,
      comments: comments,
      likes: numOfLikes,
      timed: timed,
      startDate: startDate,
      endDate: endDate,
      isAuthor: isAuthor
    });
  } catch (e) {
    console.log(e);
    return res.status(404).render("error", {
      message: e.message
    });
  }
});

router.delete("/delete/:postId", isAuthenticated, async (req, res) => {
  try {
    const deletedPost = await deletePostById(xss(req.params.postId));
    if (!deletedPost) {
      throw new Error(
        `Could not delete post with id ${xss(req.params.postId)}`
      );
    }
    return res.status(204).json({ message: "Post deleted" });
  } catch (e) {
    return res.status(400).render("error", {
      message: e.message
    });
  }
});

router.get("/edit/:postId", isAuthenticated, async (req, res) => {
  try {
    const post = await getPostById(xss(req.params.postId));

    if (!post) {
      throw new Error(`Could not find post with id ${xss(req.params.postId)}`);
    }
    if (post.intendedTime.length !== 2) {
      res.render("posts/edit", {
        title: "Edit Post",
        customCSS: "posts",
        post: post
      });
    } else {
      const offset = new Date().getTimezoneOffset();
      let sdStr = new Date(post.intendedTime[0].getTime() - offset * 60 * 1000)
        .toISOString()
        .split("T")[0];
      let edStr = new Date(post.intendedTime[1].getTime() - offset * 60 * 1000)
        .toISOString()
        .split("T")[0];
      res.render("posts/edit", {
        title: "Edit Post",
        customCSS: "posts",
        post: post,
        startDate: sdStr,
        endDate: edStr
      });
    }
  } catch (e) {
    return res.status(400).render("error", {
      message: e.message
    });
  }
});

router.patch(
  "/edit/:postId",
  isAuthenticated,
  upload.array("postPictures", 10),
  async (req, res) => {
    try {
      let {
        postTitle,
        postDescription,
        postContent,
        postType,
        startDate,
        endDate
      } = req.body;
      postTitle = xss(postTitle);
      postDescription = xss(postDescription);
      postContent = xss(postContent);
      postType = xss(postType);

      postTitle = validTrimInput(postTitle, "string");
      postDescription = validTrimInput(postDescription, "string");
      postContent = validTrimInput(postContent, "string");
      postType = validTrimInput(postType, "string");
      let postData;
      let now = new Date();
      if (postType === "route") {
        let intendedTime = [];
        if (startDate && endDate) {
          intendedTime = [startDate, endDate];
        }
        postData = {
          title: postTitle,
          intro: postDescription,
          content: { description: postContent },
          isPlan: false,
          intendedTime: intendedTime,
          lastEdited: now
        };
      } else if (postType === "plan") {
        startDate = validInputDate(startDate);
        endDate = validInputDate(endDate);
        postData = {
          title: postTitle,
          intro: postDescription,
          content: { description: postContent },
          isPlan: true,
          intendedTime: [startDate, endDate],
          lastEdited: now
        };
      } else {
        throw new Error("Invalid post type");
      }

      if (req.files.length > 0) {
        const oldPost = await getPostById(xss(req.params.postId));
        let dbImgs = oldPost.content.images;
        if (req.files.length + dbImgs.length > 5) {
          throw new Error("You can only have up to 5 images for a post");
        }
        for (let i = 0; i < req.files.length; i++) {
          const image = req.files[i].path;
          const clientPicPath = `/uploads/posts/resized-${req.files[i].filename}`;
          await sharp(image)
            .resize({ width: 600, height: 600, fit: "inside" })
            .jpeg({ quality: 90 })
            //.png()
            .toFile(`public${clientPicPath}`);
          dbImgs.push(clientPicPath);
          fs.unlinkSync(image); // Delete the un-cut images
        }
        postData.content.images = dbImgs;
      } else {
        const oldPost = await getPostById(xss(req.params.postId));
        postData.content.images = oldPost.content.images;
      }

      const updatedPost = await updatePostById(
        xss(req.params.postId),
        postData
      );
      if (!updatedPost) {
        throw new Error(
          `Could not update post with id ${xss(req.params.postId)}`
        );
      }
      return res.status(200).json({ message: "Post updated successfully" });
    } catch (e) {
      return res.status(400).render("error", {
        message: e.message
      });
    }
  }
);

router.post("/:postId/comment", isAuthenticated, async (req, res) => {
  try {
    let { makeComment } = req.body;
    makeComment = xss(makeComment);
    makeComment = validTrimInput(makeComment, "string");
    if (!makeComment) {
      throw new Error("Comment cannot be empty");
    }
    const now = new Date();
    const newComment = {
      uid: req.session.userId,
      postId: xss(req.params.postId),
      content: makeComment,
      created: now,
      lastEdited: now
    };
    const mongoNewComment = await createComment(newComment);
    return res.redirect(`/post/${xss(req.params.postId)}`);
  } catch (e) {
    return res.status(400).render("error", {
      message: e.message
    });
  }
});

router.delete(
  "/comment/delete/:commentId",
  isAuthenticated,
  async (req, res) => {
    try {
      const deletedComment = await deleteCommentById(xss(req.params.commentId));
      if (!deletedComment) {
        throw new Error(
          `Could not delete comment with id ${xss(req.params.commentId)}`
        );
      }
      return res.status(204).json({ message: "Comment deleted" });
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
  }
);

router.delete("/image/delete", isAuthenticated, async (req, res) => {
  try {
    let { postId, imgSrc } = req.body;
    postId = xss(postId);
    imgSrc = xss(imgSrc);
    const post = await Post.findById(postId);
    const postUser = await User.findById(post.uid);
    if (postUser._id != req.session.userId) {
      throw new Error("You are not authorized to delete this image");
    }
    post.content.images = post.content.images.filter((img) => img !== imgSrc);
    await updatePostById(postId, post);

    fs.unlink(`public${imgSrc}`, (err) => {
      if (err) throw err;
    });

    return res.status(204).json({ message: "Image deleted" });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

export default router;
