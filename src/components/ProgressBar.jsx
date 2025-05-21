import React from 'react';

function ProgressBar({ title, totalInteractions, totalPossibleInteractions, timeRemaining }) {
  const progressPercentage = Math.min((totalInteractions / totalPossibleInteractions) * 100, 100);

  return (
    <div className="progress-section">
      <h3 className="progress-title">{title}</h3>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
      </div>
      <p className="progress-text">
        Interacted {totalInteractions} / {totalPossibleInteractions} times ({Math.round(progressPercentage)}%)
      </p>
      <p className="timer-text">Resets in: {timeRemaining}</p>
    </div>
  );
}

export default ProgressBar; 