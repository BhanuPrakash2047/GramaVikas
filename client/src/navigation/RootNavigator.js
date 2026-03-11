import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../hooks';
import { validateToken } from '../store/slices/authSlice';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SplashScreen from '../screens/SplashScreen';

const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, tokenValidating } = useAppSelector(
    (state) => state.auth
  );

  // Validate token on mount
  React.useEffect(() => {
    if (token) {
      dispatch(validateToken());
    }
  }, [dispatch, token]);

  if (tokenValidating) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
