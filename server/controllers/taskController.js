const Task = require("../models/Task");
const Project = require("../models/Project");

const canAccessProject = (project, user) =>
  user.role === "admin" ||
  project.createdBy.equals(user._id) ||
  project.members.some((m) => m.equals(user._id));

// POST /api/tasks (admin)
exports.createTask = async (req, res) => {
  const { title, description, project, assignedTo, status, dueDate } = req.body;
  const proj = await Project.findById(project);
  if (!proj) return res.status(404).json({ message: "Project not found" });

  const task = await Task.create({
    title,
    description,
    project,
    assignedTo: assignedTo || null,
    status: status || "Todo",
    dueDate: dueDate || null,
    createdBy: req.user._id,
  });
  res.status(201).json(task);
};

// GET /api/tasks?project=&status=&assignedTo=&sort=
exports.getTasks = async (req, res) => {
  const { project, status, assignedTo, sort } = req.query;
  const query = {};
  if (project) query.project = project;
  if (status) query.status = status;
  if (assignedTo) query.assignedTo = assignedTo;

  // Members can only see tasks in projects they belong to
  if (req.user.role !== "admin") {
    const projects = await Project.find({
      $or: [{ members: req.user._id }, { createdBy: req.user._id }],
    }).select("_id");
    const ids = projects.map((p) => p._id);
    query.project = project
      ? { $in: ids.filter((id) => id.equals(project)) }
      : { $in: ids };
  }

  let q = Task.find(query)
    .populate("assignedTo", "name email")
    .populate("project", "title")
    .populate("createdBy", "name email");
  q = sort === "dueDate" ? q.sort({ dueDate: 1 }) : q.sort({ createdAt: -1 });
  const tasks = await q.exec();
  res.json(tasks);
};

// GET /api/tasks/:id
exports.getTask = async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("assignedTo", "name email")
    .populate("project")
    .populate("createdBy", "name email");
  if (!task) return res.status(404).json({ message: "Task not found" });
  if (!canAccessProject(task.project, req.user))
    return res.status(403).json({ message: "Access denied" });
  res.json(task);
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id).populate("project");
  if (!task) return res.status(404).json({ message: "Task not found" });
  if (!canAccessProject(task.project, req.user))
    return res.status(403).json({ message: "Access denied" });

  const isAdmin = req.user.role === "admin";
  const isAssignee = task.assignedTo && task.assignedTo.equals(req.user._id);

  // Members may only update status of their own task
  if (!isAdmin) {
    if (!isAssignee) return res.status(403).json({ message: "Not allowed" });
    if (req.body.status) task.status = req.body.status;
  } else {
    const { title, description, assignedTo, status, dueDate } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
  }
  await task.save();
  res.json(task);
};

// DELETE /api/tasks/:id (admin)
exports.deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  await task.deleteOne();
  res.json({ message: "Task deleted" });
};
