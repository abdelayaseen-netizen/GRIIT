import React from 'react';

// Never skip this and never render the confirmation optimistically. The streak,
// daySecured and badge state are all server-authored. README §5.
export function Verifying({ line = 'Posting your proof…' }) {
  return (
    <div className="verifying">
      <span className="spinner" />
      <span style={{ fontSize: 15, color: 'var(--body)' }}>{line}</span>
      <span style={{ fontSize: 13, color: 'var(--muted-light)' }}>
        Nothing is secured until the server says so.
      </span>
    </div>
  );
}
