const Note = require("../models/Note");
const Category = require("../models/Category");

function isAdmin(req) {
  return String(req.user?.role || "").toLowerCase() === "admin";
}

function buildNoteFilter(req) {
  return isAdmin(req) ? {} : { owner: req.user.id };
}

exports.getNotes = async (req, res, next) => {
  try {
    const filter = buildNoteFilter(req);

    if (req.query.category) filter.category = req.query.category;

    if (req.query.q) {
      filter.$text = { $search: req.query.q };
    }

    const notes = await Note.find(filter)
      .populate("category", "name")
      .sort(req.query.q ? { score: { $meta: "textScore" } } : { createdAt: -1 });

    res.json(notes);
  } catch (err) {
    next(err);
  }
};

exports.getNoteById = async (req, res, next) => {
  try {
    const filter = isAdmin(req)
      ? { _id: req.params.id }
      : { _id: req.params.id, owner: req.user.id };

    const note = await Note.findOne(filter).populate("category", "name");
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (err) {
    next(err);
  }
};

exports.createNote = async (req, res, next) => {
  try {
    const title = (req.body.title || "").trim();
    const content = (req.body.content || "").trim();
    const categoryId = req.body.category;

    if (!title || !content || !categoryId) {
      return res.status(400).json({ message: "title, content, category are required" });
    }

    const catFilter = isAdmin(req)
      ? { _id: categoryId }
      : { _id: categoryId, owner: req.user.id };

    const category = await Category.findOne(catFilter);
    if (!category) return res.status(400).json({ message: "Invalid category" });

    const note = await Note.create({
      title,
      content,
      category: categoryId,
      owner: req.user.id,
    });

    const populated = await Note.findById(note._id).populate("category", "name");
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

exports.updateNote = async (req, res, next) => {
  try {
    const patch = {};
    if (typeof req.body.title === "string") patch.title = req.body.title.trim();
    if (typeof req.body.content === "string") patch.content = req.body.content.trim();
    if (req.body.category) patch.category = req.body.category;

    const noteFilter = isAdmin(req)
      ? { _id: req.params.id }
      : { _id: req.params.id, owner: req.user.id };

    if (patch.category) {
      const catFilter = isAdmin(req)
        ? { _id: patch.category }
        : { _id: patch.category, owner: req.user.id };

      const category = await Category.findOne(catFilter);
      if (!category) return res.status(400).json({ message: "Invalid category" });
    }

    const updated = await Note.findOneAndUpdate(noteFilter, patch, {
      new: true,
      runValidators: true,
    }).populate("category", "name");

    if (!updated) return res.status(404).json({ message: "Note not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const filter = isAdmin(req)
      ? { _id: req.params.id }
      : { _id: req.params.id, owner: req.user.id };

    const deleted = await Note.findOneAndDelete(filter);
    if (!deleted) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted" });
  } catch (err) {
    next(err);
  }
};
