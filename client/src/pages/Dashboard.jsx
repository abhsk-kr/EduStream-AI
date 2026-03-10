import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import VideoCard from '../components/VideoCard';
import { FiVideo, FiCheckCircle, FiBookOpen, FiAward, FiTrash2 } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, videosRes] = await Promise.all([
          axios.get(`${API_URL}/api/dashboard/stats`),
          axios.get(`${API_URL}/api/videos`)
        ]);
        
        setStats(statsRes.data);
        setVideos(videosRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh interval for processing videos
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this module? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`${API_URL}/api/videos/${videoId}`);
      setVideos(videos.filter(v => v._id !== videoId));
      
      // Update stats manually or re-fetch
      const statsRes = await axios.get(`${API_URL}/api/dashboard/stats`);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to delete video:', err);
      alert('Failed to delete module.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400 transition-colors">Track your learning progress and manage your modules.</p>
        </div>
        <Link
          to="/submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <FiVideo className="w-4 h-4" />
          New Module
        </Link>
      </div>

      {/* Stats Board */}
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 px-4 pb-12 pt-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors sm:px-6 sm:pt-6">
          <dt>
            <div className="absolute rounded-xl bg-indigo-50 dark:bg-indigo-500/20 p-3 transition-colors">
              <FiBookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Total Modules</p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors">{stats?.totalLectures || 0}</p>
          </dd>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 px-4 pb-12 pt-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors sm:px-6 sm:pt-6">
          <dt>
            <div className="absolute rounded-xl bg-green-50 dark:bg-green-500/20 p-3 transition-colors">
              <FiCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Completed</p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors">{stats?.completedLectures || 0}</p>
          </dd>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 px-4 pb-12 pt-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors sm:px-6 sm:pt-6">
          <dt>
            <div className="absolute rounded-xl bg-amber-50 dark:bg-amber-500/20 p-3 transition-colors">
              <FiAward className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Quizzes Taken</p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors">{stats?.quizzesTaken || 0}</p>
          </dd>
        </div>
        
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 px-4 pb-12 pt-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors sm:px-6 sm:pt-6">
          <dt>
            <div className="absolute rounded-xl bg-purple-50 dark:bg-purple-500/20 p-3 transition-colors">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
              </svg>
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">Avg Quiz Score</p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors">{stats?.averageScore || 0}%</p>
          </dd>
        </div>
      </dl>

      {/* Videos Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 transition-colors">
          Your Learning Modules
        </h2>
        
        {videos.length === 0 ? (
          <div className="text-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 transition-colors">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 transition-colors">
              <FiVideo className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white transition-colors">No modules yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors">Get started by turning a YouTube video into a module.</p>
            <div className="mt-6">
              <Link
                to="/submit"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Create Module
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
