import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  HomeScreen,
  ProfileScreen,
  OngoingTournamentScreen,
  FinishedTournamentScreen,
} from '../screens';

export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  OngoingTournament: { tournamentId: string };
  FinishedTournament: { tournamentId: string };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Home" component={HomeScreen} />
        <RootStack.Screen name="Profile" component={ProfileScreen} />
        <RootStack.Screen
          name="OngoingTournament"
          component={OngoingTournamentScreen}
        />
        <RootStack.Screen
          name="FinishedTournament"
          component={FinishedTournamentScreen}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
