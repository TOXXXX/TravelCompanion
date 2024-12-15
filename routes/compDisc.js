import express from "express";
import { isAuthenticated, isAuthenticatedAPI } from "../middleware/auth.js";
import { validTrimInput, validInputDate } from "../helpers.js";
import { getFollowingUsers, getUserById } from "../data/userService.js";
import { matchUsersById } from "../data/compDisc.js";

import User from "../models/users.js";
import Route from "../models/routes.js";

const router = express.Router();

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const matchedUserObjs = await matchUsersById(req.session.userId); // yet to implement
    // returns an array of user objects that match the user's routes

    const hasMatchedUsers = matchedUserObjs.length > 0;

    res.render("compDiscPage", {
      title: "Companion Discovery",
      hasMatchedUsers: hasMatchedUsers,
      matchedUsers: matchedUserObjs
    });
  } catch (error) {
    return res.status(400).render("error", {
      message: e.message
    });
  }
});

export default router;
