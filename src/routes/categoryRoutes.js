const router = require("express").Router();
const ctrl = require("../controllers/categoryController");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

router.get("/", ctrl.getCategories);
router.post("/", ctrl.createCategory);
router.put("/:id", ctrl.updateCategory);
router.delete("/:id", ctrl.deleteCategory);

module.exports = router;