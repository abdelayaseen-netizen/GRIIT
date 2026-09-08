import React from 'react';
import { color, type, space, radius, hit } from '../tokens';
import { Card, InkCard, Chip, Button } from './Primitives';
import { Avatar } from './Identity';
import { ProofImage } from './Media';

type Post = {
  author: { displayName?: string; uri?: string };
  meta: string;                       // "10h · Day 1 · Drink Water Today"
  variant: 'photo' | 'noPhoto' | 'finished';
  proofUri?: string; challengeTitle?: string; caption?: string; summary?: string;
};

function ActionRow({ icons }: { icons: React.ReactNode[] }) {
  return (
    <div style={{ display: 'flex', gap: space.sm }}>
      {icons.map((ic, i) => (
        <div key={i} style={{ width: hit, height: hit, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ic}</div>
      ))}
    </div>
  );
}

export function FeedPost({ post, actionIcons, glyph }: { post: Post; actionIcons: React.ReactNode[]; glyph?: React.ReactNode }) {
  const header = (
    <div style={{ display: 'flex', alignItems: 'center', gap: space.md }}>
      <Avatar size={40} uri={post.author.uri} displayName={post.author.displayName} glyph={glyph} />
      <div style={{ flex: 1 }}>
        <div style={type.bodyStrong}>{post.author.displayName}</div>
        <div style={{ ...type.caption, color: color.textSecondary }}>{post.meta}</div>
      </div>
    </div>
  );

  if (post.variant === 'noPhoto') {
    // A single line card on surface, not an empty block with three icons. Not ink:
    // ink is reserved for the hero card, the FAB and cover fallbacks.
    return (
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: space.md }}>
          <Avatar size={40} displayName={post.author.displayName} glyph={glyph} />
          <div style={{ flex: 1 }}>
            <div style={type.bodyStrong}>{post.summary}</div>
            <div style={{ ...type.caption, color: color.textSecondary }}>{post.meta}</div>
          </div>
        </div>
      </Card>
    );
  }

  if (post.variant === 'finished') {
    return (
      <Card tint>
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
          {header}
          <div style={type.body}>{post.summary}</div>
          <ActionRow icons={actionIcons} />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
        {header}
        <ProofImage uri={post.proofUri} title={post.challengeTitle} caption={post.caption} size="feed" />
        <ActionRow icons={actionIcons} />
      </div>
    </Card>
  );
}

export function ChallengeCard({ title, coverUri, days, difficulty, onStart, featured }: {
  title: string; coverUri?: string; days: number; difficulty: string; onStart?: () => void; featured?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.sm }}>
      <div style={{ position: 'relative' }}>
        <ProofImage uri={coverUri} title={title} caption={featured ? `${days} days · photo proof` : undefined} size={featured ? 'feed' : 'card'} />
        {featured && onStart ? (
          <div style={{ position: 'absolute', right: space.lg, bottom: space.lg }}>
            <Button label="Start" size="small" />
          </div>
        ) : null}
      </div>
      {/* Difficulty reads as meta, not as an action: one secondary caption, no uppercase chip. */}
      {!featured ? (
        <div style={{ ...type.caption, color: color.textSecondary }}>{`${days} days · ${difficulty}`}</div>
      ) : null}
    </div>
  );
}

// Horizontal only, inside a scroll strip. No box: a person is not read as one unit
// against the canvas, and the strip already groups them. Follow is secondary, it repeats.
export function PersonCard({ name, uri, onFollow, glyph }: { name: string; uri?: string; onFollow?: () => void; glyph?: React.ReactNode }) {
  return (
    <div style={{ width: 140, flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space.sm }}>
      <Avatar size={56} uri={uri} displayName={name} glyph={glyph} />
      <div style={type.bodyStrong}>{name}</div>
      <div style={{ ...type.caption, color: color.textSecondary }}>New here</div>
      <div style={{ width: '100%' }}><Button label="Follow" variant="secondary" size="small" onPress={onFollow} /></div>
    </div>
  );
}
