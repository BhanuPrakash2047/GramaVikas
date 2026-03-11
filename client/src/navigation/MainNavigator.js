import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCREENS, COLORS } from '../constants';
import HomeScreen from '../screens/main/HomeScreen';
import DiagnosticsScreen from '../screens/main/DiagnosticsScreen';
import SchemesScreen from '../screens/main/SchemesScreen';
import SchemeDetailScreen from '../screens/main/SchemeDetailScreen';
import EmergencyScreen from '../screens/main/EmergencyScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import FloatingSOSButton from '../components/FloatingSOSButton';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder screens (todo: replace with actual implementations)
const PlaceholderScreen = ({ name }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{name} Screen</Text>
    </View>
  );
};

// Home Stack
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: { backgroundColor: COLORS.background },
      headerTintColor: COLORS.textPrimary,
      headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen
      name="HomeBase"
      component={HomeScreen}
      options={{ title: 'GramVikash' }}
    />
    <Stack.Screen
      name={SCREENS.SCHEME_DETAIL}
      component={SchemeDetailScreen}
      options={{
        headerShown: true,
        headerTitle: 'Scheme Details',
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerShadowVisible: false,
      }}
    />
  </Stack.Navigator>
);

// Schemes Stack
const SchemesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="SchemesBase"
      component={SchemesScreen}
    />
    <Stack.Screen
      name={SCREENS.SCHEME_DETAIL}
      component={SchemeDetailScreen}
      options={{
        headerShown: true,
        headerTitle: 'Scheme Details',
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerShadowVisible: false,
      }}
    />
  </Stack.Navigator>
);

// Diagnostics Stack
const DiagnosticsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="DiagnosticsBase"
      component={DiagnosticsScreen}
    />
  </Stack.Navigator>
);

// Emergency Stack
const EmergencyStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="EmergencyBase"
      component={EmergencyScreen}
    />
    <Stack.Screen
      name={SCREENS.SCHEME_DETAIL}
      component={SchemeDetailScreen}
      options={{
        headerShown: true,
        headerTitle: 'Scheme Details',
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerShadowVisible: false,
      }}
    />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: { backgroundColor: COLORS.background },
      headerTintColor: COLORS.textPrimary,
      headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen
      name="ProfileBase"
      component={ProfileScreen}
      options={{ title: 'My Profile' }}
    />
    <Stack.Screen
      name={SCREENS.SETTINGS}
      component={() => <PlaceholderScreen name="Settings" />}
      options={{ title: 'Settings' }}
    />
    <Stack.Screen
      name={SCREENS.NOTIFICATION}
      component={() => <PlaceholderScreen name="Notifications" />}
      options={{ title: 'Notifications' }}
    />
  </Stack.Navigator>
);

// Main Navigator with Bottom Tabs
const MainNavigator = () => {
  return (
    <View style={{ flex: 1 }}>
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          height: 64,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name={SCREENS.HOME}
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.SCHEMES}
        component={SchemesStack}
        options={{
          tabBarLabel: 'Schemes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="gift" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.DIAGNOSTICS}
        component={DiagnosticsStack}
        options={{
          tabBarLabel: 'Diagnostics',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.EMERGENCY}
        component={EmergencyStack}
        options={{
          tabBarLabel: 'Emergency',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="alert-circle" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.PROFILE}
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
    <FloatingSOSButton />
    </View>
  );
};

export default MainNavigator;
