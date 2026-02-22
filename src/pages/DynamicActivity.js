import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
import { ACTIVITY_STATES, getActivityConfig } from '../utils/activityConfig';
import universityIcon from '../assets/images/university.png';
import flashIcon from '../assets/images/Flashnumber.png';
import logoutIcon from '../assets/images/Logout.png';
import timingIcon from '../assets/images/timing.png';
import awardIcon from '../assets/images/award.png';
import teachingIcon from '../assets/images/teaching.png';

export default function DynamicActivity() {
  const navigate = useNavigate();
  const { activityId } = useParams();
  const location = useLocation();
  // const { user } = useAuth();

  // Debug log to verify component is loading
  console.log('DynamicActivity component loaded with activityId:', activityId);

  const [currentState, setCurrentState] = useState(ACTIVITY_STATES.READY);
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [displayedOperands, setDisplayedOperands] = useState([]);
  const [showInput, setShowInput] = useState(true);
  const [activityConfig, setActivityConfig] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [assignedQuestions, setAssignedQuestions] = useState([]);
  const [assignmentSpeed, setAssignmentSpeed] = useState(null);
  // const [loading, setLoading] = useState(false);
  // (flash-number mode removed) — simplified activity flow

  // Assigned questions will not be fetched from API on this page.
  // Keep `assignedQuestions` empty unless provided by a parent or other mechanism.

  // Initialize activity configuration
  useEffect(() => {
    if (activityId) {
      const config = getActivityConfig(activityId);
      setActivityConfig(config);
    }
  }, [activityId, navigate]);

  // Read navigation state (e.g. from FlashNumberGame -> navigate(..., { state: { assignedQuestions: group.items } }))
  useEffect(() => {
    if (location && location.state && location.state.assignedQuestions) {
      // Log exactly the shape passed by the navigator for easy debugging
      // eslint-disable-next-line no-console
      console.log(
        'state: { assignedQuestions: group.items }',
        location.state.assignedQuestions
      );

      const payload = location.state.assignedQuestions;
      // If the parent assignment object carries a `speed` property, capture it so
      // reveal timing can be driven by the assignment instead of the activityConfig.
      if (location.state.speed != null) {
        setAssignmentSpeed(Number(location.state.speed));
      } else if (
        Array.isArray(payload) &&
        payload.length > 0 &&
        payload[0].speed != null
      ) {
        setAssignmentSpeed(Number(payload[0].speed));
      }
      // If payload items are assignments that each contain a `questions` array,
      // flatten those into a single questions array for the activity page to consume.
      if (
        Array.isArray(payload) &&
        payload.length > 0 &&
        Array.isArray(payload[0].questions)
      ) {
        const flattened = payload.flatMap(item => item.questions || []);
        // eslint-disable-next-line no-console
        console.log('Detected assignment objects — flattened to questions:', {
          count: flattened.length,
          sample: flattened[0],
        });
        setAssignedQuestions(flattened);
      } else {
        // Already a direct array of question objects
        // eslint-disable-next-line no-console
        console.log(
          'Using assignedQuestions as provided (questions array). Count:',
          payload.length
        );
        setAssignedQuestions(payload);
      }
    } else {
      // eslint-disable-next-line no-console
      console.log(
        'state: { assignedQuestions: group.items } not found on navigation state'
      );
    }
  }, [location]);

  const startGame = useCallback(() => {
    if (!activityConfig) return;

    // Use assigned questions if available, otherwise fallback to generated questions
    if (
      assignedQuestions.length > 0 &&
      questionNumber < assignedQuestions.length
    ) {
      const question = assignedQuestions[questionNumber];
      // Create a question from the assigned question data
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
        .filter(num => num !== undefined && num !== null)
        .map(n => String(n).trim());

      setCurrentQuestion({
        question: `Calculate: ${numbers.join(' + ')}`,
        answer:
          question.answer ||
          numbers.reduce((a, b) => parseFloat(a) + parseFloat(b), 0).toString(),
        type: 'math_practice',
        numbers,
      });

      // prepare reveal sequence
      // eslint-disable-next-line no-console
      console.debug('Preparing reveal for numbers:', numbers);
      setDisplayedOperands([]);
      setShowInput(false);

      setTimeLeft(activityConfig.timeLimit);
      setQuestionNumber(questionNumber + 1);
      return;
    }

    // Fallback to generated question
    const question = activityConfig.generateQuestion();
    setCurrentQuestion(question);
    // generated questions typically don't include a `numbers` array — show input immediately
    setDisplayedOperands([]);
    setShowInput(true);
    setTimeLeft(activityConfig.timeLimit);
    setQuestionNumber(questionNumber + 1);
  }, [activityConfig, questionNumber, assignedQuestions]);

  // Reveal operands one-by-one when a `currentQuestion` with `numbers` is set
  useEffect(() => {
    if (!currentQuestion) return undefined;

    const nums = currentQuestion.numbers;
    if (!Array.isArray(nums) || nums.length === 0) {
      setShowInput(true);
      return undefined;
    }

    let cancelled = false;
    let i = 0;
    // Determine reveal delay (ms) from assignmentSpeed (seconds per item) or
    // activityConfig.speed (items per second). If `assignmentSpeed` is provided
    // it's treated as seconds between items (e.g. 1 => 1000ms). Otherwise,
    // `activityConfig.speed` is items-per-second and converted to ms.
    let revealDelay = 700;
    if (assignmentSpeed != null && Number.isFinite(assignmentSpeed)) {
      revealDelay = Math.max(150, Math.round(assignmentSpeed * 1000));
    } else if (activityConfig && activityConfig.speed) {
      revealDelay = Math.max(150, Math.round(1000 / activityConfig.speed));
    }
    let timerId = null;

    const revealNext = () => {
      if (cancelled) return;
      const val = String(nums[i]).trim();
      // eslint-disable-next-line no-console
      console.debug('Reveal next operand:', i, val);
      setDisplayedOperands(prev => [...prev, val]);
      i += 1;
      if (i < nums.length) {
        timerId = setTimeout(revealNext, revealDelay);
      } else {
        // after last operand, reveal input after a short pause
        timerId = setTimeout(() => {
          if (!cancelled) setShowInput(true);
        }, 400);
      }
    };

    // reset and start
    setDisplayedOperands([]);
    setShowInput(false);
    timerId = setTimeout(revealNext, 250);

    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [currentQuestion, activityConfig, assignmentSpeed]);

  // Handle countdown
  useEffect(() => {
    if (currentState === ACTIVITY_STATES.COUNTDOWN && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentState === ACTIVITY_STATES.COUNTDOWN && countdown === 0) {
      // After countdown, prepare the question and move directly to INPUT
      startGame();
      setCurrentState(ACTIVITY_STATES.INPUT);
    }
  }, [currentState, countdown, startGame, assignedQuestions, questionNumber]);

  // Handle regular game timer
  useEffect(() => {
    if (currentState === ACTIVITY_STATES.GAME && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 100);
      }, 100);
      return () => clearTimeout(timer);
    }

    if (currentState === ACTIVITY_STATES.GAME && timeLeft <= 0) {
      setCurrentState(ACTIVITY_STATES.INPUT);
    }
  }, [currentState, timeLeft]);

  const startActivity = () => {
    setCurrentState(ACTIVITY_STATES.COUNTDOWN);
    setCountdown(3);
    setScore(0);
    setQuestionNumber(0);
    setUserAnswer('');
  };

  const handleAnswerSubmit = e => {
    if (e.key === 'Enter' && userAnswer.trim()) {
      // Regular mode - check individual question
      const isCorrect = activityConfig.validateAnswer(
        userAnswer,
        currentQuestion?.answer
      );
      const newScore = isCorrect ? score + 1 : score;
      setScore(newScore);

      // Because `startGame` increments `questionNumber` when a question is prepared,
      // `questionNumber` represents the next question index (1-based count of asked questions).
      const finishedAssigned =
        assignedQuestions.length > 0 &&
        questionNumber >= assignedQuestions.length;

      if (finishedAssigned || newScore >= (activityConfig?.maxScore || 0)) {
        setCurrentState(ACTIVITY_STATES.GAME_OVER);
        setTimeout(() => {
          setCurrentState(ACTIVITY_STATES.CONGRATULATIONS);
        }, 2000);
      } else {
        // Prepare next question
        setUserAnswer('');
        setCurrentState(ACTIVITY_STATES.COUNTDOWN);
        setCountdown(3);
      }
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  // Debug variables removed from UI

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
            {/* Debug Section removed */}
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
        // GAME state no longer shows flashed numbers — show a neutral ready view
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-4xl font-bold text-gray-600 mb-4">
              Get Ready
            </div>
            <div className="w-48 h-4 bg-gray-200 rounded-full mb-4">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-100"
                style={{
                  width: `${(timeLeft / (activityConfig?.timeLimit || 1)) * 100}%`,
                }}
              ></div>
            </div>
            <div className="text-lg text-gray-600">
              Question {questionNumber}
            </div>
          </div>
        );

      case ACTIVITY_STATES.INPUT:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <div className="mb-6 text-center">
                {/*
                  During reveal (showInput === false) show the large operand.
                  Once the input appears (showInput === true) hide this number
                  so the input itself becomes the primary focus.
                */}
                {Array.isArray(currentQuestion?.numbers) ? (
                  !showInput ? (
                    <div className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-700 mb-2">
                      {(function formatOperand(s) {
                        const v = parseFloat(s);
                        return Number.isFinite(v) ? String(v) : s;
                      })(displayedOperands[displayedOperands.length - 1] || '')}
                    </div>
                  ) : null
                ) : (
                  <div className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-700 mb-2">
                    {currentQuestion?.question}
                  </div>
                )}
                {/* question index hidden in INPUT state per request */}
              </div>

              <div className="relative">
                {showInput ? (
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    onKeyPress={handleAnswerSubmit}
                    placeholder="YOUR ANSWER HERE"
                    className={
                      'w-96 h-28 text-center text-7xl font-extrabold border-4 border-blue-500 ' +
                      'rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 ' +
                      'focus:ring-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg ' +
                      'transition-all duration-300 [appearance:textfield] ' +
                      '[&::-webkit-outer-spin-button]:appearance-none ' +
                      '[&::-webkit-inner-spin-button]:appearance-none placeholder:text-3xl ' +
                      'placeholder:text-blue-300'
                    }
                    autoFocus
                  />
                ) : null}
                {showInput && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/10 to-purple-400/10 pointer-events-none" />
                )}
              </div>
              {showInput && (
                <p className="text-2xl text-blue-600 mt-6 italic font-extrabold bg-blue-50 px-6 py-3 rounded-lg border border-blue-200">
                  Press "ENTER" to continue
                </p>
              )}
            </div>
          </div>
        );

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
                <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold text-red-600 mb-2">
                  {score}
                </div>
                <span className="text-gray-600 font-serif text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-4xl">
                  Out of{' '}
                  {assignedQuestions.length ||
                    activityConfig?.number_of_questions ||
                    activityConfig?.maxScore ||
                    0}
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
