require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");
const errorHandler = require("./src/middleware/errorHandler");

const authRoutes = require("./src/routes/authRoutes");
const noteRoutes = require("./src/routes/noteRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// API routes (лучше держать ДО static, но можно и так; главное — порядок ниже)
app.use("/auth", authRoutes);
app.use("/notes", noteRoutes);
app.use("/categories", categoryRoutes);

// Static frontend
app.use(express.static(path.join(__dirname, "public")));

// SPA fallback (Express 5-safe). Keep API 404s intact.
app.use((req, res, next) => {
  const p = req.path || "";
  if (p.startsWith("/auth") || p.startsWith("/notes") || p.startsWith("/categories")) return next();
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API 404
app.use((req, res) => res.status(404).json({ message: `Not Found: ${req.originalUrl}` }));
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();