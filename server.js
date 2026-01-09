const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Lưu tasks trong memory
let tasks = [
  { id: 1, title: "Học NodeJS", isCompleted: false },
  { id: 2, title: "Làm bài tập", isCompleted: true },
];

let currentId = 3;

// [GET]/api/tasks
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

// [GET] /api/tasks/:id
app.get("/api/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(task);
});

// [POST] /api/tasks
app.post("/api/tasks", (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const newTask = {
    id: currentId++,
    title: title,
    isCompleted: false,
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// [PUT] /api/tasks/:id
app.put("/api/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, isCompleted } = req.body;

  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  //   Cập nhật
  if (title !== undefined) tasks[taskIndex].title = title;
  if (isCompleted !== undefined) tasks[taskIndex].isCompleted = isCompleted;

  res.json(tasks[taskIndex]);
});

// [DELETE] /api/tasks/:id
app.delete("/api/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks.splice(taskIndex, 1);
  res.status(200).json({ message: "Task deleted successfully" });
});

app.get("/bypass-cors", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `External API returned ${response.status}`,
      });
    }

    // Lấy content-type từ response
    const contentType = response.headers.get("content-type");

    // Kiểm tra xem có phải JSON không
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      // Nếu không phải JSON, trả về text
      const text = await response.text();
      res.send(text);
    }
  } catch (error) {
    console.error("Bypass CORS error:", error.message);
    res.status(500).json({
      error: "Failed to fetch from external API",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
