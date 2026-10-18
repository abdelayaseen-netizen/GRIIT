import React, { useState } from 'react';
import { Image, Text, TextInput, View } from 'react-native';
import { GlassSheet } from '@/ds/glass/GlassSheet';
import { Button, SegmentedControl } from '@/components/ds';
import { DS_V3 } from '@/ds';
import { PostResult } from './PostResult';
import { AUDIENCE, Audience, CAPTION_MAX } from './copy';

// Opens only after Done on a task. The only place the audience is chosen. Close = Save privately.
export function PostSheet({ visible, task, completion, onSubmit, onClose, error }: any) {
  const [aud, setAud] = useState<Audience>('friends');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => { setBusy(true); try { await onSubmit({ audience: aud, caption: caption.trim() || null }); } finally { setBusy(false); } };
  return (
    <GlassSheet visible={visible} onClose={() => onClose('private')} label="Post your proof">
      <Text style={DS_V3.type.bodyStrong}>Post your proof</Text>
      <Text style={DS_V3.type.caption}>{task.title} · {task.challengeName} · Day {task.dayIndex} of {task.durationDays}</Text>
      {completion.photoUri ? (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Image source={{ uri: completion.photoUri }} style={{ width: 84, height: 105, borderRadius: 12 }} accessibilityLabel="Your proof photo" />
          <TextInput value={caption} onChangeText={(v) => setCaption(v.slice(0, CAPTION_MAX))} placeholder="Add a caption (optional)" multiline maxLength={CAPTION_MAX} accessibilityLabel="Caption" style={{ flex: 1, minHeight: 105 }} />
        </View>
      ) : <PostResult completion={completion} compact />}
      <Text style={DS_V3.type.secondaryStrong}>Who sees this</Text>
      <SegmentedControl value={aud} onChange={setAud} options={(Object.keys(AUDIENCE) as Audience[]).map((k) => ({ value: k, label: AUDIENCE[k].label, icon: AUDIENCE[k].icon }))} accessibilityLabel="Who sees this" />
      <Text style={DS_V3.type.caption}>{AUDIENCE[aud].line}</Text>
      {error ? <Text style={DS_V3.type.secondary} accessibilityRole="alert">{error}</Text> : null}
      <Button variant="primary" onPress={submit} loading={busy} accessibilityLabel={error ? 'Try again' : AUDIENCE[aud].button}>{busy ? 'Posting' : error ? 'Try again' : AUDIENCE[aud].button}</Button>
    </GlassSheet>
  );
}
