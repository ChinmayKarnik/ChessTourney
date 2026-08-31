import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import whiteLeftArrow from '../images/white-left-arrow.png';
import { normalize, normalizeWidth, normalizeHeight } from '../utils/normalize';

type Props = NativeStackScreenProps<RootStackParamList, 'OngoingTournament'>;

const LIVE_ACCENT = '#34c759';
const LIVE_BADGE_BG = '#1f6b3f';

const TOURNAMENT_NAME = 'BlindFork Arena';
const STARTED_AT = '4:45 PM';
const ELAPSED = '00:24:52';

const LEADERBOARD = [
  { player: 'BlindFork', points: 7 },
  { player: 'kkr19', points: 4 },
  { player: 'HarshB20000', points: 3 },
  { player: 'rajjayavant', points: 1 },
];

const NEXT_PAIRING = 'HarshB20000';

const ONGOING_MATCHES = [
  { player: 'kkr19', opponent: 'HarshB20000', speed: 'blitz', startedAt: '5:02 PM' },
];

export const OngoingTournamentScreenDebug = ({ navigation }: Props) => {
  const { top } = useSafeAreaInsets();

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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {TOURNAMENT_NAME}
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusRow}>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
          <Text style={styles.startedText}>Started {STARTED_AT}</Text>
        </View>

        <Text style={styles.timerLabel}>TIME ELAPSED</Text>
        <Text style={styles.timer}>{ELAPSED}</Text>

        <View style={styles.separator} />

        <Text style={styles.sectionLabel}>STANDINGS</Text>
        <View style={styles.card}>
          {LEADERBOARD.map((entry, i) => (
            <View
              key={entry.player}
              style={[
                styles.row,
                i === LEADERBOARD.length - 1 && styles.rowLast,
              ]}
            >
              <View style={[styles.rankBadge, { backgroundColor: LIVE_ACCENT }]}>
                <Text style={styles.rankBadgeText}>{i + 1}</Text>
              </View>
              <Text style={styles.rowLabel} numberOfLines={1}>
                {entry.player}
              </Text>
              <View style={[styles.pointsPill, { borderColor: LIVE_ACCENT }]}>
                <Text style={[styles.pointsPillText, { color: LIVE_ACCENT }]}>
                  {entry.points}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.idleBanner}>
          <Text style={styles.idleText}>
            You're idle — next pairing: {NEXT_PAIRING}
          </Text>
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={() => {}}>
          <Text style={styles.ctaButtonText}>Challenge {NEXT_PAIRING}</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionLabel, styles.matchesLabel]}>ONGOING MATCHES</Text>
        {ONGOING_MATCHES.map(m => (
          <View key={`${m.player}-${m.opponent}`} style={styles.matchRow}>
            <View style={styles.matchRowTop}>
              <View style={styles.liveDot} />
              <Text style={styles.matchText}>
                {m.player} vs {m.opponent} ({m.speed})
              </Text>
            </View>
            <Text style={styles.matchTime}>Started at {m.startedAt}</Text>
          </View>
        ))}
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
    letterSpacing: 0.5,
    fontWeight: '700',
    color: '#fefefe',
    paddingHorizontal: normalizeWidth(48),
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveBadge: {
    backgroundColor: LIVE_BADGE_BG,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 10,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  startedText: {
    fontSize: 13,
    color: '#9198b5',
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9198b5',
    letterSpacing: 0.5,
    marginTop: 18,
  },
  timer: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: 44,
    letterSpacing: -1,
    color: LIVE_ACCENT,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 20,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9198b5',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    backgroundColor: '#252d47',
    borderWidth: 1,
    borderColor: '#3d4563',
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  rowLast: {
    borderBottomWidth: 0,
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
  idleBanner: {
    borderRadius: 10,
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 20,
  },
  idleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e8cf7a',
  },
  ctaButton: {
    backgroundColor: '#4f7ee8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  matchesLabel: {
    marginTop: 28,
  },
  matchRow: {
    borderRadius: 12,
    backgroundColor: '#252d47',
    borderWidth: 1,
    borderColor: '#3d4563',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  matchRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: LIVE_ACCENT,
    marginRight: 8,
  },
  matchText: {
    fontSize: 15,
    color: '#e7ebf5',
  },
  matchTime: {
    fontSize: 12,
    color: '#9198b5',
    marginTop: 4,
    marginLeft: 14,
  },
});
