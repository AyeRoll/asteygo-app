import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Linking, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width } = Dimensions.get('window');

const events = [
    {
        id: 1,
        latitude: 42.2808,
        longitude: -83.7430,
        title: 'A&M Comedy Show',
        description:
            'Who, what, when, where, and why. Detailed Description. Tags: Entertainment, Nightlife. Share and Review',
        image: 'https://images.unsplash.com/photo-1547891654-e66ed71362af?q=80&w=800',
        time: '5pm',
        address: '1306W KL Avenue',
    },
    {
        id: 2,
        latitude: 42.3314,
        longitude: -83.0458,
        title: 'Dub Car Meet',
        description: 'Car enthusiasts meet up at the local spot.',
        image: 'https://images.unsplash.com/photo-1617478099951-b87347a835a8?q=80&w=800',
        time: '7pm',
        address: 'Downtown Detroit',
    },
];

export default function MapScreen() {
    const mapRef = useRef(null);
    const [region, setRegion] = useState({
        latitude: 44.3148,
        longitude: -85.6024,
        latitudeDelta: 6,
        longitudeDelta: 6,
    });
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [query, setQuery] = useState('');
    const [showSearchClear, setShowSearchClear] = useState(false);
    const [showMapsModal, setShowMapsModal] = useState(false);

    useEffect(() => {
        // After a short delay, animate to city (similar to web version)
        const t = setTimeout(() => {
            setRegion({ latitude: 42.3314, longitude: -83.0458, latitudeDelta: 0.2, longitudeDelta: 0.2 });
            if (mapRef.current && mapRef.current.animateToRegion) {
                mapRef.current.animateToRegion({ latitude: 42.3314, longitude: -83.0458, latitudeDelta: 0.2, longitudeDelta: 0.2 }, 1000);
            }
        }, 800);
        return () => clearTimeout(t);
    }, []);

    const onMarkerPress = (item) => {
        setSelectedEvent(item);
    };

    const openInGoogleMaps = (item) => {
        const queryStr = encodeURIComponent(`${item.title} ${item.address}`);
        const url = Platform.select({
            ios: `maps://?q=${queryStr}`,
            android: `geo:0,0?q=${queryStr}`,
            default: `https://www.google.com/maps/search/?api=1&query=${queryStr}`,
        });
        Linking.openURL(url).catch(() => {
            const web = `https://www.google.com/maps/search/?api=1&query=${queryStr}`;
            Linking.openURL(web);
        });
        setShowMapsModal(false);
    };

    const openInAppleMaps = (item) => {
        const queryStr = encodeURIComponent(`${item.title} ${item.address}`);
        const url = `http://maps.apple.com/?q=${queryStr}`;
        Linking.openURL(url).catch(() => {});
        setShowMapsModal(false);
    };

    const handleSearch = () => {
        if (!query.trim()) return;
        // No geocoding in this offline conversion — just show an alert placeholder
        alert(`Search for: ${query}`);
        setShowSearchClear(true);
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchWrap}>
                <Ionicons name="search" size={18} color="#9CA3AF" style={{ marginLeft: 12 }} />
                <TextInput
                    placeholder="Search for a location..."
                    value={query}
                    onChangeText={(t) => setQuery(t)}
                    onSubmitEditing={handleSearch}
                    style={styles.searchInput}
                />
                {query ? (
                    <TouchableOpacity onPress={() => { setQuery(''); setShowSearchClear(false); }} style={styles.clearBtn}>
                        <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                ) : null}
            </View>

            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={region}
            >
                {events.map((ev) => (
                    <Marker
                        key={ev.id}
                        coordinate={{ latitude: ev.latitude, longitude: ev.longitude }}
                        onPress={() => onMarkerPress(ev)}
                    />
                ))}
            </MapView>

            {/* Bottom sheet style event details - modal */}
            <Modal visible={!!selectedEvent} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.sheet}>
                        <View style={styles.sheetHandle} />
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedEvent(null)}>
                            <Ionicons name="close" size={20} color="#374151" />
                        </TouchableOpacity>
                        {selectedEvent && (
                            <View>
                                <Image source={{ uri: selectedEvent.image }} style={styles.sheetImage} />
                                <View style={styles.sheetContent}>
                                    <Text style={styles.sheetTitle}>{selectedEvent.title}</Text>
                                    <Text style={styles.sheetMeta}>{selectedEvent.address} • <Text style={{ color: '#ef4444' }}>{selectedEvent.time}</Text></Text>
                                    <Text style={styles.sheetDesc}>{selectedEvent.description}</Text>

                                    <View style={styles.sheetActions}>
                                        <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowMapsModal(true)}>
                                            <Ionicons name="navigate" size={16} color="#fff" />
                                            <Text style={styles.primaryBtnText}>Get Directions</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => alert('Added to itinerary (placeholder)')}>
                                            <Ionicons name="add" size={16} color="#ef4444" />
                                            <Text style={styles.secondaryBtnText}>Add to Itinerary</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Maps selection modal */}
            <Modal visible={showMapsModal} animationType="fade" transparent>
                <View style={styles.modalOverlayCentered}>
                    <View style={styles.mapsModal}>
                        <Text style={styles.mapsTitle}>Open in Maps</Text>
                        <Text style={styles.mapsSubtitle}>{selectedEvent?.title}</Text>

                        <TouchableOpacity style={[styles.mapsOption, { backgroundColor: '#2563EB' }]} onPress={() => openInGoogleMaps(selectedEvent)}>
                            <Text style={styles.mapsOptionText}>Open in Google Maps</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.mapsOption, { backgroundColor: '#111827' }]} onPress={() => openInAppleMaps(selectedEvent)}>
                            <Text style={styles.mapsOptionText}>Open in Apple Maps</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.mapsOption, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' }]} onPress={() => setShowMapsModal(false)}>
                            <Text style={[styles.mapsOptionText, { color: '#374151' }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    map: { flex: 1 },
    searchWrap: {
        position: 'absolute',
        top: 16,
        left: 12,
        right: 12,
        zIndex: 999,
        backgroundColor: '#fff',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 6,
    },
    searchInput: { flex: 1, paddingHorizontal: 12, fontSize: 16, color: '#111827' },
    clearBtn: { paddingHorizontal: 12 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.25)' },
    sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30, maxHeight: '80%' },
    sheetHandle: { width: 48, height: 6, backgroundColor: '#E5E7EB', borderRadius: 6, alignSelf: 'center', marginVertical: 8 },
    closeBtn: { position: 'absolute', right: 16, top: 12, zIndex: 10, backgroundColor: '#fff', padding: 6, borderRadius: 16 },
    sheetImage: { width: width, height: 180, resizeMode: 'cover' },
    sheetContent: { paddingHorizontal: 18, paddingTop: 12 },
    sheetTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 6 },
    sheetMeta: { color: '#6B7280', marginBottom: 8 },
    sheetDesc: { color: '#374151', lineHeight: 20, marginBottom: 12 },
    sheetActions: { flexDirection: 'row', gap: 12, marginTop: 6 },
    primaryBtn: { flex: 1, backgroundColor: '#ef4444', paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    primaryBtnText: { color: '#fff', marginLeft: 8, fontWeight: '700' },
    secondaryBtn: { flex: 1, backgroundColor: '#fff', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    secondaryBtnText: { color: '#ef4444', marginLeft: 8, fontWeight: '700' },
    modalOverlayCentered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
    mapsModal: { width: '86%', backgroundColor: '#fff', borderRadius: 14, padding: 18, alignItems: 'center' },
    mapsTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
    mapsSubtitle: { color: '#6B7280', marginBottom: 12 },
    mapsOption: { width: '100%', paddingVertical: 12, borderRadius: 12, marginTop: 8, alignItems: 'center', justifyContent: 'center' },
    mapsOptionText: { color: '#fff', fontWeight: '700' },
});