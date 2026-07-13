import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DatabaseController } from '../data/controllers';

type Props = NativeStackScreenProps<RootStackParamList, 'FinishedTournament'>;

export const FinishedTournamentScreen = ({ route, navigation }: Props) => {
  const [tournament, setTournament] = useState<any>(null);

  useEffect(() => {
    const found = DatabaseController.getInstance()
      .getTournaments()
      .find(t => t.id === route.params.tournamentId);
    setTournament(found ?? null);
  }, [route.params.tournamentId]);

  if (!tournament) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Tournament not found</Text>
      </View>
    );
  }

  const matches = tournament.matches ?? {};
  const leaderboard = tournament.players
    .map((player: string) => {
      const playerMatches = matches[player] ?? [];
      const wins = playerMatches.filter(
        (m: any) => m.result === 'win',
      ).length;
      const rating = playerMatches[0]?.rating;
      return { player, wins, rating };
    })
    .sort((a: any, b: any) => b.wins - a.wins);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>{'< Back'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Tournament Finished</Text>
      <Text style={styles.subtitle}>
        {tournament.initTime / 1000 / 60}+{tournament.increment / 1000} •{' '}
        {tournament.duration / (60 * 60 * 1000)}H
      </Text>

      <View style={styles.leaderboard}>
        {leaderboard.map(
          (entry: { player: string; wins: number; rating?: number }, i: number) => (
            <View key={entry.player} style={styles.row}>
              <Text style={styles.rank}>{i + 1}.</Text>
              <Text style={styles.player}>
                {entry.player}
                {entry.rating ? ` (${entry.rating})` : ''}
              </Text>
              <Text style={styles.wins}>{entry.wins}</Text>
            </View>
          ),
        )}
      </View>
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
  back: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    marginBottom: 24,
  },
  leaderboard: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  rank: {
    width: 28,
    fontSize: 16,
    fontWeight: '600',
  },
  player: {
    flex: 1,
    fontSize: 16,
  },
  wins: {
    fontSize: 16,
    fontWeight: '600',
  },
});
