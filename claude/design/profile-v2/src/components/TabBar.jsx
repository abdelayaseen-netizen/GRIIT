import React from 'react';
import { UserIcon } from './Icons';

const items = ['Home', 'Discover', 'Post', 'Activity', 'Profile'];

export default function TabBar({ active = 'Profile' }) {
  return (
    <div className="tabbar">
      {items.map((label) => (
        <div key={label} className={`tabbar__item${label === active ? ' tabbar__item--on' : ''}`}>
          {label === 'Post'
            ? <span style={{ width: 34, height: 34, borderRadius: 17, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>+</span>
            : <UserIcon />}
          {label !== 'Post' && label}
        </div>
      ))}
    </div>
  );
}
