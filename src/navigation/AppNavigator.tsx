import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  HomeScreen,
  ProfileScreen,
  OngoingTournamentScreen,
  FinishedTournamentScreen,
  TournamentsScreen,
  CreateTournamentScreen,
  PlayerMatchesScreen,
} from '../screens';

export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Tournaments: undefined;
  CreateTournament: undefined;
  OngoingTournament: { tournamentId: string };
  FinishedTournament: { tournamentId: string };
  PlayerMatches: { player: string; matches: any[] };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Home" component={HomeScreen} />
        <RootStack.Screen name="Profile" component={ProfileScreen} />
        <RootStack.Screen name="Tournaments" component={TournamentsScreen} />
        <RootStack.Screen
          name="CreateTournament"
          component={CreateTournamentScreen}
        />
        <RootStack.Screen
          name="OngoingTournament"
          component={OngoingTournamentScreen}
        />
        <RootStack.Screen
          name="FinishedTournament"
          component={FinishedTournamentScreen}
        />
        <RootStack.Screen
          name="PlayerMatches"
          component={PlayerMatchesScreen}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
