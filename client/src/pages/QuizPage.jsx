import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiAward, FiAlertTriangle } from 'react-icons/fi';
import { API_URL } from '../config';

const QuizPage = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Interactive State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/quizzes/${id}`);
        setQuiz(data);
        // Initialize empty answers array matching question length if not completed
        if (!data.completed && !results) {
          setAnswers(new Array(data.questions.length).fill(null));
        }
      } catch (err) {
        setError('Failed to load quiz. It might still be generating.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, results]);

  const handleSelectOption = (optIdx) => {
    if (results || quiz?.completed) return; // Disallow changes after submission
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIdx] = optIdx;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    // Validate all answered
    if (answers.includes(null)) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/quizzes/${id}/submit`, {
        answers,
      });
      setResults(data);
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to submit quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <FiAlertTriangle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4 transition-colors" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors">Quiz not available</h3>
        <p className="mt-1 text-gray-500 dark:text-gray-400 transition-colors">{error}</p>
        <Link to={`/lecture/${id}`} className="mt-6 inline-block text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
          &larr; Back to Lecture
        </Link>
      </div>
    );
  }

  // Determine what to render based on completion status
  const isCompleted = quiz.completed || results;
  const currentQuestion = quiz.questions[currentQuestionIdx];
  const totalQuestions = quiz.questions.length;
  
  // Progress percentage
  const progress = isCompleted ? 100 : ((currentQuestionIdx + 1) / totalQuestions) * 100;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Link to={`/lecture/${id}`} className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors">
        <FiArrowLeft className="mr-1" /> Back to Notes
      </Link>

      {/* Progress Bar Header */}
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl border border-b-0 border-gray-100 dark:border-gray-800 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">Module Quiz</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">
            {isCompleted ? 'Results Overview' : `Question ${currentQuestionIdx + 1} of ${totalQuestions}`}
          </p>
        </div>
        {!isCompleted && (
          <div className="w-full sm:w-1/2">
            <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 transition-colors">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 transition-colors">
              <div className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}
      </div>

      {isCompleted ? (
        /* Results View */
        <div className="bg-white dark:bg-gray-900 rounded-b-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm transition-colors">
          <div className="text-center mb-10 pb-10 border-b border-gray-100 dark:border-gray-800 transition-colors">
            <div className="mx-auto w-24 h-24 bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-gray-900 shadow-sm transition-colors">
              <FiAward className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Quiz Completed!</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2 transition-colors">
              You scored <span className="font-bold text-indigo-600 dark:text-indigo-400">{results?.score || quiz.score}%</span> 
              {' '}({(results?.correctCount) || Math.round((quiz.score/100) * totalQuestions)}/{totalQuestions} correct)
            </p>
            {((results?.score || quiz.score) >= 60) ? (
              <p className="text-green-600 dark:text-green-400 font-medium mt-2 bg-green-50 dark:bg-green-500/10 inline-block px-4 py-1.5 rounded-full text-sm transition-colors">
                Module marked as complete! 🎉
              </p>
            ) : (
              <p className="text-amber-600 dark:text-amber-400 font-medium mt-2 bg-amber-50 dark:bg-amber-500/10 inline-block px-4 py-1.5 rounded-full text-sm transition-colors">
                Review the notes and try again to master this material.
              </p>
            )}
          </div>

          <div className="space-y-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">Review Answers</h3>
            {quiz.questions.map((q, idx) => {
              // If we just generated results, use results data, otherwise (historical load) use historical calculation
              // Note: the backend historical get doesn't return user answers currently, so we rely on the results directly after submission for detailed view, or just show correct answers.
              const isCorrect = results ? results.results[idx].isCorrect : null;
              const selectedAnswer = results ? results.results[idx].selectedAnswer : null;

              return (
                <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700 transition-colors">
                  <div className="flex gap-3 mb-4">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center transition-colors">
                      {idx + 1}
                    </span>
                    <h4 className="text-base font-medium text-gray-900 dark:text-white pt-1 transition-colors">{q.question}</h4>
                  </div>
                  
                  <div className="space-y-2 ml-11">
                    {q.options.map((opt, optIdx) => {
                      let optionClass = "p-3 rounded-lg border text-sm flex items-center justify-between transition-colors ";
                      
                      if (optIdx === q.correctAnswer) {
                        optionClass += "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-800 dark:text-green-300 font-medium";
                      } else if (results && selectedAnswer === optIdx && !isCorrect) {
                        optionClass += "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-300";
                      } else {
                        optionClass += "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400";
                      }

                      return (
                        <div key={optIdx} className={optionClass}>
                          <span>{opt}</span>
                          {optIdx === q.correctAnswer && <FiCheckCircle className="text-green-600 w-5 h-5 flex-shrink-0" />}
                          {results && selectedAnswer === optIdx && !isCorrect && <FiXCircle className="text-red-500 w-5 h-5 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="ml-11 mt-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg p-4 text-sm text-indigo-900 dark:text-indigo-200 transition-colors">
                    <span className="font-semibold block mb-1">Explanation:</span>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center pt-8 border-t border-gray-100 dark:border-gray-800 transition-colors">
            <Link to="/dashboard" className="inline-flex justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors">
              Return to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        /* Interactive Quiz View */
        <div className="bg-white dark:bg-gray-900 rounded-b-2xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-sm transition-colors">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight transition-colors">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="space-y-3 mb-10">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestionIdx] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border text-base transition-all ${
                    isSelected 
                      ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-600 dark:border-indigo-400 ring-1 ring-inset ring-indigo-600 dark:ring-indigo-400 text-indigo-900 dark:text-indigo-100 font-medium shadow-sm' 
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 flex-shrink-0 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-indigo-600 dark:border-indigo-400' : 'border-gray-300 dark:border-gray-600'}`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></div>}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800 transition-colors">
            <button
              onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {currentQuestionIdx === totalQuestions - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={answers.includes(null) || isSubmitting}
                className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Submitting...</>
                ) : 'Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
                className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 rounded-lg shadow-sm transition-colors"
              >
                Next &rarr;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
