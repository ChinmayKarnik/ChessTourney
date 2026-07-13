import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DatabaseController } from '../data/controllers';

type Props = NativeStackScreenProps<RootStackParamList, 'UpcomingTournament'>;

export const UpcomingTournamentScreen = ({ route, navigation }: Props) => {
  const [tournament] = useState<any>(() =>
    DatabaseController.getInstance()
      .getTournaments()
      .find(t => t.id === route.params.tournamentId),
  );
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tournament && now >= tournament.startTime) {
      navigation.replace('OngoingTournament', {
        tournamentId: route.params.tournamentId,
      });
    }
  }, [now, tournament, navigation, route.params.tournamentId]);

  const backButton = (
    <TouchableOpacity
      style={styles.backButton}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.backButtonText}>{'< Back'}</Text>
    </TouchableOpacity>
  );

  if (!tournament) {
    return (
      <View style={styles.container}>
        {backButton}
        <Text style={styles.title}>Tournament not found</Text>
      </View>
    );
  }

  const remainingMs = Math.max(0, tournament.startTime - now);
  const remainingSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const countdown = [hours, minutes, seconds]
    .map(unit => String(unit).padStart(2, '0'))
    .join(':');

  return (
    <View style={styles.container}>
      {backButton}
      <Text style={styles.title}>{tournament.name}</Text>
      <Text style={styles.subtitle}>Upcoming Tournament</Text>

      <Text style={styles.timerLabel}>
        Starts at {new Date(tournament.startTime).toLocaleString()}
      </Text>
      <Text style={styles.timerLabel}>Starting in</Text>
      <Text style={styles.timer}>{countdown}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 32,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  timerLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 16,
  },
  timer: {
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
});
