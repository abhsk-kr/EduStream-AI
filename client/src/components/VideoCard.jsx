import { Link } from 'react-router-dom';
import { FiPlayCircle, FiCheckCircle, FiClock, FiAlertCircle, FiTrash2, FiX } from 'react-icons/fi';

// eslint-disable-next-line react/prop-types
const VideoCard = ({ video, onDelete }) => {
  // eslint-disable-next-line react/prop-types
  const { _id, title, thumbnail, channelName, duration, status, createdAt } = video;

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 dark:bg-green-500/10 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/20 transition-colors">
            <FiCheckCircle className="w-3.5 h-3.5" /> Ready
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-500/20 transition-colors">
            <div className="w-3 h-3 border-2 border-blue-600 dark:border-blue-500 border-t-transparent dark:border-t-transparent rounded-full animate-spin"></div>
            Processing
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-500/10 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/10 dark:ring-red-500/20 transition-colors">
            <FiAlertCircle className="w-3.5 h-3.5" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-500/10 dark:ring-gray-700 transition-colors">
            <FiClock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
      <div className="relative aspect-video flex-shrink-0 bg-gray-100 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-900 transition-colors">
            <FiPlayCircle className="w-12 h-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {duration && (
          <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {duration}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate mr-2 transition-colors">
            {channelName || 'YouTube Video'}
          </p>
          {getStatusBadge()}
        </div>
        <div className="flex-1">
          <h3 className="line-clamp-2 text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 transition-colors">
            Added {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
        
        {status === 'completed' ? (
          <div className="mt-4 flex items-center gap-3">
            <Link
              to={`/lecture/${_id}`}
              className="flex-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 px-3 py-2 text-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
            >
              View Notes
            </Link>
            <Link
              to={`/lecture/${_id}/quiz`}
              className="flex-[0.5] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Quiz
            </Link>
            <button
              onClick={() => onDelete(_id)}
              className="flex-shrink-0 p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-500/20"
              title="Delete Module"
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="mt-4 flex gap-2">
            <button
              disabled
              className="flex-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-sm font-semibold text-gray-400 dark:text-gray-500 cursor-not-allowed transition-colors"
            >
              {status === 'processing' ? 'Generating Module...' : 'Waiting...'}
            </button>
            <button
              onClick={() => onDelete(_id)}
              className="flex-shrink-0 p-2 px-3 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-red-100 dark:border-red-500/20 font-medium text-sm flex items-center gap-1"
              title="Cancel Processing"
            >
              <FiX className="w-4 h-4" /> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
