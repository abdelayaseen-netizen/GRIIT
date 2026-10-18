import React from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { Skeleton } from '@/components/ds';
import { DS_V3 } from '@/ds';
import { dayLabel } from '@/components/v53/dates';

// 3 columns, 4:5 tiles, date on a small bottom label. Skeletons only here, never in the header.
export function ProofGrid({ proofs, loading, error, onRetry, onOpen, tz, header }: any) {
  if (loading) return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>{Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} style={{ width: '33%', aspectRatio: 0.8 }} />)}</View>;
  if (error) return <View style={{ alignItems: 'center', padding: 32, gap: 8 }}><Text style={DS_V3.type.secondaryStrong}>Couldn’t load proofs. You’re offline.</Text><Pressable onPress={onRetry} accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center' }}><Text style={DS_V3.type.secondaryStrong}>Try again</Text></Pressable></View>;
  return (
    <FlatList data={proofs} numColumns={3} ListHeaderComponent={header} keyExtractor={(p) => p.id} columnWrapperStyle={{ gap: 2 }} ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
      ListEmptyComponent={<View style={{ alignItems: 'center', padding: 48, gap: 6 }}><Text style={DS_V3.type.bodyStrong}>No proofs yet.</Text><Text style={DS_V3.type.secondary}>Finish a task and it shows up here.</Text></View>}
      renderItem={({ item, index }) => (
        <Pressable onPress={() => onOpen(index)} accessibilityRole="imagebutton" accessibilityLabel={`${item.challengeName}, ${dayLabel(item.taken_at, tz)}`} style={{ flex: 1 / 3, aspectRatio: 0.8 }}>
          {item.photoUri ? <Image source={{ uri: item.photoUri }} style={{ flex: 1 }} /> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: DS_V3.color.surface }}><Text style={DS_V3.type.captionStrong}>Self-reported</Text></View>}
          <View style={{ position: 'absolute', left: 6, bottom: 6, paddingHorizontal: 6, height: 20, borderRadius: 6, backgroundColor: DS_V3.color.scrim, justifyContent: 'center' }}><Text style={DS_V3.type.micro}>{dayLabel(item.taken_at, tz)}</Text></View>
        </Pressable>
      )} />
  );
}
