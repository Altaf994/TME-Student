import React, { useState } from 'react';

// Example prop: activityDataArr = [{...}, {...}]
const ActivityPlayer = ({ activityDataArr }) => {
  const [activityIdx, setActivityIdx] = useState(0);
  const activityData = activityDataArr[activityIdx];
  const questions = activityData.questions;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showCongrats, setShowCongrats] = useState(false);
  const [answers, setAnswers] = useState([]); // stores user answers
  const [score, setScore] = useState(0); // stores correct answers count
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleSubmit = e => {
    e.preventDefault();
    setAnswers([...answers, userAnswer]);
    const correct = parseFloat(userAnswer) === parseFloat(q.answer);
    setIsCorrect(correct);
    if (correct) setScore(score + 1);
    setShowAnswer(true);
  };

  const handleNext = () => {
    setShowAnswer(false);
    setIsCorrect(null);
    setUserAnswer('');
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Move to next activity if available
      if (activityIdx < activityDataArr.length - 1) {
        setActivityIdx(activityIdx + 1);
        setCurrentIndex(0);
        setAnswers([]);
        setShowCongrats(false);
      } else {
        setShowCongrats(true);
      }
    }
  };

  if (showCongrats) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
        <p>You have completed all activities!</p>
        <p className="mt-2">
          Your Score:{' '}
          <span className="font-bold">
            {score} / {questions.length * activityDataArr.length}
          </span>
        </p>
        <p className="mt-2">Well done!</p>
      </div>
    );
  }

  const q = questions[currentIndex];
  // Collect all non-null values for a-t
  const operandKeys = [
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
  const operands = operandKeys
    .map(key => q[key])
    .filter(val => val !== null && val !== undefined && val !== '');

  // Debug: Show operands for the first question
  const firstQuestionOperands = operandKeys
    .map(key => activityDataArr[0].questions[0][key])
    .filter(val => val !== null && val !== undefined && val !== '');

  // Debug: Show current question object and operands
  console.log('Current question:', q);
  console.log('Current operands:', operands);

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
      {/* Debug section: Show operands for the first question and current question */}
      <div className="mb-4 p-2 bg-gray-100 rounded">
        <div className="font-bold mb-1">First Question Operands (Debug):</div>
        {firstQuestionOperands.map((val, idx) => (
          <div key={idx} className="text-sm">
            {val}
          </div>
        ))}
        <div className="mt-2 font-bold">Current Question Object (Debug):</div>
        <pre className="text-xs bg-gray-200 p-2 rounded">
          {JSON.stringify(q, null, 2)}
        </pre>
        <div className="mt-2 font-bold">Current Operands (Debug):</div>
        {operands.map((val, idx) => (
          <div key={idx} className="text-sm">
            {val}
          </div>
        ))}
      </div>
      <h2 className="text-xl font-semibold mb-2">{activityData.title}</h2>
      <div className="mb-2 text-sm text-gray-700">
        <div>
          <strong>Teacher:</strong> {activityData.teacher}
        </div>
        <div>
          <strong>Concept:</strong> {activityData.concept}
        </div>
        <div>
          <strong>Speed:</strong> {activityData.speed}
        </div>
        <div>
          <strong>Assign Type:</strong> {activityData.assign_type}
        </div>
        <div>
          <strong>Target Student:</strong> {activityData.target_student}
        </div>
        {activityData.target_class_section && (
          <div>
            <strong>Target Class Section:</strong>{' '}
            {activityData.target_class_section}
          </div>
        )}
        <div>
          <strong>Created At:</strong>{' '}
          {new Date(activityData.created_at).toLocaleString()}
        </div>
      </div>
      <hr className="my-4" />
      <h3 className="text-lg font-medium mb-2">
        Question {currentIndex + 1} of {questions.length}
      </h3>
      <div className="mb-4">
        <div className="flex flex-col gap-1 mb-2">
          {operands.map((val, idx) => (
            <span key={idx} className="text-lg">
              {val}
            </span>
          ))}
        </div>
        <span className="font-bold block mt-2">answer</span>
      </div>
      {!showAnswer ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            id="answer"
            type="text"
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            className="border rounded px-2 py-1"
            required
            autoComplete="off"
            placeholder="Enter your answer"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </form>
      ) : (
        <div className="mt-4">
          {isCorrect ? (
            <div className="text-green-600 font-bold mb-2">Correct!</div>
          ) : (
            <div className="text-red-600 font-bold mb-2">Incorrect.</div>
          )}
          <div>
            <span className="font-bold">Correct Answer:</span>
            <span className="ml-2 text-lg">{q.answer}</span>
          </div>
          <button
            onClick={handleNext}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            {currentIndex < questions.length - 1 ||
            activityIdx < activityDataArr.length - 1
              ? 'Next Question'
              : 'Finish'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityPlayer;
