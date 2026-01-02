import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddressAutocomplete from '../../components/AddressAutocomplete';
import styles from "../../global";
import { useAuth } from "../../providers/AuthProvider";
import { Events } from '../../services/firestore';

const categories: string[] = [
  "Events",
  "Local Attractions",
  "Fine Dining",
  "Nightlife",
  "Adventure Sports",
  "Cultural Sites",
  "Shopping",
  "Nature & Parks",
  "Music & Concerts",
  "Food Tours",
  "Art & Museums",
  "Beach Activities",
];

const fallbackImages: Record<string, string> = {
  Events: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop",
  "Local Attractions": "https://images.unsplash.com/photo-1539650116574-75c0c6d73c1e?w=800&h=600&fit=crop",
  "Fine Dining": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
  Nightlife: "https://images.unsplash.com/photo-1547891654-e66ed71362af?w=800&h=600&fit=crop",
  "Adventure Sports": "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop",
  "Cultural Sites": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
  Shopping: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
  "Nature & Parks": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
  "Music & Concerts": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
  "Food Tours": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
  "Art & Museums": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
  "Beach Activities": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
};

// Types
type EventItem = {
  title: string;
  description?: string;
  address?: string;
  time?: string;
  category?: string;
  distance?: string;
  price?: number | null;
  image?: string;
};

type Recommendation = {
  title: string;
  category: string;
  distance?: string;
  time?: string;
  image?: string;
  address?: string;
  description?: string;
};

type QuickInfo = { temp: number | null; food: string | null; gas: string | null; hotel: string | null; ev?: string | null; location?: string };

type QuickInfoModal = { visible: boolean; type: 'weather' | 'food' | 'gas' | 'hotel' | 'ev' | null; data: any | null };


//-----------------MOCKS---------------------//




const generateMockEvents = (location: string, category: string): EventItem[] => {
  const base = [
    {
      title: `${category} Showcase`,
      description: `A popular ${category.toLowerCase()} happening near ${location}.`,
      address: `${location} Center`,
      time: "7:00 PM",
      category,
      distance: "0.8 mi",
      price: null,
    },
    {
      title: `${category} Pop-Up`,
      description: `Limited-time ${category.toLowerCase()} pop-up at ${location}.`,
      address: `${location} Market`,
      time: "6:30 PM",
      category,
      distance: "1.2 mi",
      price: 15,
    },
    {
      title: `${category} Afterparty`,
      description: `Late-night ${category.toLowerCase()} experience.`,
      address: `${location} District`,
      time: "10:00 PM",
      category,
      distance: "2.0 mi",
      price: 20,
    },
  ];
  return base.map((e) => ({ ...e, image: fallbackImages[e.category] || fallbackImages.Events }));
};

const generateMockQuickInfo = (location: string): QuickInfo => ({
  temp: 72,
  food: "Local Bistro",
  gas: "Shell Station",
  hotel: "City Hotel",
  ev: "ChargePoint",
  location,
});

const generateMockRecommendations = (location: string, category: string): Recommendation[] => {
  return [
    {
      title: `${category} Highlight`,
      category,
      distance: "1.5 mi",
      time: "Tickets recommended",
      image: fallbackImages[category] || fallbackImages.Events,
      address: location,
      description: `Must-see ${category.toLowerCase()} in ${location}.`,
    },
    {
      title: `${category} Classic`,
      category,
      distance: "2.1 mi",
      time: "11:00 AM",
      image: fallbackImages[category] || fallbackImages.Events,
      address: location,
      description: `Well-loved spot for ${category.toLowerCase()}.`,
    },
  ];
};

//-----------------DASHBOARD-------------------//

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Traveler';
  const firstName = displayName.split(' ')[0];
  const firstInitial = firstName.charAt(0).toUpperCase();
  const [activeCategory, setActiveCategory] = useState<string>("Events");
  const [nearbyItems, setNearbyItems] = useState<EventItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [food, setFood] = useState<EventItem[]>([]);
  const [quickInfo, setQuickInfo] = useState<QuickInfo>({ temp: null, food: null, gas: null, hotel: null });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddEvent, setShowAddEvent] = useState<boolean>(false);
  const [location, setLocation] = useState<string>("Detroit, MI");
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [quickInfoModal, setQuickInfoModal] = useState<QuickInfoModal>({ visible: false, type: null, data: null });
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null as any);
  const [locationPermission, setLocationPermission] = useState<string>('undetermined');
  const [hasNotifications, setHasNotifications] = useState<boolean>(false);
  const [bannerWidth, setBannerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const bannerAnimation = useRef(new Animated.Value(0)).current;
  const bannerLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const MARQUEE_GAP = 250; // Gap between duplicate texts

  const loadData = useCallback(() => {
    setIsLoading(true);
    // Mock network latency
    setTimeout(() => {
      setQuickInfo(generateMockQuickInfo(location));
      setNearbyItems(generateMockEvents(location, activeCategory));
      setRecommendations(generateMockRecommendations(location, activeCategory));
      setFood(generateMockEvents(location, "Fine Dining"));
      setIsLoading(false);
    }, 500);
  }, [activeCategory, location]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Banner animation effect (starts once sizes are known)
  useEffect(() => {
    if (bannerWidth > 0 && textWidth > 0) {
      bannerLoopRef.current?.stop?.();
      bannerAnimation.setValue(0);
      const distance = bannerWidth + (textWidth * 2)+ MARQUEE_GAP; // off-right to off-left
      const duration = Math.max(7000, Math.round(distance * 15)); // ~15ms per px, min 6s
      
      
      
      const loop = Animated.loop(
        Animated.timing(bannerAnimation, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        })
      );
      bannerLoopRef.current = loop;
      loop.start();
    }
    return () => {
      bannerLoopRef.current?.stop?.();
    };
  }, [bannerWidth, textWidth]);

  // Check and request location permissions
  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status);
    } catch (error) {
      console.log('Error checking location permission:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status === 'granted') {
        Alert.alert('Success!', 'Location access granted. You can now get real-time updates.');
        // Optionally get current location here
        getCurrentLocation();
      } else {
        Alert.alert('Permission Denied', 'Location access is needed for real-time updates.');
      }
    } catch (error) {
      console.log('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      // You can reverse geocode here to get city name
      console.log('Current location:', location);
    } catch (error) {
      console.log('Error getting current location:', error);
    }
  };

  const getNotificationStatus = async () => {
    
  }

  // Banner animation effect (starts once sizes are known)
  // useEffect(() => {
  //   if (bannerWidth > 0 && textWidth > 0) {
  //     // Stop previous loop if running
  //     (bannerLoopRef as any)?.current?.stop?.();
  //     bannerAnimation.setValue(0);
  //     const distance = bannerWidth + textWidth; // travel from off-left to off-right
  //     const duration = Math.max(4000, Math.round(distance * 12)); // ~12ms per px, min 4s
  //     const loop = Animated.loop(
  //       Animated.timing(bannerAnimation, {
  //         toValue: 1,
  //         duration,
  //         useNativeDriver: true,
  //       })
  //     );
  //     (bannerLoopRef as any).current = loop;
  //     loop.start();
  //   }
  //   return () => {
  //     (bannerLoopRef as any)?.current?.stop?.();
  //   };
  // }, [bannerWidth, textWidth]);

  const handleQuickInfoClick = (type: 'weather' | 'food' | 'gas' | 'hotel' | 'ev') => {
    // Provide mocked content depending on type
    if (type === "weather") {
      setQuickInfoModal({ visible: true, type, data: { temp: quickInfo.temp, condition: "Partly Cloudy", hourly: ["1pm: 72°F", "2pm: 73°F", "3pm: 71°F"] } });
    } else if (type === "food") {
      setQuickInfoModal({ visible: true, type, data: [{ name: quickInfo.food, address: "123 Main St", distance: "0.8 mi" }] });
    } else if (type === "gas") {
      setQuickInfoModal({ visible: true, type, data: [{ name: quickInfo.gas, address: "456 Fuel Rd", distance: "0.6 mi" }] });
    } else if (type === "hotel") {
      setQuickInfoModal({ visible: true, type, data: [{ name: quickInfo.hotel, address: "789 Stay Ave", distance: "1.2 mi" }] });
    } else if (type === 'ev') {
      setQuickInfoModal({ visible: true, type, data: [{ name: quickInfo.ev || 'ChargePoint', address: '321 Energy Ln', distance: '0.5 mi' }] });
    }
  };

  const handleAddEvent = async (newEvent: EventItem) => {
    setNearbyItems((prev) => [newEvent, ...prev]);
    // Fire-and-forget save to Firestore (non-blocking UI)
    try {
      await Events.create({
        title: newEvent.title,
        description: newEvent.description,
        address: newEvent.address,
        time: newEvent.time,
        price: newEvent.price ?? null,
        category: newEvent.category,
        image: newEvent.image,
      });
    } catch (e) {
      console.log('Failed to persist event to Firestore:', e);
    }
  };

  // const openMapApp = (addr?: string) => {
  //   const encoded = encodeURIComponent(addr || location);
  //   const url = Platform.select({
  //     ios: `maps:0,0?q=${encoded}`,
  //     android: `geo:0,0?q=${encoded}`,
  //     default: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
  //   });
  //   Linking.openURL(url).catch(() => Alert.alert("Unable to open map"));
  // };

  const EventCard: React.FC<{ item: EventItem; onPress?: (e: EventItem) => void }> = ({ item, onPress }) => (
    <TouchableOpacity onPress={() => onPress && onPress(item)} style={localStyles.card}>
  <Image source={{ uri: item.image }} style={localStyles.cardImage} />
      <View style={localStyles.cardBody}>
        <Text style={localStyles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={localStyles.cardSubtitle} numberOfLines={1}>{item.address}</Text>
        <View style={localStyles.cardFooter}>
          <Text style={localStyles.cardTime}>{item.time}</Text>
          <Text style={localStyles.cardPrice}>{item.price ? `$${item.price}` : 'Free'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const insets = useSafeAreaInsets();

  return (
    // Main container with safe area padding
  <View style={[styles.safeArea, { paddingTop: insets.top, backgroundColor: '#f9fafb' }]}>
      <ScrollView contentContainerStyle={[combinedStyles.scrollViewContent, { paddingBottom: 32 + insets.bottom + 50 },]}>
        <View style={localStyles.headerRow}>

          <TouchableOpacity style={localStyles.notificationButton} onPress={() => router.push('../screens/Notifications')}>
            <View>
            <Ionicons 
              name={hasNotifications ? 'notifications' : 'notifications-outline'} 
              size={24} 
              color={hasNotifications ? '#ffd000ea' : '#6b7280'} 
              style={{ marginRight: 6 }}
            />
            {/* <Text style={localStyles.locationText}>{}</Text> */}
            {hasNotifications && (
              <View style={localStyles.notificationBadge}>
                <View style={localStyles.badgeDot} />
              </View>
              )}
            </View>
          </TouchableOpacity>

          {/* <TouchableOpacity 
            style={localStyles.locationButton} 
            onPress={locationPermission === 'granted' ? () => setShowLocationModal(true) : requestLocationPermission}
          >
            <Ionicons 
              name={locationPermission === 'granted' ? 'location' : 'location-outline'} 
              size={16} 
              color={locationPermission === 'granted' ? '#10b981' : '#6b7280'} 
              style={{ marginRight: 6 }}
            />
            <Text style={localStyles.locationText}>{location}</Text>
            {locationPermission !== 'granted' && (
              <Ionicons name="alert-circle" size={14} color="#ef4444" style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity> */}
          <Text style={localStyles.greeting}>Hi, {firstName}!</Text>
          <TouchableOpacity onPress={() => router.push('/Profile')} style={localStyles.profileAvatar}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{firstInitial}</Text>
          </TouchableOpacity>
        </View>

        <View style={localStyles.searchWrap}>
          <TextInput placeholder="I heard bigfoot is in Florida" placeholderTextColor="#9e9e9eff" style={localStyles.searchInput} />
        </View>

        <Text style={localStyles.heroTitle}>These travel plans aren't gonna organize themselves.
          {'\n'}<Text style={{ color: '#ef4444', fontWeight: '800', fontSize: 28 }}>Let's Asteygo.</Text>
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={localStyles.quickRow}>
          <TouchableOpacity onPress={() => handleQuickInfoClick('weather')} style={localStyles.quickPill}>
            <View style={{...localStyles.iconCircle}}>
              <Ionicons name="sunny-outline" size={30} color="#ffa200ff" />
              <Text style={localStyles.quickTitle}>{quickInfo.temp ? `${quickInfo.temp}°F` : '72°F'}</Text>
            </View>  
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleQuickInfoClick('food')} style={localStyles.quickPill}>
            <View style={localStyles.iconCircle}>
              <Ionicons name="restaurant-outline" size={30} color="#10b981" />
              <Text style={localStyles.quickTitle}>{quickInfo.food || 'Local Bistro'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleQuickInfoClick('gas')} style={localStyles.quickPill}>
            <View style={localStyles.iconCircle}>
              <Ionicons name="car-outline" size={30} color="#3b82f6" />
              <Text style={localStyles.quickTitle}>{quickInfo.gas || 'Shell'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleQuickInfoClick('ev')} style={localStyles.quickPill}>
            <View style={localStyles.iconCircle}>
              <Ionicons name="flash-outline" size={30} color="#00ff15ff" />
              <Text style={localStyles.quickTitle}>{quickInfo.ev || 'EV Charger'}</Text>          
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleQuickInfoClick('hotel')} style={localStyles.quickPill}>
            <View style={localStyles.iconCircle}>
              <Ionicons name="bed-outline" size={30} color="#8b5cf6" />
              <Text style={localStyles.quickTitle}>{quickInfo.hotel || 'Hotel'}</Text>          
            </View>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity 
          style={localStyles.infoBanner}
          onLayout={(e) => setBannerWidth(e.nativeEvent.layout.width)}
          onPress={() => setShowAddEvent(true)}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              localStyles.animatedTextContainer,
              {
                transform: [
                  {
                    translateX: bannerAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange:
                        bannerWidth > 0 && textWidth > 0
                          ? [-(bannerWidth + (textWidth * 2)), (textWidth / 3 + MARQUEE_GAP) * 3]
                          : [-350, 350],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* First text segment (measured) */}
             {/* First text segment (measured) */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }} onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}>
              <Ionicons name="megaphone-outline" size={16} color="#ef4444" style={{ marginRight: 8, marginLeft: 8, marginTop: 15,marginBottom: 15 }} />
              <Text style={localStyles.bannerText}> Tap to add event! </Text>
            </View>
            {/* Gap spacer */}
            <View style={{ width: MARQUEE_GAP }} />
            {/* Second text segment (duplicate) */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="sparkles-outline" size={16} color="#ef4444" style={{ marginRight: 8, marginLeft: 8, marginTop: 15,marginBottom: 15 }} />              
              <Text style={localStyles.bannerText}> Let's Asteygo </Text>
            </View>
            <View style={{ width: MARQUEE_GAP }} />
            {/* Third text segment (duplicate) */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="megaphone-outline" size={16} color="#ef4444" style={{ marginRight: 8, marginLeft: 8, marginTop: 15,marginBottom: 15 }} />              
              <Text style={localStyles.bannerText}> Tap to add event! </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

        <View>
          <Text style={localStyles.sectionTitle}>Categories</Text>
          <FlatList horizontal data={categories} keyExtractor={(i) => i} renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setActiveCategory(item)} style={[localStyles.catButton, activeCategory === item && localStyles.catButtonActive]}>
              <Text style={[localStyles.catText, activeCategory === item && { color: '#fff' }]}>{item}</Text>
            </TouchableOpacity>
          )} showsHorizontalScrollIndicator={false} />
        </View>

        <View style={localStyles.sectionHeader}>
          <Text style={localStyles.sectionTitle}>Soon Nearby</Text>
          <TouchableOpacity onPress={() => Alert.alert('See All', 'Navigate to see all')}>
            <Text style={{ color: '#ef4444' }}>See All</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <ActivityIndicator size="small" />
          </View>
        ) : (
          <FlatList
            horizontal
            data={nearbyItems}
            keyExtractor={(item, idx) => item.title + idx}
            renderItem={({ item }) => <EventCard item={item} onPress={setSelectedEvent} />}
            showsHorizontalScrollIndicator={false}
          />
        )}

        <Text style={[localStyles.sectionTitle, { marginTop: 18 }]}>{`${activeCategory} Recommendations`}</Text>
        <FlatList horizontal data={recommendations} keyExtractor={(i, idx) => i.title + idx} renderItem={({ item }) => <EventCard item={item} onPress={setSelectedEvent} />} showsHorizontalScrollIndicator={false} />

        <Text style={[localStyles.sectionTitle, { marginTop: 18 }]}>{`${getFoodSectionTitle(activeCategory)}`}</Text>
        <FlatList horizontal data={food} keyExtractor={(i, idx) => i.title + idx} renderItem={({ item }) => <EventCard item={item} onPress={setSelectedEvent} />} showsHorizontalScrollIndicator={false} />

        {/* Example usage of CategorySection + EventList components */}
        {/* <View style={{ marginTop: 18 }}> */}
          {/* <CategorySection name={activeCategory} onSave={(name, meta) => console.log('save category', name, meta)} /> */}
          {/* <EventList title={`${activeCategory} Items`} events={nearbyItems} onPress={(e) => setSelectedEvent(e)} />
        </View> */}

      </ScrollView>

      <AddEventModal
        visible={showAddEvent}
        onClose={() => setShowAddEvent(false)}
        onAdd={(e: EventItem) => { handleAddEvent(e); setShowAddEvent(false); }}
      />

      {/* <LocationModal
        visible={showLocationModal}
        currentLocation={location}
        onClose={() => setShowLocationModal(false)}
        onSetLocation={(loc: string) => { setLocation(loc); setShowLocationModal(false); }}
        openMapApp={openMapApp}
      /> */}

      <QuickInfoModal
        visible={quickInfoModal.visible}
        type={quickInfoModal.type}
        data={quickInfoModal.data}
        onClose={() => setQuickInfoModal({ visible: false, type: null, data: null })}
      />

      <EventDetailModal event={selectedEvent} visible={!!selectedEvent} onClose={() => setSelectedEvent(null)} />
    </View>
  );
}

function getFoodSectionTitle(category: string): string {
  const titles = {
    Events: 'Tastebud Worthy Eats',
    'Local Attractions': 'Local Favorites Near Attractions',
    'Fine Dining': 'Chef Recommended Spots',
  };
  return (titles as Record<string, string>)[category] || 'Tastebud Worthy Eats';
}

function AddEventModal({ visible, onClose, onAdd }: { visible: boolean; onClose: () => void; onAdd: (e: EventItem) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('7:00 PM');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Events');
  const [address, setAddress] = useState('');

  const handleSubmit = () => {
    const newEvent = {
      title: title || 'New Event',
      description,
      address: address || 'Your Location',
      time,
      category,
      distance: '0.1 mi',
      price: price ? Number(price) : null,
      image: fallbackImages[category] || fallbackImages.Events,
    };
    onAdd && onAdd(newEvent);
    setTitle(''); setDescription(''); setPrice(''); setTime('7:00 PM'); setCategory('Events');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={localStyles.modalOverlay}>
        <View style={localStyles.modalContent}>
          <Text style={localStyles.modalTitle}>Add New Event</Text>
          <TextInput placeholder="Event title" value={title} onChangeText={setTitle} style={localStyles.input} />
          <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={[localStyles.input, { height: 80 }]} multiline />
          <View style={{ marginTop: 8 }}>
            <AddressAutocomplete
              value={address}
              placeholder="Event address"
              onChange={(v) => setAddress(v)}
              onSelect={(v) => setAddress(v)}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <TextInput placeholder="Time" value={time} onChangeText={setTime} style={[localStyles.input, { flex: 1 }]} />
            <TextInput placeholder="Price" value={price} onChangeText={setPrice} style={[localStyles.input, { width: 100 }]} keyboardType="numeric" />
          </View>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <TouchableOpacity onPress={onClose} style={[localStyles.modalBtn, { backgroundColor: '#eee' }]}><Text>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={[localStyles.modalBtn, { backgroundColor: '#ef4444' }]}><Text style={{ color: '#fff' }}>Add Event</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}




// function LocationModal({ visible, onClose, currentLocation, onSetLocation, openMapApp }: { visible: boolean; onClose: () => void; currentLocation: string; onSetLocation: (loc: string) => void; openMapApp: (addr?: string) => void }) {
//   const [value, setValue] = useState(currentLocation);
//   useEffect(() => setValue(currentLocation), [currentLocation, visible]);
//   return (
//     <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
//       <View style={localStyles.modalOverlay}>
//         <View style={localStyles.modalContent}>
//           <Text style={localStyles.modalTitle}>Set Your Location</Text>
//           <View>
//             <AddressAutocomplete value={value} placeholder="City, State" onChange={(v) => setValue(v)} onSelect={(v) => setValue(v)} />
//           </View>
//           <TouchableOpacity onPress={() => { onSetLocation(value); }} style={[localStyles.modalBtn, { backgroundColor: '#ef4444' }]}><Text style={{ color: '#fff' }}>Set Location</Text></TouchableOpacity>
//           <View style={{ height: 12 }} />
//           <Text style={{ marginBottom: 8 }}>Open in map app</Text>
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//             <TouchableOpacity onPress={() => openMapApp(value)} style={[localStyles.modalBtn, { flex: 1, marginRight: 6 }]}><Text>Open Maps</Text></TouchableOpacity>
//             <TouchableOpacity onPress={() => openMapApp(value)} style={[localStyles.modalBtn, { flex: 1, marginLeft: 6 }]}><Text>Google</Text></TouchableOpacity>
//           </View>
//           <View style={{ flexDirection: 'row', marginTop: 8 }}>
//             <TouchableOpacity onPress={onClose} style={[localStyles.modalBtn, { backgroundColor: '#eee' }]}><Text>Close</Text></TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

function QuickInfoModal({ visible, type, data, onClose }: { visible: boolean; type: 'weather' | 'food' | 'gas' | 'hotel' | 'ev' | null; data: any; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={localStyles.modalOverlay}>
        <View style={localStyles.modalContent}>
          <Text style={localStyles.modalTitle}>{type === 'weather' ? 'Weather Forecast' : type === 'food' ? 'Nearby Restaurants' : type === 'gas' ? 'Nearby Gas Stations' : type === 'ev' ? 'EV Chargers Nearby' : 'Nearby Hotels'}</Text>
          {type === 'weather' ? (
            <View>
              <Text>Current: {data?.temp}°F</Text>
              <Text>Condition: {data?.condition}</Text>
              {data?.hourly?.map((h: string, i: number) => <Text key={i}>{h}</Text>)}
            </View>
          ) : (
            <View>
              {Array.isArray(data) && data.map((d, i) => (
                <View key={i} style={{ marginVertical: 6 }}>
                  <Text style={{ fontWeight: '700' }}>{d.name}</Text>
                  <Text>{d.address} • {d.distance}</Text>
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity onPress={onClose} style={[localStyles.modalBtn, { marginTop: 12 }]}><Text>Close</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function EventDetailModal({ event, visible, onClose }: { event: EventItem | null; visible: boolean; onClose: () => void }) {
  if (!event) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={localStyles.modalOverlay}>
        <View style={[localStyles.modalContent, { maxHeight: '85%' }]}>
          <Image source={{ uri: event.image }} style={{ width: '100%', height: 160, borderRadius: 12 }} />
          <Text style={[localStyles.modalTitle, { marginTop: 8 }]}>{event.title}</Text>
          <Text style={{ marginBottom: 8 }}>{event.address} • {event.distance}</Text>
          <Text style={{ color: '#666', marginBottom: 12 }}>{event.description}</Text>
          <TouchableOpacity onPress={onClose} style={[localStyles.modalBtn, { backgroundColor: '#ef4444' }]}><Text style={{ color: '#fff' }}>Close</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const combinedStyles = {
  ...styles,
  scrollViewContent: { ...(styles.safeArea ? {} : {}), padding: 16, paddingBottom: 32},
};

const localStyles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  notificationButton: {
    padding: 8,
    paddingLeft: 28,
    borderRadius: 12,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    elevation: 1,
  },
  badgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#f9fafb',
  },
  locationButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 8, 
    borderRadius: 12, 
    backgroundColor: '#fff', 
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  greeting: {
    alignSelf: 'center',
    padding: 8,
    fontWeight: '700',
    fontSize: 18,
    color: '#111827',
  },
  locationText: { fontWeight: '700' },
  profileAvatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  searchWrap: { marginTop: 8, marginBottom: 12 },
  searchInput: { backgroundColor: '#fff', height: 44, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#eee' },
  heroTitle: { fontSize: 28, fontWeight: '800', marginBottom: 24, marginTop: 8 },
  // New horizontal quick info styles
  quickRow: { paddingVertical: 4, paddingRight: 8, marginBottom: 8 },
  quickPill: { alignItems: 'center', marginRight: 14, minWidth: 76 },
  iconCircle: {
    backgroundColor: '#fff',        // bg-white
    padding: 12,                    // p-3 (3 * 4 = 12)
    borderRadius: 16,               // rounded-2xl
    // shadow-sm properties
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    // flex flex-col items-center gap-1
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,                        // gap-1 (1 * 4 = 4)
    // text-center is for text, applied via Text component
    width: 70, 
    height: 70,
    
    // width: 70, 
    // height: 70, 
    // borderRadius: 12, 
    // alignItems: 'center', 
    // justifyContent: 'center', 
    // backgroundColor: '#fff', 
    // borderWidth: 1, 
    // borderColor: '#e5e7eb',
    // shadowColor: '#000',
    // shadowOpacity: 0.04,
    // shadowOffset: { width: 0, height: 2 }, // bottom-only bias
    // shadowRadius: 2,
    // elevation: 1,
    // marginHorizontal: 4
  },
  quickTitle: { fontSize: 14, fontWeight: '700', marginTop: 6, marginBottom: 6, textAlign: 'center' },
  quickCaption: { fontSize: 11, color: '#6b7280' },
  // Legacy grid (unused now but kept for reference)
  quickGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  quickItem: { flex: 1, marginRight: 6, backgroundColor: '#fff', padding: 10, borderRadius: 12, alignItems: 'center' },
  quickLabel: { alignItems: 'center', fontWeight: '700', fontSize: 12 },
  quickSmall: { fontSize: 12, color: '#666' },
  infoBanner: { 
    backgroundColor: '#f8fafc', 
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 10, 
    marginBottom: 8,
    overflow: 'hidden',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: '50%',
    marginTop: -12, // Half of text height for perfect centering
  },
  bannerText: { 
    color: '#ef4444', 
    fontSize: 24, 
    fontWeight: '700' 
  },
  noteText: { fontSize: 12, color: '#9ca3af', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginTop: 12, marginBottom: 8 },
  catButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#eee' },
  catButtonActive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
  catText: { fontWeight: '600', fontSize: 12, color: '#374151' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  addButton: { backgroundColor: '#ef4444', padding: 8, borderRadius: 10 },
  card: { width: 240, borderRadius: 16, backgroundColor: '#fff', marginRight: 12, overflow: 'hidden' },
  cardImage: { width: '100%', height: 120 },
  cardBody: { padding: 10 },
  cardTitle: { fontWeight: '800', fontSize: 16 },
  cardSubtitle: { color: '#6b7280', fontSize: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  cardTime: { color: '#6b7280' },
  cardPrice: { color: '#ef4444', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 16},
  modalContent: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontWeight: '800', fontSize: 18, marginBottom: 8 },
  input: { backgroundColor: '#f9fafb', padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  modalBtn: { padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
});
