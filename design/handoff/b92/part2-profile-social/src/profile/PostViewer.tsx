import React from 'react';
import { FlatList, useWindowDimensions } from 'react-native';
import { GlassTopBar } from '@/ds/glass/GlassTopBar';
import { FeedPost } from '@/feed/FeedPost';

// Vertical, paged by post, opens at the tapped index. Photos inside a post swipe horizontally ("1 of 2").
// Title "Posts" or the challenge name — never a route name. Back returns to the grid at the same tile.
export function PostViewer({ posts, startIndex, title, viewerId, onBack, scrollY }: any) {
  const { height } = useWindowDimensions();
  return (<>
    <FlatList data={posts} initialScrollIndex={startIndex} getItemLayout={(_, i) => ({ length: height * 0.82, offset: height * 0.82 * i, index: i })}
      keyExtractor={(p) => p.id} windowSize={5} removeClippedSubviews decelerationRate="fast" snapToInterval={height * 0.82}
      renderItem={({ item }) => <FeedPost post={item} own={item.authorId === viewerId} /* own: no heart, "Liked by …" */ />} />
    <GlassTopBar title={title} scrollY={scrollY} onBack={onBack} />
  </>);
}
// Freeze in build 91 came from unbounded image decoding: use expo-image with recyclingKey and fixed getItemLayout.
