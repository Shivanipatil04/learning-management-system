const express = require("express");
const router = express.Router();
const notificationController = require("./notification.controller");
const protect = require("../auth/auth.middleware");

router.use(protect);

router.get("/", notificationController.getMyNotifications);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);
router.patch("/:id/ignore", notificationController.markAsIgnored);

module.exports = router;
