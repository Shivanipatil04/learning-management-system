const CoachingClassProfile = require("../coachingClass/coachingClassProfile.model");
const { hasAnyPermission } = require("../permissions/permission.service");

const tenantForAdmin = async (user) => {
  const profile = await CoachingClassProfile.findOne({ userId: user.id }).select("_id").lean();
  return profile?._id || null;
};

const resolveManagementContext = async (user, action) => {
  if (!user?.id) return { allowed: false, statusCode: 401, message: "Authentication required" };
  const actionPermissions = {
    create: ["manage_courses", "create_course"], edit: ["manage_courses", "edit_course"],
    delete: ["manage_courses", "delete_course"], publish: ["manage_courses", "publish_course"],
    lesson: ["manage_courses", "manage_lessons", "upload_content"],
  }[action] || ["manage_courses"];

  if (["coachingClassAdmin", "superAdmin"].includes(user.userType)) {
    const tenantId = await tenantForAdmin(user);
    if (!tenantId) return { allowed: false, statusCode: 403, message: "Coaching Class tenant not found" };
    return { allowed: true, tenantId, isAdmin: true };
  }
  if (user.userType !== "teacher" || !(await hasAnyPermission(user, actionPermissions))) return { allowed: false, statusCode: 403, message: "Insufficient permission" };
  // Active contract validation is centralized in activeContractGuard and runs
  // before protected Course operations reach this ownership check.
  return { allowed: true, tenantId: user.coachingClassId || null, isAdmin: false };
};

const assertCourseAccess = async (user, course, action) => {
  const context = await resolveManagementContext(user, action);
  if (!context.allowed) { const error = new Error(context.message); error.statusCode = context.statusCode; throw error; }
  if (context.tenantId && course.coachingClassId && String(course.coachingClassId) !== String(context.tenantId)) {
    const error = new Error("You are not authorized for this Coaching Class"); error.statusCode = 403; throw error;
  }
  if (!context.isAdmin && (!course.teacherId || String(course.teacherId) !== String(user.id))) {
    const error = new Error("Teachers may only manage their own courses"); error.statusCode = 403; throw error;
  }
  return context;
};

module.exports = { resolveManagementContext, assertCourseAccess };
