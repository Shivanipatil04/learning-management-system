const { hasAnyPermission } = require("./permission.service");

const permissionGuard = (requiredPermissions = []) => async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
    if (!(await hasAnyPermission(req.user, requiredPermissions))) return res.status(403).json({ success: false, message: "Insufficient permission" });
    return next();
  } catch (error) { return next(error); }
};

module.exports = permissionGuard;
