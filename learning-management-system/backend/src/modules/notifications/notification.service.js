const Notification = require("./notification.model");

const createNotification = async (payload) => {
  if (!payload?.recipientId || !payload?.type || !payload?.eventKey) return null;
  return Notification.findOneAndUpdate(
    { eventKey: payload.eventKey },
    { $setOnInsert: payload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
};

module.exports = { createNotification };
