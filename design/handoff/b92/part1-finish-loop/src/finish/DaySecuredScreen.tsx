import React, { useEffect } from 'react';
import { BackHandler, Text, View } from 'react-native';
import { router } from 'expo-router';
import { FloatingActionBar } from '@/ds/glass/FloatingActionBar';
import { WeekStrip, Flame } from '@/components/ds';
import { DS_V3 } from '@/ds';
import { COPY } from './copy';
import { verifyLabel } from './format';

// Fits on iPhone SE with no scroll. Done, Back and swipe-down all go Home.
export function DaySecuredScreen({ streak, week, tasks, firstTime, onShare }: any) {
  const home = () => { router.replace('/(tabs)'); return true; };
  useEffect(() => { const s = BackHandler.addEventListener('hardwareBackPress', home); return () => s.remove(); }, []);
  return (
    <View style={{ flex: 1, backgroundColor: DS_V3.color.canvas, alignItems: 'center', paddingHorizontal: 20, paddingTop: 28, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }} accessible accessibilityLabel={`${streak} ${COPY.inARow(streak)}`}>
        <Flame size={40} /><Text style={DS_V3.type.earnedHero /* Barlow 88 */}>{streak}</Text>
      </View>
      <Text style={DS_V3.type.secondary}>{COPY.inARow(streak)}</Text>
      <Text style={DS_V3.type.title} accessibilityRole="header">{COPY.secured}</Text>
      <WeekStrip days={week} todayFilled />
      <View style={{ alignSelf: 'stretch', borderRadius: 16, backgroundColor: DS_V3.color.surface, paddingHorizontal: 14 }}>
        {tasks.map((t: any) => (<View key={t.id} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10 }}><Text style={[DS_V3.type.secondaryStrong, { flex: 1 }]} numberOfLines={1}>{t.title}</Text><Text style={DS_V3.type.captionStrong}>{verifyLabel(t)}</Text></View>))}
      </View>
      {firstTime ? <Text style={DS_V3.type.secondary}>{COPY.securedFirst}</Text> : null}
      <FloatingActionBar primary="Share" onPrimary={onShare} secondary="Done" onSecondary={home} />
    </View>
  );
}
// firstTime ← !users.seen_secured_explainer; set it true on mount.
