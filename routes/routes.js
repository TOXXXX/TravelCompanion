import express from "express";
const router = express.Router();

router.get("/create-route", (req, res) => {
  res.render("create-route", {
    title: "Create Route",
    customCSS: "create-route"
  });
});

export default router;
