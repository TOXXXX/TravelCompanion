import express from "express";
import bcrypt from "bcrypt";
import User from "../models/users.js";
import { isAuthenticated } from "../middleware/auth.js";
import xss from "xss";

const router = express.Router();

router.get("/register", (req, res) => {
  res.render("register", {
    title: "Sign Up",
    customCSS: "register"
  });
});

router.post("/register", async (req, res) => {
  try {
    let { userName, password, confirmPassword, email } = req.body;
    // Prevent XSS attacks
    // Passwords are omitted because they are hashed before being stored

    userName = userName.toLowerCase();

    userName = xss(userName);
    email = xss(email);
    if (password !== confirmPassword) {
      return res.status(400).send("Passwords do not match");
    }
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res.status(400).send("User already exists with this username");
    }
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).send("User already exists with this email");
    }

    const usernameRegex = /^[a-zA-Z0-9_]{6,30}$/;
    if (!usernameRegex.test(userName)) {
      return res
        .status(400)
        .send(
          "Username must be 6-30 characters long and can only contain letters, numbers, and underscores"
        );
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .send(
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
        );
    }

    const newUser = new User({ userName, password, email });
    await newUser.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(400).send(`Error registering user: ${error.message}`);
  }
});

router.get("/login", (req, res) => {
  res.render("login", { title: "Login", customCSS: "register" });
});

router.post("/login", async (req, res) => {
  try {
    let { userName, password } = req.body;
    // Password omitted

    userName = userName.toLowerCase();

    userName = xss(userName);

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
    req.session.role = user.role;

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
