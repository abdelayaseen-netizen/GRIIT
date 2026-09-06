import React from 'react';

const countWords = (t) => (t.trim() ? t.trim().split(/\s+/).length : 0);

// journal. The text IS the proof; the only gate is the word count, so the button
// states the remainder rather than just going grey.
export function WordEditor({ value, onChange, minWords, onSubmit }) {
  const words = countWords(value);
  const ready = words >= minWords;
  return (
    <div className="body" style={{ paddingLeft: 20, paddingRight: 20 }}>
      <div className="wordline">{words} / {minWords} words{ready ? ' · minimum met' : ''}</div>
      <textarea className="editor" value={value} placeholder="Write it out."
        onChange={(e) => onChange(e.target.value)} />
      <button className="btn btn--verified" disabled={!ready} onClick={onSubmit}>
        {ready ? 'Post entry' : `Write ${minWords - words} more words`}
      </button>
    </div>
  );
}
