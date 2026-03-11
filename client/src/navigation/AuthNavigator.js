import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SCREENS, COLORS } from '../constants';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
        animationEnabled: true,
      }}
      initialRouteName={SCREENS.LOGIN}
    >
      <Stack.Screen
        name={SCREENS.LOGIN}
        component={LoginScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={SCREENS.REGISTER}
        component={RegisterScreen}
        options={{
          gestureEnabled: true,
          animationTypeForReplace: 'pop',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
