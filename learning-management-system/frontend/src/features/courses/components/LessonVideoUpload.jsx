import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, FileVideo, RefreshCw, Trash2, UploadCloud, Video } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import { deleteLessonVideo, uploadLessonVideo } from '../courses.api';

const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const mediaUrl = (url) => url ? new URL(url, apiClient.defaults.baseURL).toString() : '';

const LessonVideoUpload = ({ courseId, lesson, onUploaded }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [deleting, setDeleting] = useState(false);
  const video = lesson.video?.url || lesson.videoUrl;

  const selectFile = async (file) => {
    if (!file) return;
    if (!VIDEO_TYPES.includes(file.type)) { setStatus('error'); setMessage('Choose an MP4, WebM, or QuickTime video.'); return; }
    if (file.size > MAX_VIDEO_SIZE) { setStatus('error'); setMessage('Video must be smaller than 500 MB.'); return; }
    setStatus('uploading'); setProgress(0); setMessage('Uploading video…');
    try {
      const response = await uploadLessonVideo(courseId, lesson._id, file, (event) => {
        if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
      });
      setStatus('success'); setProgress(100); setMessage('Video uploaded successfully.'); onUploaded(response.data.data.lesson);
    } catch (error) {
      setStatus('error'); setMessage(error.response?.status === 413 ? 'Video is too large. The maximum size is 500 MB.' : error.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  const onDrop = (event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files?.[0]); };
  const removeVideo = async () => {
    if (!window.confirm('Delete this uploaded video?')) return;
    setDeleting(true); setStatus('uploading'); setMessage('Deleting video…');
    try {
      const response = await deleteLessonVideo(courseId, lesson._id);
      onUploaded(response.data.data.lesson); setStatus('success'); setMessage('Video deleted successfully.');
    } catch (error) { setStatus('error'); setMessage(error.response?.data?.message || 'Unable to delete video.'); }
    finally { setDeleting(false); }
  };
  return <div className="lesson-video-panel">
    {video ? <div className="video-uploaded"><div className="video-uploaded-heading"><span><CheckCircle2 size={17} /> Video uploaded</span><div><button type="button" onClick={() => inputRef.current?.click()} disabled={deleting}><RefreshCw size={14} /> Replace Video</button><button type="button" onClick={removeVideo} disabled={deleting}><Trash2 size={14} /> Delete Video</button></div></div><p><FileVideo size={15} /> {lesson.video?.originalFileName || 'Lesson video'}</p><video controls preload="metadata" src={mediaUrl(video)}>Your browser does not support video playback.</video></div> : <div className={`video-dropzone ${dragging ? 'dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()} role="button" tabIndex="0" onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click(); }}><span className="video-upload-icon"><UploadCloud size={24} /></span><strong>Upload lesson video</strong><span>Drag and drop here or browse files</span><small>MP4, WebM, or QuickTime · Maximum 500 MB</small></div>}
    <input ref={inputRef} className="visually-hidden" type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => { selectFile(event.target.files?.[0]); event.target.value = ''; }} />
    {status === 'uploading' && <div className="upload-progress" role="status"><div><span>Uploading video…</span><strong>{progress}%</strong></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div>}
    {status === 'success' && <p className="upload-message success"><CheckCircle2 size={15} /> {message}</p>}
    {status === 'error' && <p className="upload-message error"><AlertCircle size={15} /> {message}</p>}
    {!video && status === 'idle' && <p className="video-empty-label"><Video size={14} /> No video uploaded</p>}
  </div>;
};

export default LessonVideoUpload;
