const express = require("express");
const { body } = require("express-validator");
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();
router.use(protect);

router.get("/", getTasks);
router.get("/:id", getTask);

router.post(
  "/",
  adminOnly,
  [
    body("title").trim().notEmpty().isLength({ max: 200 }),
    body("project").notEmpty(),
  ],
  validate,
  createTask
);
router.put("/:id", updateTask);
router.delete("/:id", adminOnly, deleteTask);

module.exports = router;
