import React from 'react';
import { motion } from '../tokens';

// The prototype state machine. Screens are the accepted frames; transitions are cuts;
// the only motion is the 400ms count up on Secured. Anything not in a frame is a dead tap.
export type Screen =
  | 'welcome' | 'home' | 'discover' | 'activity' | 'profile' | 'visitor'
  | 'settings' | 'settingsDetail' | 'record'
  | 'create' | 'capture' | 'secured' | 'complete' | 'share' | 'youIn';

export type State = {
  screen: Screen;
  navStack: Screen[];
  streak: number;
  proofPosted: boolean;
  activeChallenge: string;
  activeTab: 'home' | 'discover' | 'activity' | 'profile';
  feedScope: 'Friends' | 'Everyone';
  discoverChip: 'For you' | 'Trending' | 'Body' | 'Mind';
  boardScope: 'Global' | 'Friends' | 'Challenges';
  profileTab: 'Challenges' | 'Proofs' | 'Badges';
  createStep: 1 | 2 | 3;
  securedNum: number;
  stampVisible: boolean;
  hearted: boolean;
  complete: boolean;
};

export const initialState: State = {
  screen: 'welcome', navStack: [], streak: 0, proofPosted: false,
  activeChallenge: 'Drink Water Today', activeTab: 'home',
  feedScope: 'Everyone', discoverChip: 'For you', boardScope: 'Global',
  profileTab: 'Proofs', createStep: 1, securedNum: 0, stampVisible: false,
  hearted: false, complete: false,
};

export type Action =
  | { type: 'start' } | { type: 'tab'; tab: State['activeTab'] }
  | { type: 'push'; screen: Screen } | { type: 'back' }
  | { type: 'openCreate' } | { type: 'nextStep' } | { type: 'startChallenge'; title?: string }
  | { type: 'shoot' } | { type: 'countTo'; n: number } | { type: 'stamp' }
  | { type: 'doneSecured' } | { type: 'jumpComplete' } | { type: 'doneComplete' }
  | { type: 'set'; patch: Partial<State> } | { type: 'reset' };

export function reduce(s: State, a: Action): State {
  switch (a.type) {
    case 'start': return { ...s, screen: 'home', activeTab: 'home' };
    case 'tab': return { ...s, screen: a.tab, activeTab: a.tab, navStack: [] };
    case 'push': return { ...s, navStack: [...s.navStack, s.screen], screen: a.screen };
    case 'back': {
      const stack = [...s.navStack];
      const prev = stack.pop() ?? s.activeTab;
      return { ...s, navStack: stack, screen: prev as Screen };
    }
    case 'openCreate': return { ...s, screen: 'create', createStep: 1, navStack: [s.activeTab] };
    case 'nextStep': return { ...s, createStep: Math.min(3, s.createStep + 1) as State['createStep'] };
    case 'startChallenge': return { ...s, screen: 'youIn', activeChallenge: a.title ?? s.activeChallenge };
    case 'shoot': return { ...s, screen: 'secured', securedNum: s.streak, stampVisible: false };
    case 'countTo': return { ...s, securedNum: a.n };
    case 'stamp': return { ...s, stampVisible: true };
    case 'doneSecured': return { ...s, screen: 'home', activeTab: 'home', streak: s.streak + 1, proofPosted: true };
    case 'jumpComplete': return { ...s, screen: 'complete', streak: 30, proofPosted: true, complete: true };
    case 'doneComplete': return { ...s, screen: 'home', activeTab: 'home', complete: false };
    case 'set': return { ...s, ...a.patch };
    case 'reset': return initialState;
  }
}

// The count up: from streak to streak + 1 over motion.daySecuredMs, stamp on completion.
export function runCountUp(from: number, dispatch: (a: Action) => void) {
  const t0 = performance.now();
  const step = () => {
    const p = Math.min(1, (performance.now() - t0) / motion.daySecuredMs);
    dispatch({ type: 'countTo', n: Math.round(from + p) });
    if (p < 1) requestAnimationFrame(step);
    else dispatch({ type: 'stamp' });
  };
  requestAnimationFrame(step);
}
