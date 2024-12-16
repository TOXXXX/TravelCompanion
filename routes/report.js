import express from "express";
import { isAuthenticated, requireRole } from "../middleware/auth.js";
import { getUserById, getUserByUsername } from "../data/userService.js";
import Report from "../models/report.js";

const router = express.Router();

router.get("/report/:username", isAuthenticated, (req, res) => {
  return res.render("report", {
    title: "Report",
    customCSS: "report",
    username: req.params.username
  });
});

router.post("/report/:username", isAuthenticated, async (req, res) => {
  try {
    // Handle report submission
    const { reportType, description } = req.body;

    if (!reportType || !description) {
      return res.status(400).send("All fields are required");
    }

    if (req.session.userName === req.params.username) {
      return res.status(400).send("You cannot report yourself");
    }

    // Get the user being reported
    const reportedUser = await getUserByUsername(req.params.username);

    if (!reportedUser) {
      return res.status(404).send("User not found");
    }

    const validReportTypes = [
      "Spam",
      "Harassment",
      "Inappropriate Content",
      "Fake Account",
      "Other"
    ];

    if (!validReportTypes.includes(reportType)) {
      return res.status(400).send("Invalid report type");
    }

    if (description.length > 500) {
      return res.status(400).send("Description is too long");
    }

    const reportedByUser = await getUserByUsername(req.session.userName);

    const report = new Report({
      reportedBy: reportedByUser._id,
      reportedUser: reportedUser._id,
      description: description,
      type: reportType
    });

    await report.save();

    res.status(201).json({ message: "Report submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while submitting the report");
  }
});

// Dismiss a report (:id is the reportId)
router.post(
  "/report/:id/delete",
  isAuthenticated,
  requireRole("Moderator"),
  async (req, res) => {
    try {
      const reportId = req.params.id;
      const report = await Report.findById(reportId);

      if (!report) {
        return res.status(404).send("Report not found");
      }

      await Report.findByIdAndDelete(reportId);

      res.status(200).json({ message: "Report deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while deleting the report");
    }
  }
);

// Disable a user account (:id is the userId)
router.post(
  "/report/:username/disable",
  isAuthenticated,
  requireRole("Moderator"),
  async (req, res) => {
    try {
      const username = req.params.username;
      const user = await getUserByUsername(username);

      if (!user) {
        return res.status(404).send("User not found");
      }

      user.isHidden = !user.isHidden;
      await user.save();

      res.status(200).json({ message: "User disabled successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while disabling the user");
    }
  }
);

router.get(
  "/moderator",
  isAuthenticated,
  requireRole("Moderator"),
  async (req, res) => {
    let reports = await Report.find()
      .populate("reportedBy", "userName")
      .populate("reportedUser", "userName");

    reports = reports.map((report) => ({
      ...report.toObject(),
      reportedBy: report.reportedBy.userName,
      reportedUser: report.reportedUser.userName
    }));

    res.render("moderator", {
      reports,
      title: "Moderator",
      customCSS: "moderator"
    });
  }
);

export default router;
