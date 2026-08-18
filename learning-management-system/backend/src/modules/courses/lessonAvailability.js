const videoReadyFilter = {
  $or: [
    { videoUrl: { $exists: true, $nin: ["", null] } },
    { "video.url": { $exists: true, $nin: ["", null] } },
    { "video.storageKey": { $exists: true, $nin: ["", null] } },
  ],
};

const isVideoReady = (lesson) => Boolean(lesson?.videoUrl || lesson?.video?.url || lesson?.video?.storageKey);

module.exports = { videoReadyFilter, isVideoReady };
