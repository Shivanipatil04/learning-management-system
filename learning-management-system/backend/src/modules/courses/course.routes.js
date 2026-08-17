const express = require("express");
const auth = require("../auth/auth.middleware");
const permissionGuard = require("../permissions/permissionGuard.middleware");
const activeContractGuard = require("../../middlewares/activeContractGuard");
const controller = require("./course.controller");
const { videoUpload } = require("../../utils/fileUpload");

const router = express.Router();

router.use(auth);

router.post(
  "/",
  permissionGuard(["manage_courses", "create_course"]),
  activeContractGuard,
  controller.create
);

router.get("/", controller.list);

router.get(
  "/dashboard",
  permissionGuard(["manage_courses", "edit_course"]),
  controller.dashboard
);

router.get("/:id", controller.get);

router.patch(
  "/:id",
  permissionGuard(["manage_courses", "edit_course"]),
  activeContractGuard,
  controller.update
);

router.delete(
  "/:id",
  permissionGuard(["manage_courses", "delete_course"]),
  activeContractGuard,
  controller.remove
);

router.patch(
  "/:id/publish",
  permissionGuard(["manage_courses", "publish_course"]),
  activeContractGuard,
  controller.publish
);

router.post(
  "/:courseId/lessons",
  permissionGuard(["manage_courses", "manage_lessons", "upload_content"]),
  activeContractGuard,
  controller.addLesson
);

router.get("/:courseId/lessons", controller.lessons);

router.post(
  "/:courseId/lessons/:lessonId/video",
  permissionGuard(["manage_courses", "manage_lessons", "upload_content"]),
  activeContractGuard,
  videoUpload.single("video"),
  controller.uploadVideo
);

router.patch(
  "/:courseId/lessons/:lessonId",
  permissionGuard(["manage_courses", "manage_lessons", "upload_content"]),
  activeContractGuard,
  controller.editLesson
);

router.delete(
  "/:courseId/lessons/:lessonId",
  permissionGuard(["manage_courses", "manage_lessons", "upload_content"]),
  activeContractGuard,
  controller.removeLesson
);

module.exports = router;