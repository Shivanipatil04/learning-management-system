const express = require("express");
const auth = require("../auth/auth.middleware");
const controller = require("./enrollment.controller");

const router = express.Router();
router.use(auth);

router.post("/:courseId", controller.enroll);
router.get("/course/:courseId/progress", controller.progress);
router.patch("/course/:courseId/lessons/:lessonId/progress", controller.updateProgress);
router.get("/course/:courseId", controller.getCourse);
router.get("/", controller.list);
router.get("/:id", controller.get);

module.exports = router;
