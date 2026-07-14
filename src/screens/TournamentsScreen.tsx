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
          setTournaments(loaded);
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

                  <Text style={styles.tournamentSubtitle}>
                    {tournament.players.length} players •{' '}
                    {formatTimeControl(tournament.initTime, tournament.increment)}
                  </Text>

                  <View style={styles.separator} />

                  {isUpcoming || topRows.length === 0 ? (
                    <Text style={styles.infoLine}>
                      Starts {new Date(tournament.startTime).toLocaleString()}
                    </Text>
                  ) : (
                    topRows.map((entry: { player: string; points: number }) => (
                      <View key={entry.player} style={styles.row}>
                        <Text style={styles.rowLabel} numberOfLines={1}>
                          {entry.player}
                        </Text>
                        <Text style={styles.rowValue}>{entry.points}</Text>
                      </View>
                    ))
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
  tournamentSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#9aa2bd',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 12,
    marginBottom: 8,
  },
  infoLine: {
    fontSize: 14,
    color: '#c7cce0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rowLabel: {
    flex: 1,
    marginRight: 8,
    fontSize: 15,
    color: '#e7ebf5',
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
