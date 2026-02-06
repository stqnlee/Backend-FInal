const express = require("express");
const router = express.Router();

const Note = require("../models/Note");
const noteController = require("../controllers/noteController");
const { requireAuth, allowOwnerOrAdmin } = require("../middleware/auth");

router.use(requireAuth);

router.get("/", noteController.getNotes);
router.post("/", noteController.createNote);

// owner/admin guard for single-note operations
router.get("/:id", allowOwnerOrAdmin(Note, "owner"), noteController.getNoteById);
router.put("/:id", allowOwnerOrAdmin(Note, "owner"), noteController.updateNote);
router.delete("/:id", allowOwnerOrAdmin(Note, "owner"), noteController.deleteNote);

module.exports = router;
