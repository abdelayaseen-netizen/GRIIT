import React from 'react';

// The one moment. Four variants, README §6.1. Order of information is fixed:
// this task is done → the day is / isn't secured → what the streak now is.
export function Confirmation({ result, taskName, verifyLine, honest, onDone, onShare }) {
  const { daySecured, daySecuredEarlier, requiredRemaining, streakDays, streakDaysBefore,
    challengeDay, challengeLength, challengeName } = result;

  let headline = 'Day secured';
  let footnote = 'Streak: consecutive days where every required task was completed.';
  if (daySecuredEarlier) {
    headline = 'Task done';
    footnote = 'The day was already secured earlier today. Nothing changes on the streak.';
  } else if (!daySecured) {
    headline = `${requiredRemaining} required task${requiredRemaining === 1 ? '' : 's'} left`;
    footnote = 'The streak moves only when every required task for the day is done.';
  }

  const streakMoved = streakDays !== streakDaysBefore;
  const canShare = honest && daySecured && !daySecuredEarlier;

  return (
    <div className="confirm">
      <div className="confirm__center">
        <span className={`mark mark--${honest ? 'verified' : 'self'}`}>
          <span className="mark__check" />
        </span>
        <div className={`eyebrow eyebrow--${honest ? 'verified' : 'self'}`}>
          {honest ? 'PROOF POSTED' : 'LOGGED · SELF-REPORTED'}
        </div>
        <div className="confirm__headline">{headline}</div>
        <div className="confirm__task">{taskName}</div>
        <div className="confirm__verify">{verifyLine}</div>

        <div className="stats">
          <div className="stat">
            <span className={`stat__value${streakMoved ? '' : ' stat__value--muted'}`}>
              {streakDays} days
            </span>
            <span className="stat__label">{streakMoved ? 'STREAK' : 'STREAK · UNCHANGED'}</span>
          </div>
          <div className="stat">
            <span className="stat__value">Day {challengeDay} of {challengeLength}</span>
            <span className="stat__label">{challengeName.toUpperCase()}</span>
          </div>
        </div>
        <div className="confirm__footnote">{footnote}</div>
      </div>
      <div className="actions">
        <button className={`btn btn--${honest ? 'verified' : 'ink'}`} onClick={onDone}>Done</button>
        {canShare && <button className="btn btn--quiet" onClick={onShare}>Share to my circle</button>}
      </div>
    </div>
  );
}
