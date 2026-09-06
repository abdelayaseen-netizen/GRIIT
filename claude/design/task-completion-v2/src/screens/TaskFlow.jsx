import React, { useEffect, useRef, useState } from 'react';
import { TASK_TYPES } from '../taskTypes.js';
import { SUBMIT_RESULTS, DEMO_TASK } from '../fixtures.js';
import { Chrome } from '../components/Chrome.jsx';
import { GateList, GateLine } from '../components/GateLine.jsx';
import { Viewfinder, Shutter } from '../components/Viewfinder.jsx';
import { CaptionOverlay, CaptionField } from '../components/CaptionOverlay.jsx';
import { BigTimer } from '../components/BigTimer.jsx';
import { LogFields } from '../components/LogFields.jsx';
import { SessionTimer } from '../components/SessionTimer.jsx';
import { SwitchRow } from '../components/SwitchRow.jsx';
import { WordEditor } from '../components/WordEditor.jsx';
import { TapCounter } from '../components/TapCounter.jsx';
import { LocationReadout } from '../components/LocationReadout.jsx';
import { Verifying } from '../components/Verifying.jsx';
import { Confirmation } from '../components/Confirmation.jsx';

// One component owns the whole flow. Per-type differences are DATA (taskTypes.js);
// the only branch is the body slot. README §4, §9.
export function TaskFlow({ type = 'photo', outcome = 'secured', onExit }) {
  const cfg = TASK_TYPES[type];
  const task = DEMO_TASK[type] || DEMO_TASK.photo;
  const steps = [...cfg.states, 'verifying', 'confirmation'];
  const [i, setI] = useState(0);
  const [caption, setCaption] = useState('');
  const [text, setText] = useState('');
  const [count, setCount] = useState(0);
  const [kind, setKind] = useState('Lift');
  const [startedAt, setStartedAt] = useState(null);   // wall clock; remainder is derived
  const [distance, setDistance] = useState(null);
  const [unit, setUnit] = useState('km');          // persisted preference in production
  const [duration, setDuration] = useState(null);  // run: seconds. workout: minutes.
  const [session, setSession] = useState(false);
  const [upSec, setUpSec] = useState(0);
  const [sound, setSound] = useState(true);
  const upTick = useRef(null);
  const tick = useRef(null);
  const step = steps[i];

  const next = () => setI((n) => Math.min(n + 1, steps.length - 1));
  const back = () => (i === 0 ? onExit?.() : setI((n) => n - 1));
  const submit = () => {
    setI(steps.indexOf('verifying'));
    // Replace with the real POST. Advance only when the server responds.
    setTimeout(() => setI(steps.indexOf('confirmation')), 1100);
  };

  // No timer effect here: BigTimer derives the remainder from startedAt and calls onComplete.
  // On app launch, if the server/local record has an active timer, mount straight into
  // step 'running' with its startedAt — that is what makes reopening mid-run correct.

  const dark = step === 'capture' || step === 'review';
  const result = SUBMIT_RESULTS[outcome];

  return (
    <div className={`frame${dark ? ' frame--dark' : ''}`}>
      <div className="statusbar" />
      {step !== 'confirmation' && step !== 'verifying' && (
        <Chrome day={task.day} typeLabel={cfg.chromeTitle} onBack={back} />
      )}

      {step === 'entry' && (
        <div className="body">
          <div className="body__fill">
            <div className="title">{task.name}</div>
            <GateList gates={cfg.gates.map((g) => g
              .replace('{duration}', task.duration || '')
              .replace('{radius}', task.radius)
              .replace('{place}', task.place)
              .replace('{minimum}', task.minimum)
              .replace('{minWords}', task.minWords))} />
            {type === 'checkin' && (
              <LocationReadout place={task.place} distance={task.distance}
                radius={task.radius} accuracy={task.accuracy} />
            )}
            {type === 'timer' && (
              <div className="switchcard">
                {/* The sound is optional; the completion notification is not. */}
                <SwitchRow first label="Sound when it ends" sub="A notification arrives either way"
                  value={sound} onChange={setSound} />
              </div>
            )}
          </div>
          <button className="btn btn--verified"
            onClick={() => { if (type === 'timer') setStartedAt(Date.now()); next(); }}>
            {type === 'checkin' ? "I'm here" : `Start ${task.duration}`}
          </button>
        </div>
      )}

      {step === 'log' && !session && (
        <LogFields
          type={type}
          title={type === 'run' ? 'Log the run' : 'Log the session'}
          note={type === 'run'
            ? 'Then one photo to prove you were out there.'
            : 'Then one photo to prove you were there.'}
          distance={distance} unit={unit} onDistance={setDistance}
          onUnit={() => setUnit((u) => (u === 'km' ? 'mi' : 'km'))}
          duration={duration} onDuration={setDuration}
          minimum={task.minimum}
          chips={type === 'workout' ? ['Lift', 'Push', 'Pull', 'Conditioning'] : []}
          activeChip={kind} onChip={setKind}
          onUseTimer={type === 'workout' ? () => {
            setSession(true); setUpSec(0);
            upTick.current = setInterval(() => setUpSec((s) => s + 1), 1000);
          } : undefined}
          disclosure={type === 'run'
            ? 'Distance and duration are self-entered. Only the photo is verified.'
            : 'Duration is self-entered unless the in-app timer ran. Only the photo is verified.'}
          onNext={next}
        />
      )}

      {step === 'log' && session && (
        <SessionTimer seconds={upSec}
          onStop={() => { clearInterval(upTick.current); setSession(false); setDuration(Math.max(1, Math.round(upSec / 60))); }}
          onCancel={() => { clearInterval(upTick.current); setSession(false); }} />
      )}

      {step === 'capture' && (
        <>
          <Viewfinder stamp="21:17" />
          <div className="deck">
            <GateLine>{cfg.gates[0]}</GateLine>
            <Shutter onPress={next} />
          </div>
        </>
      )}

      {step === 'review' && (
        <>
          <Viewfinder>
            <button className="retake" onClick={back}>Retake</button>
            <CaptionOverlay challengeName={result.challengeName}
              completion={`Day ${task.day} · ${cfg.chromeTitle}`} caption={caption} />
          </Viewfinder>
          <div className="deck" style={{ justifyContent: 'flex-start', gap: 0, padding: '14px 20px 34px' }}>
            <div style={{ width: '100%' }}><CaptionField value={caption} onChange={setCaption} /></div>
            <div style={{ flex: 1 }} />
            <button className="btn btn--verified" onClick={submit}>Post proof</button>
          </div>
        </>
      )}

      {step === 'running' && (
        <BigTimer startedAt={startedAt} requiredSec={task.durationSec} taskName={task.name}
          onCancel={() => onExit?.()} onComplete={submit} />
      )}

      {step === 'write' && (
        <WordEditor value={text} onChange={setText} minWords={task.minWords} onSubmit={submit} />
      )}

      {step === 'count' && (
        <TapCounter value={count} goal={task.goal} unit={task.unit}
          onInc={() => setCount((c) => Math.min(task.goal, c + 1))}
          onDec={() => setCount((c) => Math.max(0, c - 1))}
          onSubmit={submit} />
      )}

      {step === 'ask' && (
        <div className="body">
          <div className="body__fill" style={{ justifyContent: 'center', gap: 10 }}>
            <div className="title">Did you do it today?</div>
            <div style={{ fontSize: 16, color: 'var(--muted)' }}>{task.name}</div>
            <div style={{ marginTop: 6, fontSize: 14, color: 'var(--muted-light)' }}>
              Self-reported. Nothing is checked.
            </div>
          </div>
          <div className="actions">
            <button className="btn btn--ink" onClick={submit}>I did it</button>
            <button className="btn btn--outline" onClick={() => onExit?.()}>Not yet</button>
          </div>
        </div>
      )}

      {step === 'verifying' && <Verifying line={type === 'timer' ? 'Recording the session…' : undefined} />}

      {step === 'confirmation' && (
        <Confirmation result={result} taskName={task.name} honest={cfg.honest}
          verifyLine={cfg.confirmLine
            .replace('{time}', '9:17 PM')
            .replace('{duration}', type === 'run'
              ? `${String(Math.floor((duration || 0) / 60)).padStart(2, '0')}:${String((duration || 0) % 60).padStart(2, '0')}`
              : type === 'workout' ? `${duration} min` : task.duration || '')
            .replace('{distance}', type === 'run' ? `${(distance || 0).toFixed(2)} ${unit}` : task.distance || '')
            .replace('{accuracy}', task.accuracy)
            .replace('{words}', task.minWords)
            .replace('{startedAt}', startedAt
              ? new Date(startedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
              : '')}
          onDone={() => onExit?.()} onShare={() => onExit?.()} />
      )}
    </div>
  );
}
