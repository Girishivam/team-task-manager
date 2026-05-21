const express = require("express");
const { body } = require("express-validator");
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require("../controllers/projectController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(protect);

router.get("/", getProjects);
router.get("/:id", getProject);

router.post(
  "/",
  adminOnly,
  [body("title").trim().notEmpty().isLength({ max: 150 })],
  validate,
  createProject
);

router.put("/:id", adminOnly, updateProject);
router.delete("/:id", adminOnly, deleteProject);
router.post("/:id/members", adminOnly, addMember);
router.delete("/:id/members/:userId", adminOnly, removeMember);

module.exports = router;
