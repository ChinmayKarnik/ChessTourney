import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DatabaseController, LichessController } from '../data/controllers';
import {
  getMatchColor,
  getMatchFen,
  getNextPairing,
  setLatestDataForTournament,
} from '../utils/tournamentUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'OngoingTournament'>;

const getPairingUrl = (
  tournament: any,
  player: string,
  pairing: string,
  color: 'white' | 'black',
): string =>
  color === 'white'
    ? LichessController.getInstance().buildChallengeLink(
        pairing,
        getMatchFen(tournament, player, pairing, color),
        tournament.initTime,
        tournament.increment,
        'white',
      )
    : 'https://lichess.org/';

export const OngoingTournamentScreen = ({ route, navigation }: Props) => {
  const [tournament, setTournament] = useState<any>(() =>
    DatabaseController.getInstance()
      .getTournaments()
      .find(t => t.id === route.params.tournamentId),
  );
  const [now, setNow] = useState(Date.now());
  const [username, setUsername] = useState('');
  const [isPlayerIdle, setIsPlayerIdle] = useState(false);
  const [nextPairing, setNextPairing] = useState<string | null>(null);
  const [nextPairingColor, setNextPairingColor] = useState<
    'white' | 'black' | null
  >(null);
  const redirectedPairingRef = useRef<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    DatabaseController.getInstance().loadUsername().then(setUsername);
  }, []);

  useEffect(() => {
    if (!tournament || !username) {
      return;
    }
    const ongoingMatches = tournament.ongoingMatches ?? {};
    const idle = (ongoingMatches[username] ?? []).length === 0;
    setIsPlayerIdle(idle);

    const pairing = idle ? getNextPairing(tournament, username) : null;
    setNextPairing(pairing);
    setNextPairingColor(
      pairing ? getMatchColor(tournament, username, pairing) : null,
    );
  }, [tournament, username]);

  useEffect(() => {
    if (!tournament || !nextPairing || !nextPairingColor) {
      redirectedPairingRef.current = null;
      return;
    }
    if (redirectedPairingRef.current === nextPairing) {
      return;
    }
    redirectedPairingRef.current = nextPairing;
    Linking.openURL(
      getPairingUrl(tournament, username, nextPairing, nextPairingColor),
    );
  }, [tournament, username, nextPairing, nextPairingColor]);

  useEffect(() => {
    if (tournament && now >= tournament.startTime + tournament.duration) {
      navigation.replace('FinishedTournament', {
        tournamentId: route.params.tournamentId,
      });
    }
  }, [now, tournament, navigation, route.params.tournamentId]);

  useEffect(() => {
    const interval = setInterval(async () => {
      await setLatestDataForTournament(route.params.tournamentId);
      setTournament(
        DatabaseController.getInstance()
          .getTournaments()
          .find(t => t.id === route.params.tournamentId),
      );
    }, 30000);
    return () => clearInterval(interval);
  }, [route.params.tournamentId]);

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

  const matches = tournament.matches ?? {};
  const points = tournament.points ?? {};
  const leaderboard = tournament.players
    .map((player: string) => {
      const playerMatches = matches[player] ?? [];
      const rating = playerMatches[0]?.rating;
      return { player, points: points[player] ?? 0, rating };
    })
    .sort((a: any, b: any) => a.player.localeCompare(b.player));

  const ongoingMatches = tournament.ongoingMatches ?? {};
  const seenMatchIds = new Set<string>();
  const ongoingMatchesList = tournament.players
    .flatMap((player: string) =>
      (ongoingMatches[player] ?? []).map((m: any) => ({ player, ...m })),
    )
    .filter((m: any) => {
      if (seenMatchIds.has(m.id)) {
        return false;
      }
      seenMatchIds.add(m.id);
      return true;
    });

  const elapsedMs = Math.max(0, now - tournament.startTime);
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const elapsed = [hours, minutes, seconds]
    .map(unit => String(unit).padStart(2, '0'))
    .join(':');

  return (
    <View style={styles.container}>
      {backButton}
      <Text style={styles.title}>{tournament.name}</Text>
      <Text style={styles.subtitle}>Ongoing Tournament</Text>

      <Text style={styles.timerLabel}>
        Started at {new Date(tournament.startTime).toLocaleTimeString()}
      </Text>
      <Text style={styles.timer}>{elapsed}</Text>

      <ScrollView style={styles.scroll}>
        <View style={styles.leaderboard}>
          {leaderboard.map(
            (entry: { player: string; points: number; rating?: number }, i: number) => (
              <TouchableOpacity
                key={entry.player}
                style={styles.row}
                onPress={() =>
                  navigation.navigate('PlayerMatches', {
                    player: entry.player,
                    matches: matches[entry.player] ?? [],
                  })
                }
              >
                <Text style={styles.rank}>{i + 1}.</Text>
                <Text style={styles.player}>
                  {entry.player}
                  {entry.rating ? ` (${entry.rating})` : ''}
                </Text>
                <Text style={styles.points}>{entry.points}</Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        {isPlayerIdle ? (
          <Text style={styles.idleText}>
            You are idle
            {nextPairing ? ` — next pairing: ${nextPairing}` : ''}
          </Text>
        ) : null}

        {isPlayerIdle && nextPairing && nextPairingColor === 'white' ? (
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() =>
              Linking.openURL(
                getPairingUrl(tournament, username, nextPairing, 'white'),
              )
            }
          >
            <Text style={styles.ctaButtonText}>Challenge {nextPairing}</Text>
          </TouchableOpacity>
        ) : null}

        {isPlayerIdle && nextPairing && nextPairingColor === 'black' ? (
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() =>
              Linking.openURL(
                getPairingUrl(tournament, username, nextPairing, 'black'),
              )
            }
          >
            <Text style={styles.ctaButtonText}>
              Waiting for {nextPairing} to challenge you — open Lichess
            </Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.sectionTitle}>Ongoing Matches</Text>
        {ongoingMatchesList.length === 0 ? (
          <Text style={styles.emptyText}>No matches in progress</Text>
        ) : (
          ongoingMatchesList.map((m: any) => (
            <TouchableOpacity
              key={`${m.player}-${m.id}`}
              style={styles.matchRow}
              onPress={() => Linking.openURL(`https://lichess.org/${m.id}`)}
            >
              <Text style={styles.matchText}>
                {m.player} vs {m.opponent} ({m.speed})
              </Text>
              <Text style={styles.matchTime}>
                Started at {new Date(m.playedAt).toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
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
  },
  timerLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  timer: {
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
    marginBottom: 24,
  },
  scroll: {
    width: '100%',
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
  points: {
    fontSize: 16,
    fontWeight: '600',
  },
  idleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d9822b',
    marginTop: 24,
  },
  ctaButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
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
  matchText: {
    fontSize: 16,
  },
  matchTime: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
});
