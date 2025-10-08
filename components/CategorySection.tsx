import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Props = {
  name: string;
  onSave?: (name: string, meta: any) => void;
};

export default function CategorySection({ name, onSave }: Props) {
  const [title, setTitle] = useState(name);
  const [description, setDescription] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Category: {name}</Text>
      <TextInput placeholder="Section title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Short description" value={description} onChangeText={setDescription} style={[styles.input, { marginTop: 8 }]} />
      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        <TouchableOpacity onPress={() => onSave && onSave(title, { description })} style={styles.btn}><Text style={{ color: '#fff' }}>Save</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#eee' },
  header: { fontWeight: '800', marginBottom: 8 },
  input: { backgroundColor: '#f9fafb', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  btn: { backgroundColor: '#ef4444', padding: 10, borderRadius: 8, marginRight: 8 },
});
