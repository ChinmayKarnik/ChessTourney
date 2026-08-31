import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DatabaseController } from '../data/controllers';
import {
  importFeedTournaments,
  setLatestDataForTournament,
} from '../utils/tournamentUtils';
import whiteLeftArrow from '../images/white-left-arrow.png';
import { normalize, normalizeWidth, normalizeHeight } from '../utils/normalize';

type TournamentsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Tournaments'
>;

type Props = {
  navigation: TournamentsScreenNavigationProp;
};

const STATUS = {
  Upcoming: { label: 'UPCOMING', accent: '#4f7ee8', badgeBg: '#3a5299' },
  Live: { label: 'LIVE', accent: '#34c759', badgeBg: '#1f6b3f' },
  Finished: { label: 'FINISHED', accent: '#D4AF37', badgeBg: '#5c4a1f' },
} as const;

const formatTimeControl = (initTime: number, increment: number): string =>
  `${initTime / 60000}+${increment / 1000}`;

const formatDateShort = (ms: number): string =>
  new Date(ms).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

// Dev-only: injects extra tournaments (one of each status) into the list so
// the screen can be styled without needing real upcoming/finished data.
// Never persisted — flip off before shipping.
const DEBUG_SHOW_FAKE_TOURNAMENTS = true;

const DEBUG_TOURNAMENTS = [
  {
    id: 'debug-upcoming-1',
    name: 'Winter Blitz Cup',
    players: ['BlindFork', 'HarshB20000', 'kkr19', 'rajjayavant'],
    startTime: Date.now() + 2 * 24 * 60 * 60 * 1000,
    duration: 60 * 60 * 1000,
    initTime: 180000,
    increment: 1000,
  },
  {
    id: 'debug-finished-1',
    name: 'Rapid Showdown',
    players: ['BlindFork', 'HarshB20000', 'kkr19', 'rajjayavant'],
    startTime: Date.now() - 3 * 24 * 60 * 60 * 1000,
    duration: 60 * 60 * 1000,
    initTime: 600000,
    increment: 5000,
    leaderboard: [
      { player: 'kkr19', points: 14 },
      { player: 'rajjayavant', points: 10 },
      { player: 'HarshB20000', points: 6 },
      { player: 'BlindFork', points: 4 },
    ],
  },
];

export const TournamentsScreen = ({ navigation }: Props) => {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const { top } = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      DatabaseController.getInstance()
        .loadTournaments()
        .then(() => importFeedTournaments())
        .then(() => {
          const loaded = DatabaseController.getInstance().getTournaments();
          setTournaments(
            DEBUG_SHOW_FAKE_TOURNAMENTS
              ? [...loaded, ...DEBUG_TOURNAMENTS]
              : loaded,
          );
          if (loaded[0]) {
            setLatestDataForTournament(loaded[0].id);
          }
        });
    }, []),
  );

  return (
    <View style={styles.page}>
      <View style={[styles.header, { paddingTop: top }]}>
        <TouchableOpacity
          style={[styles.backButton, { top: top + normalizeHeight(6) }]}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          onPress={() => navigation.goBack()}
        >
          <Image style={styles.backIcon} source={whiteLeftArrow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tournaments</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {tournaments.length === 0 ? (
          <Text style={styles.emptyText}>No tournaments yet</Text>
        ) : (
          tournaments.map(tournament => {
            const endTime = tournament.startTime + tournament.duration;
            const now = Date.now();
            const isUpcoming = tournament.startTime > now;
            const isFinished = endTime <= now;
            const screen = isUpcoming
              ? 'UpcomingTournament'
              : isFinished
              ? 'FinishedTournament'
              : 'OngoingTournament';
            const status = isUpcoming
              ? STATUS.Upcoming
              : isFinished
              ? STATUS.Finished
              : STATUS.Live;

            const leaderboard = tournament.leaderboard ?? [];
            const topRows = leaderboard.slice(0, 3);

            return (
              <TouchableOpacity
                key={tournament.id}
                activeOpacity={0.85}
                style={styles.card}
                onPress={() =>
                  navigation.navigate(screen, { tournamentId: tournament.id })
                }
              >
                <View
                  style={[styles.accentBar, { backgroundColor: status.accent }]}
                />

                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.tournamentName} numberOfLines={1}>
                      {tournament.name}
                    </Text>
                    <View
                      style={[styles.badge, { backgroundColor: status.badgeBg }]}
                    >
                      <Text style={styles.badgeText}>{status.label}</Text>
                    </View>
                  </View>

                  <View style={styles.chipRow}>
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>
                        {tournament.players.length} players
                      </Text>
                    </View>
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>
                        {formatTimeControl(
                          tournament.initTime,
                          tournament.increment,
                        )}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.scheduleLine}>
                    {isUpcoming ? 'Starts ' : isFinished ? 'Ended ' : 'Started '}
                    {formatDateShort(
                      isFinished ? endTime : tournament.startTime,
                    )}
                    {' · '}
                    {tournament.duration / 60000} min
                  </Text>

                  <View style={styles.separator} />

                  {isUpcoming || topRows.length === 0 ? (
                    <View style={styles.participantsRow}>
                      {tournament.players.map((player: string) => (
                        <View key={player} style={styles.participantChip}>
                          <Text style={styles.participantChipText}>
                            {player}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    topRows.map(
                      (entry: { player: string; points: number }, i: number) => (
                        <View key={entry.player} style={styles.row}>
                          <Text style={styles.rowRank}>{i + 1}</Text>
                          <Text style={styles.rowLabel} numberOfLines={1}>
                            {entry.player}
                          </Text>
                          <View
                            style={[
                              styles.pointsPill,
                              { borderColor: status.accent },
                            ]}
                          >
                            <Text
                              style={[
                                styles.pointsPillText,
                                { color: status.accent },
                              ]}
                            >
                              {entry.points}
                            </Text>
                          </View>
                        </View>
                      ),
                    )
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#1c2238',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#242a41',
    borderBottomWidth: 1,
    borderBottomColor: '#444b5f',
    paddingBottom: normalizeHeight(12),
  },
  backButton: {
    position: 'absolute',
    left: normalizeWidth(16),
  },
  backIcon: {
    width: normalizeWidth(9),
    height: normalizeWidth(9) * (86.0 / 51.0),
    aspectRatio: 51.0 / 86.0,
    resizeMode: 'stretch',
  },
  headerTitle: {
    fontSize: normalize(18),
    letterSpacing: 1,
    fontWeight: '700',
    color: '#fefefe',
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyText: {
    color: '#9aa2bd',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: '#252d47',
    borderWidth: 1,
    borderColor: '#3d4563',
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  accentBar: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tournamentName: {
    flex: 1,
    marginRight: 8,
    fontSize: 19,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#c7cce0',
  },
  scheduleLine: {
    marginTop: 8,
    fontSize: 12,
    color: '#7a819c',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 12,
    marginBottom: 8,
  },
  participantsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  participantChip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  participantChipText: {
    fontSize: 13,
    color: '#c7cce0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  rowRank: {
    width: 18,
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7291',
  },
  rowLabel: {
    flex: 1,
    marginRight: 8,
    fontSize: 15,
    color: '#e7ebf5',
  },
  pointsPill: {
    minWidth: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pointsPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
