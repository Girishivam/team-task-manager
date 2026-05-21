const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");

// POST /api/projects (admin)
exports.createProject = async (req, res) => {
  const { title, description, members = [] } = req.body;
  const project = await Project.create({
    title,
    description,
    createdBy: req.user._id,
    members,
  });
  res.status(201).json(project);
};

// GET /api/projects
exports.getProjects = async (req, res) => {
  const filter =
    req.user.role === "admin"
      ? {}
      : { $or: [{ members: req.user._id }, { createdBy: req.user._id }] };
  const projects = await Project.find(filter)
    .populate("createdBy", "name email")
    .populate("members", "name email role")
    .sort({ createdAt: -1 });
  res.json(projects);
};

// GET /api/projects/:id
exports.getProject = async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("createdBy", "name email")
    .populate("members", "name email role");
  if (!project) return res.status(404).json({ message: "Project not found" });

  if (
    req.user.role !== "admin" &&
    !project.members.some((m) => m._id.equals(req.user._id)) &&
    !project.createdBy._id.equals(req.user._id)
  ) {
    return res.status(403).json({ message: "Access denied" });
  }
  res.json(project);
};

// PUT /api/projects/:id (admin)
exports.updateProject = async (req, res) => {
  const { title, description } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  if (title !== undefined) project.title = title;
  if (description !== undefined) project.description = description;
  await project.save();
  res.json(project);
};

// DELETE /api/projects/:id (admin)
exports.deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ message: "Project deleted" });
};

// POST /api/projects/:id/members (admin)
exports.addMember = async (req, res) => {
  const { userId, email } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });

  let user;
  if (userId) user = await User.findById(userId);
  else if (email) user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (!project.members.some((m) => m.equals(user._id))) {
    project.members.push(user._id);
    await project.save();
  }
  const populated = await project.populate("members", "name email role");
  res.json(populated);
};

// DELETE /api/projects/:id/members/:userId (admin)
exports.removeMember = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  project.members = project.members.filter((m) => !m.equals(req.params.userId));
  await project.save();
  res.json(project);
};

