import express from "express";
import bcrypt from "bcrypt";
import User from "../models/users.js";

const router = express.Router();

router.get("/register", (req, res) => {
  res.render("register", { title: "Sign Up", customCSS: "register" });
});

router.post("/register", async (req, res) => {
  try {
    const { userName, password, email, phoneNumber } = req.body;
    const newUser = new User({ userName, password, email, phoneNumber });
    await newUser.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(400).send(`Error registering user: ${error.message}`);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { userName, password } = req.body;
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(401).send("User does not exist");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send("Invalid password");
    }

    // Set session data
    req.session.isAuthenticated = true;
    req.session.userId = user._id;
    req.session.userName = user.userName;

    res.json({ message: "Logged in successfully" });
  } catch (error) {
    res.status(500).send(`Error logging in: ${error.message}`);
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("sessionId");
    res.json({ message: "Logged out successfully" });
  });
});

export default router;
