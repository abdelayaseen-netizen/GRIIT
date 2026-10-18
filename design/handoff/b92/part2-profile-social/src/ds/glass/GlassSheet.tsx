import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassSurface } from './GlassSurface';
import { GLASS_RADIUS, GLASS_STATE } from './tokens';

// Post sheet and join sheet. Dense glass, 32 pt top corners, black 35% dim behind.
export function GlassSheet({ visible, onClose, children, label }: { visible: boolean; onClose: () => void; children: React.ReactNode; label: string }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: GLASS_STATE.sheetDim }]} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
      <GlassSurface kind="dense" style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]} accessibilityViewIsModal accessibilityLabel={label}>
        <View style={styles.grabber} />
        {children}
      </GlassSurface>
    </Modal>
  );
}
const styles = StyleSheet.create({
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: GLASS_RADIUS.sheetTop, borderTopRightRadius: GLASS_RADIUS.sheetTop, paddingHorizontal: 16, paddingTop: 8, gap: 14, overflow: 'hidden' },
  grabber: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
});
