const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: payload.id, role: payload.role };

    next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

function requireAdmin(req, res, next) {
  const role = String(req.user?.role || "").toLowerCase();
  if (role === "admin") return next();
  return res.status(403).json({ message: "Forbidden (admin only)" });
}

function allowOwnerOrAdmin(Model, ownerField = "owner") {
  return async (req, res, next) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ message: "Not found" });

      const role = String(req.user?.role || "").toLowerCase();
      const isAdmin = role === "admin";
      const isOwner = String(doc[ownerField]) === String(req.user.id);

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.doc = doc;
      next();
    } catch (e) {
      next(e);
    }
  };
}

module.exports = {
  requireAuth,
  requireAdmin,
  allowOwnerOrAdmin,
};