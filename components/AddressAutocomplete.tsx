import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getExtra } from '../config/env';
import { debounce, geocodeSearch, PlaceSuggestion } from '../services/geocoding';

type Props = {
  value?: string;
  onChange?: (v: string) => void;
  onSelect?: (v: string) => void;
  placeholder?: string;
};

// Simple mock suggestions - used as graceful fallback
const MOCK_SUGGESTIONS = [
  '123 Main St, Detroit, MI',
  '456 Woodward Ave, Detroit, MI',
  '789 Cass Ave, Detroit, MI',
  '101 Jefferson Ave, Detroit, MI',
  '500 Broadway St, Detroit, MI',
];

export default function AddressAutocomplete({ value = '', onChange, onSelect, placeholder }: Props) {
  const [query, setQuery] = useState(value);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const mountedRef = useRef(true);
  const provider = getExtra().geocodingProvider || 'maps-co';

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Debounced request
  const runSearch = useMemo(() => debounce(async (q: string) => {
    try {
      const list = await geocodeSearch(q);
      if (!mountedRef.current) return [] as PlaceSuggestion[];
      return list;
    } catch (e) {
      // On error, return empty and UI will fall back to mocks
      return [] as PlaceSuggestion[];
    }
  }, 350), []);

  const suggestions = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return [];
    // If we have live results, surface those; otherwise use local mock filter
    if (results.length > 0) {
      return results.map((r) => r.label);
    }
    return MOCK_SUGGESTIONS.filter((s) => s.toLowerCase().includes(q)).slice(0, 5);
  }, [query]);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); return; }
    setLoading(true);
    runSearch(q).then((list) => {
      if (!mountedRef.current) return;
      setResults(list);
    }).finally(() => mountedRef.current && setLoading(false));
  }, [query, runSearch]);

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        placeholder={placeholder || 'Enter address'}
        onChangeText={(t) => {
          setQuery(t);
          onChange && onChange(t);
        }}
        style={styles.input}
      />
      {(loading || suggestions.length > 0) && (
        <View style={styles.suggestions}>
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" />
              <Text style={{ marginLeft: 8, color: '#6b7280' }}>Searching…</Text>
            </View>
          )}
          {suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={(i) => i}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setQuery(item);
                    onSelect && onSelect(item);
                  }}
                  style={styles.suggestionItem}
                >
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          )}
          {provider === 'google' && !loading && (
            <View style={styles.attributionRow}>
              <Image
                source={{ uri: 'https://developers.google.com/maps/documentation/images/powered_by_google_on_white.png' }}
                style={styles.attributionLogo}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  suggestions: { backgroundColor: '#fff', borderRadius: 8, marginTop: 6, borderWidth: 1, borderColor: '#eee', maxHeight: 220 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  suggestionItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  suggestionText: { color: '#111827' },
  attributionRow: { paddingHorizontal: 10, paddingVertical: 8, alignItems: 'flex-end' },
  attributionText: { fontSize: 10, color: '#9ca3af' },
  attributionLogo: { width: 120, height: 16 },
});
