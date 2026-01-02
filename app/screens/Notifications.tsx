import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Notification = {
    id: string;
    title: string;
    message: string;
    read: boolean;
    time: string;
}

const mockNotifications: Notification[] = [
    { id: '1', title: 'Welcome to Asteygo', message: 'Welcome to your new Group Traveling App!', time: '1m ago', read: false},
]

export default function Notifications () {
  const router = useRouter();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb'}}>
            <View style={{ padding: 20 }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: '800', marginLeft: 16}}>Notifications</Text>
            </View>

            <FlatList
            data={mockNotifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16}}
            renderItem={({ item }) => (
                <View 
                style={{
                    backgroundColor: item.read ? '#fff' : '#fef3c7',
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 12,
                    borderLeftWidth: item.read ? 0 : 4,
                    borderLeftColor: '#fbbf24',
                }}>

                    <View style={{ flexDirection: 'row', justifyContent:'space-between' }}>
                        <Text style={{ fontWeight: '700', fontSize: 16}}>{item.title}</Text>
                        <Text style={{ color: '#6b7280', fontSize: 12}}>{item.time}</Text>
                    </View>
                    <Text style={{ color: '#4b5563', marginTop: 4}}>{item.message}</Text>
                </View>
                )}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 48}}>
                        <Ionicons name="notifications-off-outline" size={48} color="#d1d5db" />
                        <Text style={{ color: '#6b7280', marginTop: 12}}>No notifications yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
  
}
