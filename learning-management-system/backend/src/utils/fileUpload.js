const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const videoDirectory = path.resolve(__dirname, "../../uploads/videos");
fs.mkdirSync(videoDirectory, { recursive: true });
const allowedVideoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const maxVideoSize = 500 * 1024 * 1024;
const extensionByMime = { "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov" };

const uploadError = (message, statusCode = 400) => { const error = new Error(message); error.statusCode = statusCode; return error; };
const writeChunk = (stream, chunk) => new Promise((resolve, reject) => {
  if (!chunk.length || stream.write(chunk)) return resolve();
  stream.once("drain", resolve); stream.once("error", reject);
});

// The current project has no multipart dependency. This intentionally supports
// one `video` part, which is all the lesson-video endpoint accepts, and streams
// bytes to disk instead of buffering the upload in memory.
const videoUpload = {
  single: (fieldName) => (req, res, next) => {
    const contentType = req.headers["content-type"] || "";
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!boundaryMatch) return next(uploadError("Multipart video upload is required"));
    const boundary = boundaryMatch[1] || boundaryMatch[2];
    const marker = Buffer.from(`\r\n--${boundary}`);
    let headerBuffer = Buffer.alloc(0); let bodyBuffer = Buffer.alloc(0); let headersParsed = false; let finished = false; let file; let stream; let fileSize = 0; let chain = Promise.resolve(); let failed = false;

    const fail = async (error) => {
      if (failed) return; failed = true; req.removeAllListeners("data"); req.removeAllListeners("end");
      if (stream) stream.destroy();
      if (file?.filename) await removeStoredFile(`videos/${file.filename}`);
      return next(error);
    };
    const consumeBody = async (chunk) => {
      if (finished || failed) return;
      bodyBuffer = Buffer.concat([bodyBuffer, chunk]);
      const markerIndex = bodyBuffer.indexOf(marker);
      if (markerIndex >= 0) {
        if (fileSize + markerIndex > maxVideoSize) throw uploadError("Video is too large. The maximum size is 500 MB.", 413);
        await writeChunk(stream, bodyBuffer.subarray(0, markerIndex));
        fileSize += markerIndex; finished = true;
        await new Promise((resolve, reject) => { stream.once("finish", resolve); stream.once("error", reject); stream.end(); });
        file.size = fileSize; req.file = file; return;
      }
      const safeLength = Math.max(0, bodyBuffer.length - marker.length);
      if (safeLength) { const safeChunk = bodyBuffer.subarray(0, safeLength); await writeChunk(stream, safeChunk); fileSize += safeChunk.length; bodyBuffer = bodyBuffer.subarray(safeLength); }
      if (fileSize + bodyBuffer.length > maxVideoSize) throw uploadError("Video is too large. The maximum size is 500 MB.", 413);
    };
    const parseHeaders = async () => {
      const headerEnd = headerBuffer.indexOf(Buffer.from("\r\n\r\n"));
      if (headerEnd < 0) { if (headerBuffer.length > 64 * 1024) throw uploadError("Invalid multipart upload"); return; }
      const headerText = headerBuffer.subarray(0, headerEnd).toString("utf8");
      const disposition = headerText.match(/content-disposition:\s*form-data;[^\r\n]*name="([^"]+)"[^\r\n]*filename="([^"]*)"/i);
      const mimeMatch = headerText.match(/content-type:\s*([^\r\n]+)/i);
      if (!disposition || disposition[1] !== fieldName) throw uploadError("A video file is required");
      const mimetype = (mimeMatch?.[1] || "").trim().toLowerCase();
      if (!allowedVideoTypes.has(mimetype)) throw uploadError("Unsupported video type. Use MP4, WebM, or QuickTime video.");
      const filename = `${crypto.randomUUID()}${extensionByMime[mimetype]}`;
      file = { filename, originalname: disposition[2], mimetype, path: path.join(videoDirectory, filename), size: 0 };
      stream = fs.createWriteStream(file.path); stream.on("error", (error) => fail(error));
      headersParsed = true; const rest = headerBuffer.subarray(headerEnd + 4); headerBuffer = Buffer.alloc(0); await consumeBody(rest);
    };
    req.on("data", (chunk) => { chain = chain.then(async () => { if (failed) return; if (!headersParsed) { headerBuffer = Buffer.concat([headerBuffer, chunk]); await parseHeaders(); } else await consumeBody(chunk); }).catch(fail); });
    req.on("end", () => { chain.then(() => { if (!failed && (!headersParsed || !finished)) fail(uploadError("Incomplete video upload")); else if (!failed) next(); }); });
    req.on("error", (error) => fail(error));
  },
};

const removeStoredFile = async (storageKey) => {
  if (!storageKey) return;
  const safePath = path.resolve(videoDirectory, storageKey.replace(/^videos[\\/]/, ""));
  if (!safePath.startsWith(`${videoDirectory}${path.sep}`)) return;
  try { await fs.promises.unlink(safePath); } catch (error) { if (error.code !== "ENOENT") throw error; }
};

module.exports = { videoUpload, removeStoredFile, maxVideoSize, allowedVideoTypes };
