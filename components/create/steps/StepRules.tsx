import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DS_COLORS } from "@/lib/design-system";
import { styles } from "@/components/create/wizard-styles";
import { DurationPill, CATEGORY_OPTIONS } from "@/components/create/wizard-shared";
import type { StepBasicsProps } from "@/components/create/steps/StepBasics";

type Who = StepBasicsProps["who"];
type PhotoProof = "off" | "optional" | "required";
type TeamRules = "all" | "shared";

export interface StepRulesProps {
  difficultyMode: "standard" | "hard";
  setDifficultyMode: (v: "standard" | "hard") => void;
  photoProof: PhotoProof;
  setPhotoProof: (v: PhotoProof) => void;
  who: Who;
  teamRules: TeamRules;
  setTeamRules: (v: TeamRules) => void;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  catError: boolean;
}

export function StepRules({
  difficultyMode,
  setDifficultyMode,
  photoProof,
  setPhotoProof,
  who,
  teamRules,
  setTeamRules,
  categories,
  setCategories,
  catError,
}: StepRulesProps) {
  return (
    <>
      <Text style={styles.h1}>Challenge rules</Text>
      <Text style={styles.sub}>How strict do you want this?</Text>
      <Text style={styles.fieldLabel}>Difficulty</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.ruleCard, difficultyMode === "standard" && styles.ruleCardSel]}
          onPress={() => setDifficultyMode("standard")}
          accessibilityRole="button"
          accessibilityLabel="Standard difficulty — self-reported completion, streak freezes allowed — tap to select"
          accessibilityState={{ selected: difficultyMode === "standard" }}
        >
          <Text style={styles.ruleTitle}>Standard</Text>
          {(
            [
              "Self-reported completion",
              "Streak freezes allowed",
              "Miss a day? Keep going",
            ] as const
          ).map((item, i) => (
            <View key={i} style={styles.rowStartGap8Mb4}>
              <Ionicons
                name={difficultyMode === "standard" ? "checkmark" : "remove"}
                size={14}
                color={difficultyMode === "standard" ? DS_COLORS.PRIMARY : DS_COLORS.TEXT_HINT}
                style={styles.mt2}
              />
              <Text
                style={{
                  fontSize: 13,
                  color: DS_COLORS.TEXT_SECONDARY,
                  lineHeight: 20,
                  flex: 1,
                }}
              >
                {item}
              </Text>
            </View>
          ))}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ruleCard, difficultyMode === "hard" && styles.ruleCardSel]}
          onPress={() => setDifficultyMode("hard")}
          accessibilityRole="button"
          accessibilityLabel="Hard mode — photo proof required, no streak freezes, miss a day means Day 1 again — tap to select"
          accessibilityState={{ selected: difficultyMode === "hard" }}
        >
          <Text style={styles.ruleTitle}>Hard mode 🔥</Text>
          {(
            ["Photo proof every task", "No streak freezes", "Miss a day? Day 1 again"] as const
          ).map((item, i) => (
            <View key={i} style={styles.rowStartGap8Mb4}>
              <Ionicons
                name={difficultyMode === "hard" ? "checkmark" : "remove"}
                size={14}
                color={difficultyMode === "hard" ? DS_COLORS.PRIMARY : DS_COLORS.TEXT_HINT}
                style={styles.mt2}
              />
              <Text
                style={{
                  fontSize: 13,
                  color: DS_COLORS.TEXT_SECONDARY,
                  lineHeight: 20,
                  flex: 1,
                }}
              >
                {item}
              </Text>
            </View>
          ))}
        </TouchableOpacity>
      </View>
      {difficultyMode === "hard" ? (
        <View style={styles.hardWarningBox}>
          <Text style={styles.hardWarningText}>
            Hard mode adds verification gates (time window, location, etc.). Camera-only enforcement is per task in the task
            editor — not forced on every task.
          </Text>
        </View>
      ) : null}
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Photo proof</Text>
      <View style={styles.rowGapSm}>
        {(
          [
            { id: "off" as const, label: "Off" },
            { id: "optional" as const, label: "Optional" },
            { id: "required" as const, label: "Required" },
          ] as const
        ).map((p) => (
          <DurationPill
            key={p.id}
            label={p.label}
            selected={photoProof === p.id}
            onPress={() => {
              setPhotoProof(p.id);
            }}
            accessibilityLabel={`Photo proof ${p.label} — ${photoProof === p.id ? "selected" : "tap to select"}`}
            style={styles.flex1}
          />
        ))}
      </View>
      <Text style={styles.caption}>Photos become shareable proof cards on your feed.</Text>
      <Text style={styles.fieldLabel}>
        Category <Text style={styles.light}>(select all that apply)</Text>
      </Text>
      <View style={[styles.catPillWrap, catError && styles.catPillWrapErr]}>
        <View style={styles.colGapSm}>
          <View style={styles.rowGapSm}>
            {CATEGORY_OPTIONS.slice(0, 3).map((c) => {
              const sel = categories.includes(c);
              return (
                <DurationPill
                  key={c}
                  label={c}
                  selected={sel}
                  onPress={() =>
                    setCategories((prev) => (sel ? prev.filter((x) => x !== c) : [...prev, c]))
                  }
                  accessibilityLabel={`${c} category — ${sel ? "selected" : "tap to select"}`}
                  style={styles.flex1}
                />
              );
            })}
          </View>
          <View style={styles.rowGapSm}>
            {CATEGORY_OPTIONS.slice(3, 5).map((c) => {
              const sel = categories.includes(c);
              return (
                <DurationPill
                  key={c}
                  label={c}
                  selected={sel}
                  onPress={() =>
                    setCategories((prev) => (sel ? prev.filter((x) => x !== c) : [...prev, c]))
                  }
                  accessibilityLabel={`${c} category — ${sel ? "selected" : "tap to select"}`}
                  style={styles.flex1}
                />
              );
            })}
            <View style={styles.flex1} />
          </View>
        </View>
      </View>
      {catError ? <Text style={styles.errText}>Pick at least one category</Text> : null}
      {who !== "solo" && (
        <>
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
            Team rules <Text style={styles.light}>(for duo/squad)</Text>
          </Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeCard, teamRules === "all" && styles.typeCardSel]}
              onPress={() => setTeamRules("all")}
              accessibilityRole="button"
              accessibilityLabel={`Everyone does all tasks — each person completes every task — ${teamRules === "all" ? "selected" : "tap to select"}`}
              accessibilityState={{ selected: teamRules === "all" }}
            >
              <Text style={styles.typeCardTitle}>Everyone does all</Text>
              <Text style={styles.typeCardSub}>Each person completes every task individually.</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeCard, teamRules === "shared" && styles.typeCardSel]}
              onPress={() => setTeamRules("shared")}
              accessibilityRole="button"
              accessibilityLabel={`Shared progress — team splits numeric targets — ${teamRules === "shared" ? "selected" : "tap to select"}`}
              accessibilityState={{ selected: teamRules === "shared" }}
            >
              <Text style={styles.typeCardTitle}>Shared progress</Text>
              <Text style={styles.typeCardSub}>Team splits numeric targets across members.</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </>
  );
}
