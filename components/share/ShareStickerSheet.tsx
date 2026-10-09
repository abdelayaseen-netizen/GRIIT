/**
 * Opens the v44.1 share sheet. The Clear / Card / Photo story sheet is gone.
 */
import React from "react";
import ShareSystemSheet from "@/components/share/ShareSystemSheet";
import {
  shareDateLabel,
  type ShareCardInput,
  type ShareMoment,
} from "@/lib/share-image";
import type { ProofKind, StickerVariant } from "@/lib/share-sticker";

export type ShareStickerDay = {
  challenge: string;
  day: number;
  durationDays: number;
  proof: ProofKind;
  status?: string;
  photoUri?: string | null;
  photoShared?: boolean;
  cameraSeal?: boolean;
  inviteCode?: string | null;
  username?: string | null;
  streak?: number;
  secured?: number;
  task?: string;
  cells?: ShareCardInput["cells"];
};

export type ShareStickerText = {
  challengeTitle: string;
  title: string;
  dayN: number;
  durationDays: number;
  gateLine: string;
  inviteCode?: string | null;
  username?: string | null;
};

export type ShareStickerConsistency = {
  secured: number;
  closed: number;
  cameraSecured: number;
  last28: boolean[];
  photoUri?: string | null;
  photoShared?: boolean;
};

export type ShareStickerBadge = {
  count: number;
  secured: number;
  byCamera: number;
  earnedOn: string;
  photoUri?: string | null;
  photoShared?: boolean;
};

export type ShareStickerSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  variant: StickerVariant;
  moment?: ShareMoment;
  day?: ShareStickerDay;
  text?: ShareStickerText;
  consistency?: ShareStickerConsistency;
  badge?: ShareStickerBadge;
  username?: string | null;
  inviteCode?: string | null;
  streak?: number;
  longestStreak?: number;
  activeLine?: string;
  dateLabel?: string;
  children?: React.ReactNode;
};

function inferredMoment(props: ShareStickerSheetProps): ShareMoment {
  if (props.moment) return props.moment;
  if (props.variant === "consistency" || props.variant === "badge") return "day_secured";
  if (props.variant === "text") return "self_reported";
  if (props.day?.proof === "self" || !props.day?.photoUri) return "self_reported";
  return "photo_proof";
}

function cardFromProps(props: ShareStickerSheetProps): Omit<ShareCardInput, "style" | "colour"> {
  const moment = inferredMoment(props);
  const username = props.username ?? props.day?.username ?? props.text?.username ?? null;
  const inviteCode = props.inviteCode ?? props.day?.inviteCode ?? props.text?.inviteCode ?? null;
  if (props.variant === "text" && props.text) {
    return {
      challenge: props.text.challengeTitle,
      task: props.text.title,
      day: props.text.dayN,
      durationDays: props.text.durationDays,
      rule: props.text.gateLine,
      username,
      inviteCode,
      cameraSeal: false,
    };
  }
  if (props.variant === "consistency" && props.consistency) {
    return {
      challenge: "Consistency",
      secured: props.consistency.secured,
      durationDays: props.consistency.last28.length || props.consistency.closed,
      cells: props.consistency.last28.map((on) => (on ? "secured" : "future")),
      username,
      inviteCode,
      streak: props.streak,
    };
  }
  if (props.variant === "badge" && props.badge) {
    return {
      challenge: "Badge",
      streak: props.badge.count,
      secured: props.badge.secured,
      username,
      inviteCode,
      dateLabel: props.badge.earnedOn,
    };
  }
  const day = props.day;
  const camera = Boolean(day?.photoUri) && day?.proof !== "self";
  return {
    challenge: day?.challenge ?? "",
    task: day?.task,
    day: day?.day,
    durationDays: day?.durationDays,
    username,
    inviteCode,
    streak: props.streak ?? day?.streak,
    secured: day?.secured,
    cells: day?.cells,
    longestStreak: props.longestStreak,
    activeLine: props.activeLine,
    dateLabel: props.dateLabel ?? (moment === "day_secured" ? shareDateLabel() : undefined),
    photoUri: day?.photoUri,
    cameraSeal: day?.cameraSeal ?? camera,
    rule: day?.status,
  };
}

export default function ShareStickerSheet(props: ShareStickerSheetProps) {
  return (
    <ShareSystemSheet
      visible={props.visible}
      onDismiss={props.onDismiss}
      moment={inferredMoment(props)}
      card={cardFromProps(props)}
    >
      {props.children}
    </ShareSystemSheet>
  );
}
