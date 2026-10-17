/**
 * Build 90 chunk 08.3: Discover search. Words search public challenge titles; a pasted invite
 * code (challenge id or a griit://i/ link) resolves to that challenge and opens it.
 */
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import TextField from "@/components/ds/TextField";
import ListRow from "@/components/ds/ListRow";
import { DS_V3 } from "@/lib/design-system";
import { trpcQuery } from "@/lib/trpc";
import { TRPC } from "@/lib/trpc-paths";
import {
  SEARCH_CODE_HEADING,
  SEARCH_LABEL,
  SEARCH_PLACEHOLDER,
  SEARCH_RESULTS_HEADING,
  searchEmptyLine,
  searchKind,
  searchRowSubtitle,
  searchRowTitle,
  type SearchResponse,
} from "@/lib/discover-search";

const DEBOUNCE_MS = 300;

export default function DiscoverSearch({
  onOpen,
}: {
  /** `viaInvite` is true when the query was an exact invite code. */
  onOpen: (challengeId: string, viaInvite: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const kind = searchKind(text);
    if (kind === "code") {
      setDebounced(text);
      return;
    }
    const handle = setTimeout(() => setDebounced(text), DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [text]);

  const kind = searchKind(debounced);
  const query = useQuery({
    queryKey: ["discover", "search", debounced.trim()],
    queryFn: () => trpcQuery(TRPC.challenges.search, { q: debounced.trim() }) as Promise<SearchResponse>,
    enabled: kind !== "empty",
    staleTime: 60 * 1000,
  });

  const response = kind === "empty" ? null : (query.data ?? null);
  const emptyLine = useMemo(
    () => (query.isFetching ? null : searchEmptyLine(debounced, response)),
    [debounced, response, query.isFetching],
  );

  const submit = () => {
    if (response?.exact) onOpen(response.exact.id, true);
    else if (response?.results[0]) onOpen(response.results[0].id, false);
  };

  return (
    <View style={styles.wrap} testID="discover-search">
      <TextField
        value={text}
        onChangeText={setText}
        placeholder={SEARCH_PLACEHOLDER}
        accessibilityLabel={SEARCH_LABEL}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={submit}
        testID="discover-search-field"
      />
      {response?.exact ? (
        <View style={styles.results}>
          <Text style={styles.heading}>{SEARCH_CODE_HEADING}</Text>
          <ListRow
            title={searchRowTitle(response.exact)}
            subtitle={searchRowSubtitle(response.exact)}
            onPress={() => onOpen(response.exact!.id, true)}
            divider={false}
          />
        </View>
      ) : response && response.results.length > 0 ? (
        <View style={styles.results}>
          <Text style={styles.heading}>{SEARCH_RESULTS_HEADING}</Text>
          {response.results.map((row, i) => (
            <ListRow
              key={row.id}
              title={searchRowTitle(row)}
              subtitle={searchRowSubtitle(row)}
              onPress={() => onOpen(row.id, false)}
              divider={i < response.results.length - 1}
            />
          ))}
        </View>
      ) : null}
      {emptyLine ? <Text style={styles.empty}>{emptyLine}</Text> : null}
      {query.isError && kind !== "empty" ? (
        <Text style={styles.empty}>Couldn't search. Check your connection and try again.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: DS_V3.space.gutter,
    gap: DS_V3.space.sm,
  },
  results: {
    backgroundColor: DS_V3.color.surface,
    borderRadius: DS_V3.radius.card,
    overflow: "hidden",
    paddingTop: DS_V3.space.sm,
  },
  heading: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    paddingHorizontal: DS_V3.space.lg,
  },
  empty: {
    fontSize: DS_V3.type.caption.fontSize,
    lineHeight: DS_V3.type.caption.lineHeight,
    fontWeight: DS_V3.type.caption.fontWeight,
    color: DS_V3.color.textSecondary,
    paddingHorizontal: DS_V3.space.xs,
  },
});
