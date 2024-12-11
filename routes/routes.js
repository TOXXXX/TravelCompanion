import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
const router = express.Router();

router.get("/create-route", isAuthenticated, (req, res) => {
  res.render("create-route", {
    title: "Create Route",
    customCSS: "create-route"
  });
});

export default router;
