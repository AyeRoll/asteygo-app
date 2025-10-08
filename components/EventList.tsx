import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Accept a relaxed event shape so callers with richer EventItem types are compatible
type EventListItem = {
  title: string;
  address?: string;
  time?: string;
  image?: string;
  category?: string;
  description?: string;
  distance?: string;
  price?: number | null;
};

type Props = {
  title?: string;
  events: EventListItem[];
  onPress?: (e: EventListItem) => void;
};

export default function EventList({ title, events, onPress }: Props) {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <FlatList
        horizontal
        data={events}
        keyExtractor={(i, idx) => i.title + idx}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onPress && onPress(item)}>
            {item.image ? <Image source={{ uri: item.image }} style={styles.image} /> : null}
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>{item.address}</Text>
            <Text style={styles.cardTime}>{item.time}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  title: { fontWeight: '800', fontSize: 16, marginBottom: 8 },
  card: { width: 220, backgroundColor: '#fff', borderRadius: 12, marginRight: 12, overflow: 'hidden' },
  image: { width: '100%', height: 120 },
  cardTitle: { fontWeight: '700', padding: 8 },
  cardSubtitle: { color: '#6b7280', paddingHorizontal: 8 },
  cardTime: { color: '#6b7280', padding: 8 },
});
