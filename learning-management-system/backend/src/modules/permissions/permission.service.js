const User = require("../users/user.model");

const COURSE_PERMISSIONS = ["manage_courses", "create_course", "edit_course", "delete_course", "publish_course", "manage_lessons", "upload_content"];
const DEFAULT_PERMISSIONS_BY_ROLE = { teacher: COURSE_PERMISSIONS, coachingClassAdmin: COURSE_PERMISSIONS, superAdmin: COURSE_PERMISSIONS, student: [] };

const getEffectivePermissions = async (user = {}) => {
  if (Array.isArray(user.permissions) && user.permissions.length) return user.permissions;
  if (user.id) {
    const stored = await User.findById(user.id).select("permissions userType").lean();
    if (stored?.permissions?.length) return stored.permissions;
  }
  return DEFAULT_PERMISSIONS_BY_ROLE[user.userType] || [];
};
const hasAnyPermission = async (user, required = []) => (await getEffectivePermissions(user)).some((permission) => required.includes(permission));

module.exports = { COURSE_PERMISSIONS, DEFAULT_PERMISSIONS_BY_ROLE, getEffectivePermissions, hasAnyPermission };
