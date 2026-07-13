import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PlayerMatches'>;

export const PlayerMatchesScreen = ({ route, navigation }: Props) => {
  const { player, matches } = route.params;
  const now = Date.now();

  const visibleMatches = (matches ?? [])
    .filter((m: any) => m.playedAt <= now)
    .sort((a: any, b: any) => b.playedAt - a.playedAt)
    .map((m: any) => ({
      ...m,
      isOngoing: !m.finishedAt || m.finishedAt > now,
    }));

  const statusLabel = (m: any) => {
    if (m.isOngoing) return 'Ongoing';
    if (m.result === 'win') return 'Won';
    if (m.result === 'loss') return 'Lost';
    return 'Draw';
  };

  const statusStyle = (m: any) => {
    if (m.isOngoing) return styles.statusOngoing;
    if (m.result === 'win') return styles.statusWin;
    if (m.result === 'loss') return styles.statusLoss;
    return styles.statusDraw;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>{'< Back'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{player}</Text>
      <Text style={styles.subtitle}>Matches</Text>

      <ScrollView style={styles.scroll}>
        {visibleMatches.length === 0 ? (
          <Text style={styles.emptyText}>No matches yet</Text>
        ) : (
          visibleMatches.map((m: any) => (
            <View key={m.id} style={styles.matchRow}>
              <View style={styles.matchHeader}>
                <Text style={styles.matchText}>
                  vs {m.opponent} ({m.speed})
                </Text>
                <Text style={[styles.status, statusStyle(m)]}>
                  {statusLabel(m)}
                </Text>
              </View>
              <Text style={styles.matchTime}>
                Started at {new Date(m.playedAt).toLocaleTimeString()}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
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
    marginBottom: 24,
  },
  scroll: {
    width: '100%',
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
  },
  matchRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchText: {
    fontSize: 16,
  },
  matchTime: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusWin: {
    color: '#2e7d32',
  },
  statusLoss: {
    color: '#c62828',
  },
  statusDraw: {
    color: '#666666',
  },
  statusOngoing: {
    color: '#007AFF',
  },
});
