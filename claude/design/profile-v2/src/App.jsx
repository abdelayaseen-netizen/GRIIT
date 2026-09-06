import React, { useState } from 'react';
import './tokens.css';
import './styles.css';
import { FIXTURES } from './fixtures';
import OwnProfile from './screens/OwnProfile';
import ConsistencyDetail from './screens/ConsistencyDetail';
import VisitorProfile from './screens/VisitorProfile';
import EditProfile from './screens/EditProfile';
import Settings from './screens/Settings';
import Notifications from './screens/Notifications';
import Privacy from './screens/Privacy';

const TIME_TEXT = { am6: '6:00 AM', am8: '8:00 AM', pm12: '12:00 PM', pm7: '7:00 PM' };

export default function App() {
  const [screen, setScreen] = useState('profile');
  const [fixture, setFixture] = useState('twelve');
  const [visibility, setVisibility] = useState('public');
  const [identity, setIdentity] = useState(FIXTURES.twelve.identity);
  const [notifications, setNotifications] = useState({
    reminderEnabled: true, reminderTime: 'am6', customTime: null,
    lastCall: true, circleActivity: true, weeklySummary: false, liveActivity: true,
  });
  const [privacy, setPrivacy] = useState({ profile: 'public', challenge: 'public', activity: 'friends' });

  const fx = { ...FIXTURES[fixture], identity: fixture === 'twelve' ? identity : FIXTURES[fixture].identity };
  const timeText = notifications.reminderTime === 'custom' && notifications.customTime
    ? `${notifications.customTime.h}:${notifications.customTime.m} ${notifications.customTime.mer}`
    : TIME_TEXT[notifications.reminderTime];

  const go = (s) => () => setScreen(s);

  return (
    <div style={{ width: 390, height: 844, background: 'var(--canvas)', overflow: 'hidden' }}>
      {screen === 'profile' && (
        <OwnProfile fx={fx} onEdit={go('edit')} onSettings={go('settings')} onConsistencyDetail={go('consistency')} />
      )}
      {screen === 'consistency' && <ConsistencyDetail fx={fx} onBack={go('profile')} />}
      {screen === 'visitor' && <VisitorProfile visibility={visibility} onBack={go('profile')} />}
      {screen === 'edit' && (
        <EditProfile identity={fx.identity} onCancel={go('profile')}
          onSave={(next) => { setIdentity(next); setScreen('profile'); }} />
      )}
      {screen === 'settings' && (
        <Settings notifications={{ ...notifications, timeText }} privacy={privacy}
          onBack={go('profile')}
          onOpen={(id) => setScreen(id === 'notifications' ? 'notif' : id === 'privacy' ? 'privacy' : 'settings')} />
      )}
      {screen === 'notif' && <Notifications value={notifications} onChange={setNotifications} onBack={go('settings')} />}
      {screen === 'privacy' && (
        <Privacy value={privacy} onChange={setPrivacy} onPreviewVisitor={go('visitor')} onBack={go('settings')} />
      )}
    </div>
  );
}
