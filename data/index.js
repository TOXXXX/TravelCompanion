import express from "express";
import { getUserById, updateUserById } from "./userService.js";
import xss from "xss";

const router = express.Router();

router.get("/user/:id", async (req, res) => {
  try {
    const user = await getUserById(xss(req.params.id));
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("personalPage", { user });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

router.put("/user/:id", async (req, res) => {
  try {
    const updatedUser = await updateUserById(xss(req.params.id), xss(req.body));
    res.json(updatedUser);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

export default router;
