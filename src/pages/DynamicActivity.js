import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
import { ACTIVITY_STATES, getActivityConfig } from '../utils/activityConfig';
import { apiService } from '../utils/api';
import universityIcon from '../assets/images/university.png';
import flashIcon from '../assets/images/Flashnumber.png';
import logoutIcon from '../assets/images/Logout.png';
import timingIcon from '../assets/images/timing.png';
import awardIcon from '../assets/images/award.png';
import teachingIcon from '../assets/images/teaching.png';

export default function DynamicActivity() {
  const navigate = useNavigate();
  const { activityId } = useParams();
  // const { user } = useAuth();

  // Debug log to verify component is loading
  console.log('DynamicActivity component loaded with activityId:', activityId);

  const [currentState, setCurrentState] = useState(ACTIVITY_STATES.READY);
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [activityConfig, setActivityConfig] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [assignedQuestions, setAssignedQuestions] = useState([]);
  // const [loading, setLoading] = useState(false);
  const [currentQuestionData, setCurrentQuestionData] = useState(null);

  // New flash game states
  const [isFlashMode, setIsFlashMode] = useState(false);
  const [numberSequence, setNumberSequence] = useState([]);
  const [currentNumberIndex, setCurrentNumberIndex] = useState(0);
  const [correctSum, setCorrectSum] = useState(0);
  const [totalNumbers, setTotalNumbers] = useState(10);
  const [numberDisplayTime, setNumberDisplayTime] = useState(800);

  // Fetch assigned questions from API
  useEffect(() => {
    const fetchAssignedQuestions = async () => {
      try {
        // setLoading(true);

        // Get student ID from user data or use a default
        // const studentId = user?.student_id || user?.id || 'STU001';

        const response = await apiService.get('/assign-questions/');
        const data = response.data || {};
        setAssignedQuestions(data.assigned_questions || []);
      } catch (error) {
        console.error('Failed to fetch assigned questions:', error);
        // Fallback to empty array if API fails
        setAssignedQuestions([]);
      } finally {
        // setLoading(false);
      }
    };

    fetchAssignedQuestions();
  }, []);

  // Initialize activity configuration
  useEffect(() => {
    if (activityId) {
      const config = getActivityConfig(activityId);
      setActivityConfig(config);

      // Only activity ID 1 uses flash game mode
      const isFlashActivity = parseInt(activityId) === 1;
      setIsFlashMode(isFlashActivity);
      if (isFlashActivity) {
        setTotalNumbers(10); // Show 10 numbers
        setNumberDisplayTime(800); // 0.8 seconds per number
      }
    }
  }, [activityId, navigate]);

  const generateNumberSequence = useCallback(
    (questionData = null) => {
      // Use current question data if provided, otherwise use assigned questions
      const question =
        questionData ||
        (assignedQuestions.length > 0
          ? assignedQuestions[questionNumber]
          : null);

      if (question) {
        // Extract numbers from question properties (a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t)
        const sequence = [];
        const letters = [
          'a',
          'b',
          'c',
          'd',
          'e',
          'f',
          'g',
          'h',
          'i',
          'j',
          'k',
          'l',
          'm',
          'n',
          'o',
          'p',
          'q',
          'r',
          's',
          't',
        ];

        for (const letter of letters) {
          if (question[letter] !== undefined && question[letter] !== null) {
            const num = parseFloat(question[letter]);
            if (!isNaN(num)) {
              sequence.push(num);
            }
          }
        }

        if (sequence.length > 0) {
          const sum =
            parseFloat(question.answer) || sequence.reduce((a, b) => a + b, 0);
          return { sequence, sum, questionData: question };
        }
      }

      // Fallback to generated numbers if no API data
      const sequence = [];
      let sum = 0;

      for (let i = 0; i < totalNumbers; i++) {
        // Generate numbers from 1 to 9 for easier mental math
        const number = Math.floor(Math.random() * 9) + 1;
        sequence.push(number);
        sum += number;
      }

      return { sequence, sum, questionData: null };
    },
    [totalNumbers, assignedQuestions, questionNumber]
  );

  const startFlashSequence = useCallback(
    (questionData = null) => {
      const {
        sequence,
        sum,
        questionData: currentQData,
      } = generateNumberSequence(questionData);
      setNumberSequence(sequence);
      setCorrectSum(sum);
      setCurrentQuestionData(currentQData);
      setCurrentNumberIndex(0);

      // Use speed from question data, convert to milliseconds
      const speedInMs = currentQData?.speed
        ? currentQData.speed * 1000
        : numberDisplayTime;
      setTimeLeft(speedInMs);
      setCurrentState(ACTIVITY_STATES.GAME);
    },
    [generateNumberSequence, numberDisplayTime]
  );

  const startGame = useCallback(() => {
    if (!activityConfig) return;

    // Use assigned questions if available, otherwise fallback to generated questions
    if (
      assignedQuestions.length > 0 &&
      questionNumber < assignedQuestions.length
    ) {
      const question = assignedQuestions[questionNumber];

      // For flash number game, we'll use the sequence from generateNumberSequence
      if (isFlashMode) {
        const { sequence, sum } = generateNumberSequence();
        setCurrentQuestion({
          question: `Sum of: ${sequence.join(' + ')}`,
          answer: sum.toString(),
          type: 'flash_number',
        });
      } else {
        // For other activities, create a question from the data
        const letters = [
          'a',
          'b',
          'c',
          'd',
          'e',
          'f',
          'g',
          'h',
          'i',
          'j',
          'k',
          'l',
          'm',
          'n',
          'o',
          'p',
          'q',
          'r',
          's',
          't',
        ];
        const numbers = letters
          .map(letter => question[letter])
          .filter(num => num !== undefined && num !== null);

        setCurrentQuestion({
          question: `Calculate: ${numbers.join(' + ')}`,
          answer:
            question.answer ||
            numbers
              .reduce((a, b) => parseFloat(a) + parseFloat(b), 0)
              .toString(),
          type: 'math_practice',
        });
      }

      setTimeLeft(activityConfig.timeLimit);
      setQuestionNumber(questionNumber + 1);
      return;
    }

    // Fallback to generated question
    const question = activityConfig.generateQuestion();
    setCurrentQuestion(question);
    setTimeLeft(activityConfig.timeLimit);
    setQuestionNumber(questionNumber + 1);
  }, [
    activityConfig,
    questionNumber,
    assignedQuestions,
    isFlashMode,
    generateNumberSequence,
  ]);

  // Handle countdown
  useEffect(() => {
    if (currentState === ACTIVITY_STATES.COUNTDOWN && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentState === ACTIVITY_STATES.COUNTDOWN && countdown === 0) {
      if (isFlashMode) {
        // Start flash sequence with current question data
        const currentQuestionData = assignedQuestions[questionNumber];
        startFlashSequence(currentQuestionData);
      } else {
        setCurrentState(ACTIVITY_STATES.GAME);
        startGame();
      }
    }
  }, [
    currentState,
    countdown,
    isFlashMode,
    startFlashSequence,
    startGame,
    assignedQuestions,
    questionNumber,
  ]);

  // Handle flash sequence timer
  useEffect(() => {
    if (currentState === ACTIVITY_STATES.GAME && isFlashMode && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 100);
      }, 100);
      return () => clearTimeout(timer);
    } else if (
      currentState === ACTIVITY_STATES.GAME &&
      isFlashMode &&
      timeLeft <= 0
    ) {
      // Move to next number or end flashing
      if (currentNumberIndex < numberSequence.length - 1) {
        // Brief pause between numbers
        setTimeout(() => {
          setCurrentNumberIndex(currentNumberIndex + 1);
          // Use speed from current question data, convert to milliseconds
          const speedInMs = currentQuestionData?.speed
            ? currentQuestionData.speed * 1000
            : numberDisplayTime;
          setTimeLeft(speedInMs);
        }, 100);
      } else {
        // End of flash sequence
        setTimeout(() => {
          setCurrentState(ACTIVITY_STATES.INPUT);
        }, 500);
      }
    }
  }, [
    currentState,
    timeLeft,
    isFlashMode,
    currentNumberIndex,
    numberSequence.length,
    currentQuestionData,
    numberDisplayTime,
  ]);

  // Handle regular game timer (for non-flash mode)
  useEffect(() => {
    if (currentState === ACTIVITY_STATES.GAME && !isFlashMode && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 100);
      }, 100);
      return () => clearTimeout(timer);
    } else if (
      currentState === ACTIVITY_STATES.GAME &&
      !isFlashMode &&
      timeLeft <= 0
    ) {
      // Time's up, move to input state
      setCurrentState(ACTIVITY_STATES.INPUT);
    }
  }, [currentState, timeLeft, isFlashMode]);

  const startActivity = () => {
    setCurrentState(ACTIVITY_STATES.COUNTDOWN);
    setCountdown(3);
    setScore(0);
    setQuestionNumber(0);
    setUserAnswer('');
    setCurrentQuestionData(null);
  };

  const handleAnswerSubmit = e => {
    if (e.key === 'Enter' && userAnswer.trim()) {
      if (isFlashMode) {
        // Flash game mode - check sum
        const userSum = parseFloat(userAnswer.trim());
        const isCorrect = userSum === correctSum;

        // Store the answer for this question
        // Store answer data (removed detailed results display)
        // const answerData = {
        //   questionNumber: questionNumber + 1,
        //   questionData: currentQuestionData,
        //   userAnswer: userSum,
        //   correctAnswer: correctSum,
        //   isCorrect: isCorrect,
        // };

        if (isCorrect) {
          setScore(score + 1);
        }

        // Check if there are more questions
        if (questionNumber + 1 < assignedQuestions.length) {
          // Move to next question
          setQuestionNumber(questionNumber + 1);
          setUserAnswer('');
          setCurrentState(ACTIVITY_STATES.COUNTDOWN);
          setCountdown(3);
        } else {
          // All questions completed
          setCurrentState(ACTIVITY_STATES.GAME_OVER);
          setTimeout(() => {
            setCurrentState(ACTIVITY_STATES.CONGRATULATIONS);
          }, 2000);
        }
      } else {
        // Regular mode - check individual question
        const isCorrect = activityConfig.validateAnswer(
          userAnswer,
          currentQuestion.answer
        );

        if (isCorrect) {
          setScore(score + 1);
        }

        // Move to next question or end game
        if (score + 1 >= activityConfig.maxScore) {
          setCurrentState(ACTIVITY_STATES.GAME_OVER);
          setTimeout(() => {
            setCurrentState(ACTIVITY_STATES.CONGRATULATIONS);
          }, 2000);
        } else {
          setUserAnswer('');
          setCurrentState(ACTIVITY_STATES.GAME);
          setTimeout(() => {
            startGame();
          }, 500);
        }
      }
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  // Render different states
  const renderContent = () => {
    if (!activityConfig) return null;

    switch (currentState) {
      case ACTIVITY_STATES.READY:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="mb-8">
              <img
                src={flashIcon}
                alt="Flash Game"
                className="w-48 h-48 drop-shadow-sm"
              />
            </div>
            <button
              onClick={startActivity}
              className="text-6xl font-bold text-red-600 hover:text-red-700 transition-colors"
            >
              Ready
            </button>
          </div>
        );

      case ACTIVITY_STATES.COUNTDOWN:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="mb-8">
              <img
                src={flashIcon}
                alt="Flash Game"
                className="w-48 h-48 drop-shadow-sm"
              />
            </div>
            <div className="text-8xl font-bold text-red-600 mb-4">
              {countdown}
            </div>
            <div className="w-32 h-4 bg-gray-200 rounded-full">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-1000"
                style={{ width: `${((3 - countdown) / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        );

      case ACTIVITY_STATES.GAME:
        if (isFlashMode) {
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-9xl font-bold text-red-600 mb-8">
                {numberSequence[currentNumberIndex]}
              </div>
            </div>
          );
        } else {
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-9xl font-bold text-red-600 mb-8">
                {currentQuestion?.question}
              </div>
              <div className="w-32 h-4 bg-gray-200 rounded-full mb-4">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-100"
                  style={{
                    width: `${(timeLeft / activityConfig.timeLimit) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="text-lg text-gray-600">
                Question {questionNumber} of {activityConfig.maxScore}
              </div>
            </div>
          );
        }

      case ACTIVITY_STATES.INPUT:
        if (isFlashMode) {
          return (
            <div className="flex items-center justify-center h-full">
              {/* Center content */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    onKeyPress={handleAnswerSubmit}
                    placeholder="YOUR ANSWER HERE"
                    className="w-80 h-24 text-center text-5xl font-bold border-4 border-blue-500 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-2xl placeholder:text-blue-300"
                    autoFocus
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/10 to-purple-400/10 pointer-events-none"></div>
                </div>
                <p className="text-lg text-blue-600 mt-6 italic font-medium bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                  Press "ENTER" to continue
                </p>
              </div>
            </div>
          );
        } else {
          return (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={e => setUserAnswer(e.target.value)}
                  onKeyPress={handleAnswerSubmit}
                  placeholder="YOUR ANSWER HERE"
                  className="w-96 h-16 text-center text-2xl font-bold border-3 border-blue-500 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg transition-all duration-300 placeholder:text-blue-300"
                  autoFocus
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/10 to-purple-400/10 pointer-events-none"></div>
              </div>
              <p className="text-lg text-blue-600 mt-6 italic font-medium bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                Press "ENTER" to continue
              </p>
            </div>
          );
        }

      case ACTIVITY_STATES.GAME_OVER:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-4xl font-bold mb-8">Game Over</h2>
            <div className="mb-8">
              <img
                src={timingIcon}
                alt="Timing"
                className="w-32 h-40 md:w-40 md:h-48 lg:w-48 lg:h-56"
              />
            </div>
            <p className="text-xl text-gray-600 italic">Wait for Scores...</p>
          </div>
        );

      case ACTIVITY_STATES.CONGRATULATIONS:
        return (
          <div className="flex flex-col items-center justify-center h-full relative">
            {/* Logout button - top right */}
            <button
              onClick={handleLogout}
              className="absolute top-4 right-4 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
            >
              <img
                src={logoutIcon}
                alt="Logout"
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mb-2"
              />
              <span className="text-sm font-bold text-black">Logout</span>
            </button>

            {/* Dashboard button - bottom left */}
            <button
              onClick={handleDashboard}
              className="absolute bottom-4 left-4 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
            >
              <img
                src={universityIcon}
                alt="Dashboard"
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mb-2"
              />
              <span className="text-sm font-bold text-black">DASHBOARD</span>
            </button>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 lg:mb-8">
              Congratulation
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6 lg:mb-8 gap-4 sm:gap-8 lg:gap-12 xl:gap-24 2xl:gap-48">
              <div className="flex flex-col items-center">
                <img
                  src={flashIcon}
                  alt="Flash Number"
                  className="w-32 h-32 mb-2"
                />
                <span className="text-gray-600 font-serif">Start Again</span>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src={awardIcon}
                  alt="Award"
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 mb-2"
                />
                <span className="text-gray-600 font-serif mb-2 text-lg sm:text-xl lg:text-2xl xl:text-3xl">
                  Your Scored
                </span>
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-red-600 mb-2">
                  {score}
                </div>
                <span className="text-gray-600 font-serif text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl">
                  Out of{' '}
                  {assignedQuestions.length || activityConfig?.maxScore || 30}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src={teachingIcon}
                  alt="Teaching"
                  className="w-32 h-32 mb-2"
                />
                <span className="text-gray-600 font-serif">Review</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background - Full light yellow */}
      <div className="absolute inset-0 bg-yellow-50">
        {/* Mathematical symbols pattern scattered across the background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 text-yellow-400 text-4xl">
            ➕
          </div>
          <div className="absolute top-20 right-20 text-yellow-400 text-3xl">
            ➗
          </div>
          <div className="absolute top-40 left-20 text-yellow-400 text-2xl">
            △
          </div>
          <div className="absolute top-60 right-10 text-yellow-400 text-3xl">
            ⬟
          </div>
          <div className="absolute top-80 left-10 text-yellow-400 text-2xl">
            π
          </div>
          <div className="absolute top-30 right-40 text-yellow-400 text-3xl">
            ×
          </div>
          <div className="absolute top-70 left-40 text-yellow-400 text-2xl">
            ÷
          </div>
          <div className="absolute top-90 right-30 text-yellow-400 text-3xl">
            =
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="bg-[#fefefe] rounded-2xl sm:rounded-3xl shadow-lg w-full max-w-4xl min-h-[75vh] sm:min-h-[80vh] p-3 xs:p-4 sm:p-6 md:p-8 flex flex-col relative">
          {/* Header */}
          {currentState === ACTIVITY_STATES.READY && (
            <div className="flex justify-between items-start mb-8">
              <div className="w-20"></div>
              <div className="text-center flex-1">
                <h1 className="text-4xl font-bold">Flash Number Game</h1>
                <h2 className="text-2xl font-bold mt-2">Abacus Addition</h2>
              </div>
              <div className="w-20">
                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                >
                  <img
                    src={logoutIcon}
                    alt="Logout"
                    className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 drop-shadow-sm mb-2"
                  />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 flex items-center justify-center">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
