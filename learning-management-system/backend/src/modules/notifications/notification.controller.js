const Notification = require("./notification.model");

exports.getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .populate("contractId", "contractId startDate endDate");
    
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

exports.markAsIgnored = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: userId },
      { isIgnored: true, isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    await Notification.updateMany({ recipientId: userId }, { isRead: true });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
