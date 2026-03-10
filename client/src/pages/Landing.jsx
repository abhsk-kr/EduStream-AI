import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiVideo, FiFileText, FiCheckSquare, FiArrowRight } from 'react-icons/fi';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white dark:bg-gray-950 transition-colors duration-200">
      {/* Hero Section */}
      <div className="relative isolate pt-14">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        <div className="py-24 sm:py-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                Transform any video into an interactive learning module
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                EduStream AI uses advanced LLMs to extract transcripts, generate summaries, slice videos into structured notes, and create challenging quizzes in seconds.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  to={user ? "/dashboard" : "/register"}
                  className="rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all flex items-center gap-2"
                >
                  {user ? "Go to Dashboard" : "Get Started for Free"}
                  <FiArrowRight />
                </Link>
                <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-1 group">
                  Log in <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">Study Smarter</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to learn effortlessly
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 p-2 text-indigo-600 dark:text-indigo-400">
                    <FiVideo className="h-6 w-6" aria-hidden="true" />
                  </div>
                  Automated Summaries
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Paste any YouTube URL and we instantly extract the transcript to generate a high-level Big Picture overview.</p>
                </dd>
              </div>

              <div className="flex flex-col bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="rounded-lg bg-purple-600/10 dark:bg-purple-500/20 p-2 text-purple-600 dark:text-purple-400">
                    <FiFileText className="h-6 w-6" aria-hidden="true" />
                  </div>
                  Structured Chapter Notes
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Our AI breaks the video down into logical chapters with precise timestamps and detailed explanations for easy studying.</p>
                </dd>
              </div>

              <div className="flex flex-col bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="rounded-lg bg-pink-600/10 dark:bg-pink-500/20 p-2 text-pink-600 dark:text-pink-400">
                    <FiCheckSquare className="h-6 w-6" aria-hidden="true" />
                  </div>
                  Adaptive Quizzes
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">Test your knowledge immediately with AI-generated multiple choice questions. Pass with 60% to mark the module complete.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
