/**
 * ShareCardV3 — frames 17 and 20, 03_media.md:46–58.
 * Offscreen 360 x 640 (story) or 360 x 450 (feed), capture at pixelRatio 3.
 * Number size is DS_V3.numberSize.share (220).
 */
import React, { forwardRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import ViewShot from "react-native-view-shot";
import { DS_V3 } from "@/lib/design-system";
import DisplayNumber from "@/components/ds/DisplayNumber";
import ProofImage from "@/components/ds/ProofImage";
import Stamp, { type StampLabel } from "@/components/ds/Stamp";
import ContactSheet, { type ContactSheetProof } from "@/components/task-v2/ContactSheet";

export type ShareCardV3Size = "story" | "feed";

export type ShareCardV3Props = {
  size: ShareCardV3Size;
  streak: number;
  copy: string;
  proofUri?: string;
  proofSource?: number;
  proofs?: ContactSheetProof[];
  label?: StampLabel;
};

const STORY = { width: 360, height: 640 };
const FEED = { width: 360, height: 450 };

const ShareCardV3 = forwardRef<ViewShot, ShareCardV3Props>(function ShareCardV3(
  { size, streak, copy, proofUri, proofSource, proofs, label = "Verified" },
  ref
) {
  const box = size === "story" ? STORY : FEED;
  const inset = size === "story" ? DS_V3.space.gutter * 4 : DS_V3.space.section;
  const proofWidth = size === "story" ? DS_V3.space.gutter * 12 : DS_V3.space.gutter * 9 + DS_V3.space.lg;
  return (
    <ViewShot
      ref={ref}
      options={{ format: "jpg", quality: 0.92, result: "tmpfile" }}
      style={[styles.shot, { width: box.width, height: box.height }]}
    >
      <View style={[styles.root, { paddingTop: inset, paddingBottom: inset }]}>
        <DisplayNumber value={streak} size="share" />
        <Text style={styles.copy}>{copy}</Text>
        {proofs && proofs.length > 0 ? (
          <View style={styles.sheet}>
            <ContactSheet proofs={proofs} target={proofs.length} static />
          </View>
        ) : (
          <View style={[styles.proof, { width: proofWidth }]}>
            <ProofImage uri={proofUri} source={proofSource} size="feed" />
          </View>
        )}
        <View style={styles.stamp}>
          <Stamp label={label} onInk />
        </View>
        <View style={styles.spacer} />
        <View style={styles.logoRow}>
          <View style={[styles.logoBar, styles.logoTall]} />
          <View style={[styles.logoBar, styles.logoShort]} />
          <Text style={styles.word}>GRIIT</Text>
        </View>
      </View>
    </ViewShot>
  );
});

export default ShareCardV3;

const styles = StyleSheet.create({
  shot: {
    backgroundColor: DS_V3.color.canvas,
  },
  root: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
    alignItems: "center",
    paddingHorizontal: DS_V3.space.gutter,
  },
  copy: {
    marginTop: DS_V3.space.lg,
    fontSize: DS_V3.size.tap,
    lineHeight: DS_V3.size.avatar.md,
    fontWeight: DS_V3.type.bodyStrong.fontWeight,
    color: DS_V3.color.textPrimary,
    textAlign: "center",
  },
  proof: {
    marginTop: DS_V3.space.md * 2,
  },
  sheet: {
    marginTop: DS_V3.space.md * 2,
    alignSelf: "stretch",
  },
  stamp: {
    marginTop: DS_V3.space.md * 2,
  },
  spacer: {
    flex: 1,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: DS_V3.space.lg,
    height: DS_V3.size.avatar.md + DS_V3.space.gutter,
  },
  logoBar: {
    width: DS_V3.space.md * 2,
    borderRadius: DS_V3.radius.input,
    backgroundColor: DS_V3.color.brand,
  },
  logoTall: {
    height: DS_V3.size.avatar.md + DS_V3.space.gutter,
  },
  logoShort: {
    height: DS_V3.size.avatar.md,
  },
  word: {
    fontSize: DS_V3.size.avatar.md,
    lineHeight: DS_V3.numberSize.home,
    fontWeight: DS_V3.type.display.fontWeight,
    color: DS_V3.color.textPrimary,
    letterSpacing: DS_V3.space.xs / 2,
  },
});
