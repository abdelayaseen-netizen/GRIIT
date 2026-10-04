import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { color, type, space, radius, border, hit, displayFace, displayWeight } from '../../tokens';
import { Check, Copy, Download, Ellipsis, Instagram } from 'lucide-react-native';

// Frame 142. Two separate actions: the GRIIT feed, and an Instagram Story. Both can be used.
// Chunk B behaviour unchanged: feed share flips shared, held until the save lands.
export function ShareActions(p: { feed: 'idle' | 'held' | 'shared'; storyAvailable: boolean; onFeed: () => void; onStory: () => void; onCopy: () => void; onSave: () => void; onMore: () => void; onKeep: () => void; onDone: () => void }) {
  const Sec = ({ Icon, label, onPress, h = 46 }: any) => (
    <Pressable onPress={onPress} style={{ flex: 1, height: h, borderRadius: 999, backgroundColor: color.surface, borderWidth: 1, borderColor: color.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
      <Icon size={18} color={color.textPrimary} /><Text style={{ ...(h < 46 ? type.secondary : type.bodyStrong), fontWeight: '500', color: color.textPrimary }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ gap: 8 }}>
      {p.feed === 'shared' ? (
        <View accessibilityState={{ disabled: true }} style={{ height: 46, borderRadius: 999, backgroundColor: color.surface, borderWidth: 1, borderColor: color.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Check size={18} color={color.brandText} /><Text style={{ ...type.bodyStrong, color: color.textPrimary }}>Shared to the feed</Text>
        </View>
      ) : (
        <Pressable onPress={p.onFeed} disabled={p.feed === 'held'} style={{ height: 46, borderRadius: 999, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Text numberOfLines={1} style={{ ...type.bodyStrong, color: color.textPrimary }}>{p.feed === 'held' ? 'Sharing when saved' : 'Share to the feed'}</Text>
        </Pressable>
      )}
      {p.storyAvailable ? <View style={{ flexDirection: 'row' }}><Sec Icon={Instagram} label="Share to Instagram Story" onPress={p.onStory} /></View> : null}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Sec Icon={Copy} label="Copy" onPress={p.onCopy} h={40} /><Sec Icon={Download} label="Save" onPress={p.onSave} h={40} /><Sec Icon={Ellipsis} label="More" onPress={p.onMore} h={40} />
      </View>
      <Pressable onPress={p.feed === 'shared' ? p.onDone : p.onKeep} style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ ...type.bodyStrong, color: color.textSecondary }}>{p.feed === 'shared' ? 'Done' : 'Keep it to the record'}</Text>
      </Pressable>
    </View>
  );
}

export const STICKER_STYLES = [
  { id: 'clear', label: 'Clear', caption: 'Transparent sticker to paste over your own photo' },
  { id: 'card', label: 'Card', caption: 'Dark card' },
  { id: 'photo', label: 'Photo', caption: 'Your proof photo' },  // camera proofs only; hidden for text-card tasks
] as const;
export const COPY_CAPTION = 'Paste it as a sticker in Instagram.';
