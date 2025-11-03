import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import AccountScreen from './src/screens/AccountScreen';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';
import theme from './src/config/theme';

/**
 * LPG Gas Finder App - Main Navigation Setup
 * Integrated with backend authentication
 * Features: Location-based station finder, map view, distance filter
 */

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeList" component={HomeScreen} />
    </Stack.Navigator>
  );
}

function MapStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FF6B6B',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="MapView"
        component={MapScreen}
        options={{ title: 'Station Map' }}
      />
    </Stack.Navigator>
  );
}

function SubscriptionStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FF6B6B',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="SubscriptionView"
        component={SubscriptionScreen}
        options={{ title: 'Plans & Pricing' }}
      />
    </Stack.Navigator>
  );
}

function AccountStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FF6B6B',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="AccountView"
        component={AccountScreen}
        options={{ title: 'Account & Wallet' }}
      />
    </Stack.Navigator>
  );
}

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let isIonic = true;

          if (route.name === 'Home') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Plans') {
            iconName = focused ? 'crown' : 'crown-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'wallet' : 'wallet-outline';
            isIonic = false;
          }

          if (isIonic) {
            return <Ionicons name={iconName} size={size} color={color} />;
          } else {
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#EEE',
          paddingBottom: 20,
          paddingTop: 8,
          height: 80,
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Stations',
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapStackNavigator}
        options={{
          tabBarLabel: 'Map',
        }}
      />
      <Tab.Screen
        name="Plans"
        component={SubscriptionStackNavigator}
        options={{
          tabBarLabel: 'Plans',
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountStackNavigator}
        options={{
          tabBarLabel: 'Account',
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Navigation based on authentication state
 * Shows auth screens (SignIn/SignUp) if user is not authenticated
 * Shows main app if user is authenticated
 */
function RootNavigator() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.secondary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {user ? (
          // User is authenticated - show main app
          <Stack.Screen
            name="MainApp"
            component={BottomTabNavigator}
            options={{
              animationEnabled: false,
            }}
          />
        ) : (
          // User is not authenticated - show auth screens
          <Stack.Group
            screenOptions={{
              animationEnabled: true,
            }}
          >
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options={{
                animationEnabled: false,
              }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{
                animationEnabled: false,
              }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
