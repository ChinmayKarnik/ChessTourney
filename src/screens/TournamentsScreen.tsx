import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
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
import calendarIcon from '../images/calendar.png';
import clockIcon from '../images/clock-thick-white.png';
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

const formatDuration = (ms: number): string => {
  const totalMinutes = ms / 60000;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes} min`;
  }
  const hourText = `${hours} hr`;
  return minutes === 0 ? hourText : `${hourText} ${minutes} min`;
};

const formatDateShort = (ms: number): string =>
  new Date(ms).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const TournamentsScreen = ({ navigation }: Props) => {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [isListAtBottom, setIsListAtBottom] = useState(false);
  const { top } = useSafeAreaInsets();

  const handleListScroll = (event: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    setIsListAtBottom(contentOffset.y + layoutMeasurement.height >= contentSize.height - 16);
  };

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

      <View style={styles.listWrapper}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleListScroll}
        scrollEventThrottle={16}
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

                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>
                      {tournament.players.length} PLAYERS
                    </Text>
                    <Text
                      style={[
                        styles.timeControlText,
                        { color: status.accent },
                      ]}
                    >
                      {formatTimeControl(
                        tournament.initTime,
                        tournament.increment,
                      )}
                    </Text>
                  </View>

                  <View style={styles.scheduleRow}>
                    <View style={styles.scheduleItem}>
                      <Image source={calendarIcon} style={styles.scheduleIcon} />
                      <Text style={styles.scheduleText}>
                        {formatDateShort(
                          isFinished ? endTime : tournament.startTime,
                        )}
                      </Text>
                    </View>
                    <View style={styles.scheduleItem}>
                      <Image source={clockIcon} style={styles.scheduleIcon} />
                      <Text style={styles.scheduleText}>
                        {formatDuration(tournament.duration)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.separator} />

                  {isUpcoming || topRows.length === 0 ? (
                    tournament.players.map((player: string) => (
                      <View key={player} style={styles.row}>
                        <View style={styles.rankBadgeSlot}>
                          <View
                            style={[
                              styles.rankDot,
                              { backgroundColor: status.accent },
                            ]}
                          />
                        </View>
                        <Text style={styles.rowLabel} numberOfLines={1}>
                          {player}
                        </Text>
                      </View>
                    ))
                  ) : (
                    topRows.map(
                      (entry: { player: string; points: number }, i: number) => (
                        <View key={entry.player} style={styles.row}>
                          <View
                            style={[
                              styles.rankBadge,
                              { backgroundColor: status.accent },
                            ]}
                          >
                            <Text style={styles.rankBadgeText}>{i + 1}</Text>
                          </View>
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
      {!isListAtBottom && (
        <View style={styles.listBottomFade} pointerEvents="none">
          <Svg height="100%" width="100%">
            <Defs>
              <LinearGradient id="tournamentListFade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#1c2238" stopOpacity="0" />
                <Stop offset="1" stopColor="#1c2238" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#tournamentListFade)" />
          </Svg>
        </View>
      )}
      </View>
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
  listWrapper: {
    flex: 1,
    position: 'relative',
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  listBottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: normalizeHeight(72),
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9198b5',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  timeControlText: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  scheduleIcon: {
    width: 12,
    height: 12,
    marginRight: 5,
    tintColor: '#dde1f2',
    resizeMode: 'contain',
  },
  scheduleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dde1f2',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  rankBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1c2238',
  },
  rankBadgeSlot: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    fontFamily: 'RobotoMono-Regular',
    fontSize: 13,
  },
});
