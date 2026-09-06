import React from 'react';
import { color, type, radius, scrim, scrimHeight, space } from '../tokens';

type ProofSize = 'feed' | 'card' | 'thumb';

// Every proof and cover is 4:5. No screen sizes an image itself.
export function ProofImage({ uri, blurhashUri, title, caption, size = 'feed' }: {
  uri?: string | null; blurhashUri?: string | null; title?: string; caption?: string; size?: ProofSize;
}) {
  const inset = size === 'feed' ? 16 : 12;
  return (
    <div style={{ position: 'relative', aspectRatio: '4 / 5', borderRadius: radius.card, overflow: 'hidden', background: color.textPrimary }}>
      {uri
        ? <img src={uri} alt={title ?? ''} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        : blurhashUri
          ? <img src={blurhashUri} alt="" style={{ position: 'absolute', inset: -16, width: 'calc(100% + 32px)', height: 'calc(100% + 32px)', objectFit: 'cover', filter: 'blur(18px)' }} />
          : null}
      {/* Text on an image always sits on a scrim. Missing image is a solid ink block with the title. */}
      {(title || caption) ? <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: scrimHeight, background: uri ? scrim : 'transparent' }} /> : null}
      {(title || caption) ? (
        <div style={{ position: 'absolute', left: inset, right: inset, bottom: inset }}>
          {title ? <div style={{ ...type.bodyStrong, color: color.textPrimary }}>{title}</div> : null}
          {caption ? <div style={{ ...type.caption, color: color.textPrimary }}>{caption}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

// Skeleton uses the card recipe with two secondary coloured bars. No spinners over content.
export function Skeleton({ lines = 2 }: { lines?: number }) {
  return (
    <div style={{ background: color.surface, border: `1px solid ${color.border}`, borderRadius: radius.card, padding: space.gutter, display: 'flex', flexDirection: 'column', gap: space.md }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{ height: 16, width: i === 0 ? '60%' : '40%', borderRadius: radius.input, background: color.border }} />
      ))}
    </div>
  );
}
