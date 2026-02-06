const Category = require("../models/Category");

function isAdmin(req) {
  return String(req.user?.role || "").toLowerCase() === "admin";
}

function buildCategoryFilter(req) {
  return isAdmin(req) ? {} : { owner: req.user.id };
}

exports.getCategories = async (req, res, next) => {
  try {
    const filter = buildCategoryFilter(req);
    const categories = await Category.find(filter).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const name = (req.body.name || "").trim();
    if (!name) return res.status(400).json({ message: "Category name is required" });

    const category = await Category.create({ name, owner: req.user.id });
    res.status(201).json(category);
  } catch (err) {
    if (String(err).includes("E11000")) {
      return res.status(409).json({ message: "Category already exists" });
    }
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const name = (req.body.name || "").trim();
    if (!name) return res.status(400).json({ message: "Category name is required" });

    const filter = isAdmin(req)
      ? { _id: req.params.id }
      : { _id: req.params.id, owner: req.user.id };

    const updated = await Category.findOneAndUpdate(
      filter,
      { name },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Category not found" });
    res.json(updated);
  } catch (err) {
    if (String(err).includes("E11000")) {
      return res.status(409).json({ message: "Category already exists" });
    }
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const filter = isAdmin(req)
      ? { _id: req.params.id }
      : { _id: req.params.id, owner: req.user.id };

    const deleted = await Category.findOneAndDelete(filter);
    if (!deleted) return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category deleted" });
  } catch (err) {
    next(err);
  }
};
