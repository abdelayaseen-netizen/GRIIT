/**
 * Dev-only DS primitive gallery. Route: /dev/design
 * File-based Expo Router. Not registered in app/_layout.tsx.
 */
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, Inbox } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import Button from "@/components/ds/Button";
import Card from "@/components/ds/Card";
import Chip from "@/components/ds/Chip";
import SegmentedControl from "@/components/ds/SegmentedControl";
import ListRow from "@/components/ds/ListRow";
import EmptyState from "@/components/ds/EmptyState";
import Avatar from "@/components/ds/Avatar";
import AvatarStack from "@/components/ds/AvatarStack";
import Stamp from "@/components/ds/Stamp";
import DisplayNumber from "@/components/ds/DisplayNumber";
import ProofImage from "@/components/ds/ProofImage";
import Skeleton from "@/components/ds/Skeleton";
import HintBox from "@/components/ds/HintBox";
import WeekStrip from "@/components/ds/WeekStrip";

const ICON = DS_V3.space.xs * 6;
const PROOF = require("../../assets/dev/proof-can.png") as number;

function Caption({ children }: { children: string }) {
  return <Text style={styles.caption}>{children}</Text>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Cell({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <View style={styles.cell}>
      {children}
      <Caption>{caption}</Caption>
    </View>
  );
}

export default function DesignGallery() {
  const [segment, setSegment] = useState("Feed");
  const [ghost, setGhost] = useState("Scope");
  const [form, setForm] = useState("14");
  const [countKey, setCountKey] = useState(0);
  const [fillToday, setFillToday] = useState(false);
  const [fillKey, setFillKey] = useState(0);

  if (!__DEV__) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Design</Text>
        <Text style={styles.kicker}>Chunk B primitives</Text>

        <Section title="Button">
          <View style={styles.row}>
            <Cell caption="primary regular">
              <Button label="Secure today" />
            </Cell>
            <Cell caption="primary small">
              <Button label="Start" size="small" />
            </Cell>
          </View>
          <View style={styles.row}>
            <Cell caption="secondary">
              <Button label="Follow" variant="secondary" />
            </Cell>
            <Cell caption="tertiary">
              <Button label="Cancel" variant="tertiary" />
            </Cell>
          </View>
          <View style={styles.row}>
            <Cell caption="destructive">
              <Button label="Leave" variant="tertiary" destructive />
            </Cell>
            <Cell caption="submitting">
              <Button label="Secure today" submitting />
            </Cell>
          </View>
          <Cell caption="disabled">
            <Button label="Secure today" disabled />
          </Cell>
        </Section>

        <Section title="Card">
          <View style={styles.row}>
            <Cell caption="default">
              <Card>
                <Text style={styles.body}>A proof is one unit.</Text>
              </Card>
            </Cell>
            <Cell caption="tint">
              <Card tint>
                <Text style={styles.body}>Own row weight.</Text>
              </Card>
            </Cell>
          </View>
        </Section>

        <Section title="Chip">
          <View style={styles.row}>
            <Cell caption="ghost">
              <Chip label="Friends" selected={ghost === "Friends"} onPress={() => setGhost("Friends")} />
            </Cell>
            <Cell caption="ghost selected">
              <Chip label="Scope" selected={ghost === "Scope"} onPress={() => setGhost("Scope")} />
            </Cell>
          </View>
          <View style={styles.row}>
            <Cell caption="form">
              <Chip label="7" variant="form" selected={form === "7"} onPress={() => setForm("7")} />
            </Cell>
            <Cell caption="form selected">
              <Chip label="14" variant="form" selected={form === "14"} onPress={() => setForm("14")} />
            </Cell>
          </View>
        </Section>

        <Section title="SegmentedControl">
          <Cell caption="one per screen">
            <SegmentedControl
              items={["Feed", "Discover", "You"]}
              value={segment}
              onChange={setSegment}
            />
          </Cell>
        </Section>

        <Section title="ListRow">
          <Cell caption="default">
            <ListRow
              icon={<Bell size={ICON} color={DS_V3.color.textPrimary} />}
              title="Notifications"
              subtitle="One push a day"
              onPress={() => undefined}
            />
          </Cell>
          <Cell caption="highlight">
            <ListRow
              rank={2}
              title="You"
              subtitle="12 days"
              highlight
            />
          </Cell>
        </Section>

        <Section title="EmptyState">
          <Cell caption="empty">
            <EmptyState
              icon={<Inbox size={ICON} color={DS_V3.color.textPrimary} />}
              heading="No proofs yet"
              body="Post live camera proof to secure the day."
              actionLabel="Find a challenge"
            />
          </Cell>
          <Cell caption="error">
            <EmptyState
              variant="error"
              heading="Could not load"
              body="Check the connection and try again."
              actionLabel="Retry"
              onRetry={() => undefined}
            />
          </Cell>
        </Section>

        <Section title="Avatar">
          <View style={styles.row}>
            <Cell caption="32 initials">
              <Avatar size={32} displayName="Ada Lovelace" />
            </Cell>
            <Cell caption="40">
              <Avatar size={40} displayName="Ada Lovelace" />
            </Cell>
            <Cell caption="56">
              <Avatar size={56} displayName="Ada Lovelace" />
            </Cell>
            <Cell caption="96">
              <Avatar size={96} displayName="Ada Lovelace" />
            </Cell>
          </View>
          <View style={styles.row}>
            <Cell caption="user_ glyph">
              <Avatar displayName="user_abc" />
            </Cell>
            <Cell caption="missing name">
              <Avatar />
            </Cell>
            <Cell caption="stack">
              <AvatarStack
                people={[
                  { displayName: "Ada Lovelace" },
                  { displayName: "Grace Hopper" },
                  { displayName: "user_skip" },
                ]}
              />
            </Cell>
          </View>
        </Section>

        <Section title="Stamp">
          <View style={styles.row}>
            <Cell caption="light">
              <View style={styles.lightGround}>
                <Stamp label="Verified" />
              </View>
            </Cell>
            <Cell caption="ink">
              <View style={styles.inkGround}>
                <Stamp label="Complete" onInk />
              </View>
            </Cell>
          </View>
        </Section>

        <Section title="DisplayNumber">
          <View style={styles.row}>
            <Cell caption="inline">
              <Text style={styles.body}>
                Day <DisplayNumber value={23} size="inline" />
              </Text>
            </Cell>
            <Cell caption="home">
              <DisplayNumber value={23} size="home" />
            </Cell>
          </View>
          <Cell caption="moment">
            <DisplayNumber value={23} size="moment" />
          </Cell>
          <Cell caption="count up 0 to 23">
            <DisplayNumber key={countKey} value={23} size="home" animateFrom={0} haptic />
            <View style={styles.spacer} />
            <Button label="Recount" size="small" onPress={() => setCountKey((n) => n + 1)} />
          </Cell>
        </Section>

        <Section title="ProofImage">
          <Cell caption="feed + scrim + stamp">
            <ProofImage source={PROOF} size="feed" title="Morning pages" scrim stamp="Verified" />
          </Cell>
          <View style={styles.row}>
            <View style={styles.half}>
              <Cell caption="card">
                <ProofImage source={PROOF} size="card" title="Deep work" />
              </Cell>
            </View>
            <View style={styles.third}>
              <Cell caption="thumb">
                <ProofImage source={PROOF} size="thumb" />
              </Cell>
            </View>
          </View>
          <View style={styles.half}>
            <Cell caption="missing fallback">
              <ProofImage size="card" title="Morning pages" />
            </Cell>
          </View>
          <Cell caption="stamp on scrim">
            <View style={styles.inkGround}>
              <Stamp label="Verified" onInk />
            </View>
          </Cell>
        </Section>

        <Section title="Skeleton">
          <Cell caption="card bars">
            <Skeleton />
          </Cell>
          <View style={styles.third}>
            <Cell caption="proof">
              <Skeleton variant="proof" />
            </Cell>
          </View>
        </Section>

        <Section title="HintBox">
          <Cell caption="Create wizard only">
            <HintBox>Photo proof is required on Hard. There are no freezes.</HintBox>
          </Cell>
        </Section>

        <Section title="WeekStrip">
          <Cell caption="empty today">
            <WeekStrip
              key={fillKey}
              days={[
                { letter: "M", filled: true },
                { letter: "T", filled: true },
                { letter: "W", filled: false },
                { letter: "T", filled: true },
                { letter: "F", filled: false },
                { letter: "S", filled: false },
                { letter: "S", filled: false },
              ]}
              todayIndex={6}
              fillToday={fillToday}
            />
            <View style={styles.spacer} />
            <Button
              label="Fill today"
              size="small"
              onPress={() => {
                setFillToday(true);
                setFillKey((n) => n + 1);
              }}
            />
          </Cell>
        </Section>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DS_V3.color.canvas,
  },
  scroll: {
    paddingHorizontal: DS_V3.space.gutter,
    paddingBottom: DS_V3.space.section,
    gap: DS_V3.space.lg,
  },
  title: {
    fontSize: DS_V3.type.display.fontSize,
    lineHeight: DS_V3.type.display.lineHeight,
    fontWeight: DS_V3.type.display.fontWeight,
    letterSpacing: DS_V3.type.display.letterSpacing,
    color: DS_V3.color.textPrimary,
    marginTop: DS_V3.space.sm,
  },
  kicker: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  section: {
    gap: DS_V3.space.md,
    marginTop: DS_V3.space.section,
  },
  sectionTitle: {
    fontSize: DS_V3.type.heading.fontSize,
    lineHeight: DS_V3.type.heading.lineHeight,
    fontWeight: DS_V3.type.heading.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: DS_V3.space.md,
  },
  cell: {
    gap: DS_V3.space.xs,
    flexGrow: 1,
  },
  caption: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
  },
  body: {
    fontSize: DS_V3.type.body.fontSize,
    lineHeight: DS_V3.type.body.lineHeight,
    fontWeight: DS_V3.type.body.fontWeight,
    color: DS_V3.color.textPrimary,
  },
  lightGround: {
    backgroundColor: DS_V3.color.surface,
    padding: DS_V3.space.md,
    borderRadius: DS_V3.radius.input,
  },
  inkGround: {
    backgroundColor: DS_V3.color.canvas,
    padding: DS_V3.space.md,
    borderRadius: DS_V3.radius.input,
  },
  half: {
    flex: 1,
    minWidth: DS_V3.space.xs * 30,
  },
  third: {
    width: DS_V3.space.xs * 28,
  },
  spacer: {
    height: DS_V3.space.sm,
  },
});
