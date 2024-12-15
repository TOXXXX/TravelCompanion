import express from "express";
import { getUserById, updateUserById } from "./userService.js";

const router = express.Router();

router.get("/user/:id", async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("personalPage", { user });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).send("Server Error");
  }
});

router.put("/user/:id", async (req, res) => {
  try {
    const updatedUser = await updateUserById(req.params.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).send("Server Error");
  }
});

export default router;
