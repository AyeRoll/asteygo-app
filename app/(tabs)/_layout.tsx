import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function Layout() {
//   const insets = useSafeAreaInsets();

  // Custom tab button so we can render an active rounded box without
  // overflowing the tab bar and ensure inactive icons are visible.
  const CustomTabButton: React.FC<any> = ({ accessibilityState, onPress, routeName }) => {
    const focused = !!accessibilityState?.selected;

    const rn = (routeName || '').toLowerCase();
    let iconName: React.ComponentProps<typeof Ionicons>["name"] = 'home-outline';
    let label = '';
    if (rn.includes('index') || rn.includes('home') || rn === 'index') {
      iconName = focused ? 'home' : 'home-outline';
      label = 'Home';
    } else if (rn.includes('groups')) {
      iconName = focused ? 'people' : 'people-outline';
      label = 'Groups';
    } else if (rn.includes('map')) {
      iconName = focused ? 'map' : 'map-outline';
      label = 'Map';
    } else if (rn.includes('expense') || rn.includes('expenses')) {
      iconName = focused ? 'wallet' : 'wallet-outline';
      label = 'Expenses';
    } else if (rn.includes('profile') || rn.includes('user')) {
      iconName = focused ? 'person' : 'person-outline';
      label = 'Profile';
    }

    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={s.buttonContainer}>
        {focused ? (
          <View style={s.activeBox}>
            <Ionicons name={iconName} size={26} color="#fff" />
            <Text style={s.activeBoxLabel}>{label}</Text>
          </View>
        ) : (
          <View style={s.inactiveWrap}>
            <Ionicons name={iconName} size={22} color="#6b7280" />
            <Text style={s.inactiveLabel}>{label}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // A fully-controlled tab bar that maps navigation state to our custom buttons
  const CustomTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
    return (
      <View style={[s.tabBar, { paddingBottom: 20 }]}>
        {state.routes.map((route: any, index: number) => {
          const descriptor = descriptors[route.key];
          const focused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          return (
            <CustomTabButton
              key={route.key}
              accessibilityState={{ selected: focused }}
              onPress={onPress}
              routeName={route.name}
            />
          );
        })}
      </View>
    );
      };
      const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <View style={[s.bottomOverlay, { height: insets.bottom }]} />

    <Tabs
      // Use a custom tabBar renderer so we can fully control layout
      tabBar={(props) => <CustomTabBar {...props} />}
      
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          height: (Platform.OS === 'ios' ? 86 : 72) + 12,
          paddingBottom: 12,
          paddingTop: 6,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 6,
        },
      })}
    />
    </View>
  );
}

const s = StyleSheet.create({
  tabWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBox: {
    width: 70,
    height: 68,
    backgroundColor: '#ef4444',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  activeBoxLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
    textAlign: 'center',
    width: 72,
  },
  inactiveWrap: {
    minWidth: 70,
    minHeight: 72,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  inactiveLabel: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent", // you can change to match tab bg
  },
});