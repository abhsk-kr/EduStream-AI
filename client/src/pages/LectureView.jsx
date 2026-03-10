import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiClock, FiFileText, FiAward, FiPlayCircle } from 'react-icons/fi';
import { API_URL } from '../config';

const LectureView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        const [videoRes, summaryRes] = await Promise.all([
          axios.get(`${API_URL}/api/videos/${id}`),
          axios.get(`${API_URL}/api/summaries/${id}`)
        ]);
        
        setVideo(videoRes.data);
        setSummary(summaryRes.data);
      } catch (err) {
        setError('Failed to load lecture materials. It might still be processing.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLecture();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !video || !summary) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors">Lecture not ready</h3>
        <p className="mt-1 text-gray-500 dark:text-gray-400 transition-colors">{error || "We couldn't find this module."}</p>
        <div className="mt-6">
          <button onClick={() => navigate('/dashboard')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
            &larr; Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 mb-4 transition-colors">
          <FiArrowLeft className="mr-1" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">{video.title}</h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-6 transition-colors">
          <span className="flex items-center gap-1.5 font-medium">
            <FiPlayCircle /> {video.channelName || 'YouTube Video'}
          </span>
          {video.duration && (
            <span className="flex items-center gap-1.5">
              <FiClock /> {video.duration}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Big Picture Summary */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors">
              <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 p-1.5 rounded-lg transition-colors"><FiFileText /></span>
              The Big Picture
            </h2>
            <div className="prose prose-indigo max-w-none text-gray-600 dark:text-gray-300 transition-colors">
              {summary.highLevelSummary.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 text-lg leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </section>

          {/* Structured Chapter Notes */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">Chapter Notes</h2>
            <div className="space-y-6">
              {summary.structuredNotes.map((note, idx) => (
                <div key={idx} className="relative pl-8 pb-6 border-l-2 border-indigo-100 dark:border-indigo-500/30 last:border-0 last:pb-0 transition-colors">
                  <span className="absolute -left-[9px] top-1 bg-white dark:bg-gray-900 border-2 border-indigo-500 dark:border-indigo-400 w-4 h-4 rounded-full transition-colors"></span>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-xs px-2 py-1 rounded-md font-semibold transition-colors">
                      {note.timestamp}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">{note.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base transition-colors">{note.content}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Quiz CTA */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-md text-center">
            <div className="mx-auto bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
              <FiAward className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Ready to test yourself?</h3>
            <p className="text-indigo-100 text-sm mb-6">Take the AI-generated quiz to verify your understanding of this module.</p>
            <Link
              to={`/lecture/${video._id}/quiz`}
              className="block w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-4 rounded-xl transition-colors shadow-sm"
            >
              Start Quiz
            </Link>
          </div>

          {/* Key Takeaways */}
          <div className="bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-6 border border-amber-100/50 dark:border-amber-500/20 transition-colors">
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-500 mb-4 transition-colors">Key Takeaways</h3>
            <ul className="space-y-3">
              {summary.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-amber-800 dark:text-amber-200 text-sm transition-colors">
                  <span className="bg-amber-200 dark:bg-amber-500/30 text-amber-800 dark:text-amber-400 font-bold w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 transition-colors">
                    {idx + 1}
                  </span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Video Metadata */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider text-xs transition-colors">Source Video</h3>
            {video.thumbnail && (
              <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="block relative rounded-xl overflow-hidden group">
                <img src={video.thumbnail} alt="Thumbnail" className="w-full aspect-video object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiPlayCircle className="text-white w-10 h-10" />
                </div>
              </a>
            )}
            <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium truncate transition-colors">
              Watch original on YouTube &rarr;
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LectureView;
