import express from "express";
import { isAuthenticated, isAuthenticatedAPI } from "../middleware/auth.js";
import { matchUsersById } from "../data/compDisc.js";
import { validTrimInput } from "../helpers.js";
import { searchUsers } from "../data/userService.js";
import xss from "xss";

const router = express.Router();

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const matchedUserObjs = await matchUsersById(req.session.userId); // yet to implement
    // returns an array of user objects that match the user's routes

    const hasMatchedUsers = matchedUserObjs.length > 0;

    res.render("compDiscPage", {
      title: "Companion Discovery",
      customCSS: "compDisc",
      hasMatchedUsers: hasMatchedUsers,
      matchedUsers: matchedUserObjs
    });
  } catch (e) {
    return res.status(400).render("error", {
      message: e.message
    });
  }
});

router.post("/search", isAuthenticatedAPI, async (req, res) => {
  try {
    let { search } = req.body;
    search = xss(search);
    search = validTrimInput(search, "string");
    const users = await searchUsers(search);
    return res.status(200).json(users);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

export default router;
