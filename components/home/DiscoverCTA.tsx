import React from "react";
import { Search } from "lucide-react-native";
import { DS_V3 } from "@/lib/design-system";
import ListRow from "@/components/ds/ListRow";
import { FREE_ACTIVE_CHALLENGES_LIMIT } from "@/lib/free-challenge-limit";
import { DISCOVER_CTA_TITLE, discoverCtaSubtitle } from "@/lib/discover-cta";

const ICON = DS_V3.space.lg + DS_V3.space.sm;

type Props = {
  onPress: () => void;
  running?: number;
  isPro?: boolean;
  /** unused — kept so feed callers do not break */
  variant?: "home" | "feed";
};

export default function DiscoverCTA({
  onPress,
  running = 0,
  isPro = false,
}: Props) {
  return (
    <ListRow
      icon={<Search size={ICON} color={DS_V3.color.textSecondary} />}
      title={DISCOVER_CTA_TITLE}
      subtitle={discoverCtaSubtitle({
        running,
        isPro,
        limit: FREE_ACTIVE_CHALLENGES_LIMIT,
      })}
      divider={false}
      onPress={onPress}
    />
  );
}
