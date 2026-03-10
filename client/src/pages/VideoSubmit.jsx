import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiYoutube, FiArrowRight, FiCheckCircle, FiUploadCloud } from 'react-icons/fi';
import { API_URL } from '../config';

const VideoSubmit = () => {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/api/videos`, { youtubeUrl: url });
      // Redirect to dashboard immediately; the webhook/processing happens in background
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.videoId) {
        // Video already processed
        navigate(`/lecture/${err.response.data.videoId}`);
      } else {
        setError(err.response?.data?.message || 'Failed to submit video. Please try again.');
        setLoading(false);
      }
    }
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('mediaFile', file);

    try {
      await axios.post(`${API_URL}/api/videos/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload file. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Create New Module
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 mb-8">
          Paste a YouTube URL or upload a local video/audio file. Our AI will handle the rest.
        </p>

        <div className="bg-white dark:bg-gray-900 py-8 px-8 shadow-sm sm:rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 transition-colors">
            <button
              onClick={() => setUploadMode('url')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 text-center transition-colors ${
                uploadMode === 'url' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              YouTube Link
            </button>
            <button
              onClick={() => setUploadMode('file')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 text-center transition-colors ${
                uploadMode === 'file' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Upload File
            </button>
          </div>

          <form onSubmit={uploadMode === 'url' ? handleUrlSubmit : handleFileSubmit} className="mb-8">
            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {uploadMode === 'url' ? (
              <>
                <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2">
                  YouTube Video URL
                </label>
                <div className="relative mt-2 flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-500">
                    <FiYoutube className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="block w-full rounded-xl border-0 py-3 pl-10 pr-14 text-gray-900 dark:text-white dark:bg-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={loading || !url}
                    className="absolute inset-y-1 right-1 flex items-center justify-center rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiArrowRight className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2">
                  Upload Media File (Audio/Video up to 90 mins)
                </label>
                <div 
                  className={`mt-2 flex justify-center rounded-xl border border-dashed px-6 py-10 transition-colors ${file ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'}`}
                  onClick={() => !loading && fileInputRef.current?.click()}
                  style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  <div className="text-center">
                    <FiUploadCloud className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400 justify-center">
                      <span className="relative cursor-pointer rounded-md font-semibold text-indigo-600 dark:text-indigo-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                        {file ? 'Selected File' : 'Click to select a file'}
                        <input
                          type="file"
                          className="sr-only"
                          ref={fileInputRef}
                          accept="video/*,audio/*"
                          onChange={(e) => setFile(e.target.files[0])}
                          disabled={loading}
                        />
                      </span>
                    </div>
                    <p className="text-xs leading-5 text-gray-500">
                      {file ? file.name : "MP4, MP3, WAV up to 2GB"}
                    </p>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="mt-6 flex w-full justify-center rounded-xl bg-indigo-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading and Analyzing...
                    </span>
                  ) : (
                    "Upload and Generate Module"
                  )}
                </button>
              </>
            )}
            
            <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
              Works best with educational content, tutorials, and lectures between 60 - 90 mins.
            </p>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200 dark:border-gray-800 transition-colors" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-gray-900 px-3 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold transition-colors">What happens next?</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-start gap-3 flex-row">
              <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white block">Transcript Extraction</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">We securely pull captions or run Whisper transcription.</span>
              </div>
            </div>
            <div className="flex items-start gap-3 flex-row">
              <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white block">LLM Summarization</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">GPT-4o analyzes the text to generate chapter-based notes.</span>
              </div>
            </div>
            <div className="flex items-start gap-3 flex-row">
              <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white block">Quiz Construction</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">A custom 5-question test is generated based on key concepts.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSubmit;
