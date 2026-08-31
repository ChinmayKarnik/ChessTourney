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
const ENDS_AT = '5:30 PM';
const DURATION = '45m';
const REMAINING = '00:20:08';

const LEADERBOARD = [
  { player: 'BlindFork', points: 9 },
  { player: 'kkr19', points: 7 },
  { player: 'ChessWizard88', points: 6 },
  { player: 'HarshB20000', points: 6 },
  { player: 'PawnStormer', points: 5 },
  { player: 'e4Enjoyer', points: 4 },
  { player: 'KnightRider22', points: 4 },
  { player: 'SicilianSlayer', points: 3 },
  { player: 'rajjayavant', points: 3 },
  { player: 'RookiePlayer', points: 2 },
  { player: 'TacticalTom', points: 2 },
  { player: 'GMhopeful', points: 1 },
  { player: 'EndgameEddie', points: 1 },
  { player: 'CastleKing', points: 0 },
];

const STANDINGS_PAGE_SIZE = 8;
const STANDINGS_TOTAL_PAGES = Math.ceil(LEADERBOARD.length / STANDINGS_PAGE_SIZE);

const NEXT_PAIRING = 'HarshB20000';
const NEXT_PAIRING_COLOR = 'White';

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
        <View style={styles.statusCard}>
          <View style={styles.liveCornerBadge}>
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
          <View style={styles.statusSplitRow}>
            <View style={styles.statusTimerBlock}>
              <Text style={styles.timer}>{REMAINING}</Text>
              <Text style={styles.timerLabel}>until {ENDS_AT}</Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusMetaBlock}>
              <Text style={styles.durationValue}>{DURATION}</Text>
              <Text style={styles.durationLabel}>DURATION</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionLabel, styles.standingsLabel]}>STANDINGS</Text>
        <View style={styles.card}>
          {LEADERBOARD.slice(0, STANDINGS_PAGE_SIZE).map((entry, i) => (
            <View
              key={entry.player}
              style={[
                styles.row,
                i === STANDINGS_PAGE_SIZE - 1 && styles.rowLast,
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

        <View style={styles.pageNavRow}>
          <TouchableOpacity
            style={[styles.pageArrow, styles.pageArrowDisabled]}
            disabled
          >
            <Text style={[styles.pageArrowText, styles.pageArrowTextDisabled]}>
              {'<'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.pageNavLabel}>
            Page 1 of {STANDINGS_TOTAL_PAGES}
          </Text>
          <TouchableOpacity style={styles.pageArrow}>
            <Text style={styles.pageArrowText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionLabel, styles.nextMatchLabel]}>NEXT MATCH</Text>
        <View style={styles.nextMatchCard}>
          <View style={styles.nextMatchHeader}>
            <Text style={styles.nextMatchOpponent}>vs {NEXT_PAIRING}</Text>
            <View style={styles.colorTag}>
              <Text style={styles.colorTagText}>You: {NEXT_PAIRING_COLOR}</Text>
            </View>
          </View>
          <Text style={styles.nextMatchHint}>
            It's your move — send the challenge to start the game.
          </Text>
          <TouchableOpacity style={styles.ctaButton} onPress={() => {}}>
            <Text style={styles.ctaButtonText}>Challenge {NEXT_PAIRING}</Text>
          </TouchableOpacity>
        </View>

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
  statusCard: {
    position: 'relative',
    borderRadius: 12,
    backgroundColor: '#252d47',
    borderWidth: 1,
    borderColor: '#3d4563',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  statusSplitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTimerBlock: {
    flex: 1,
  },
  statusDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#3d4563',
    marginHorizontal: 16,
  },
  statusMetaBlock: {
    alignItems: 'flex-end',
    marginTop: 18,
  },
  liveCornerBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: LIVE_BADGE_BG,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  durationCaption: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9198b5',
    letterSpacing: 0.3,
  },
  durationLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9198b5',
    letterSpacing: 1,
    marginTop: 2,
  },
  durationValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#c7cce3',
  },
  durationCaptionBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#c7cce3',
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9198b5',
    letterSpacing: 1,
    marginTop: 2,
  },
  timer: {
    fontFamily: 'RobotoMono-Regular',
    fontSize: 34,
    letterSpacing: -0.5,
    color: LIVE_ACCENT,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9198b5',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  standingsLabel: {
    marginTop: 20,
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
  pageNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  pageArrow: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#252d47',
    borderWidth: 1,
    borderColor: '#3d4563',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageArrowDisabled: {
    opacity: 0.4,
  },
  pageArrowText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e7ebf5',
  },
  pageArrowTextDisabled: {
    color: '#9198b5',
  },
  pageNavLabel: {
    fontSize: 13,
    color: '#9198b5',
    marginHorizontal: 16,
  },
  nextMatchLabel: {
    marginTop: 24,
  },
  nextMatchCard: {
    borderRadius: 12,
    backgroundColor: '#252d47',
    borderWidth: 1,
    borderColor: '#3d4563',
    padding: 14,
  },
  nextMatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextMatchOpponent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e7ebf5',
  },
  colorTag: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  colorTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9198b5',
    letterSpacing: 0.3,
  },
  nextMatchHint: {
    fontSize: 13,
    color: '#9198b5',
    marginTop: 6,
    marginBottom: 14,
  },
  ctaButton: {
    backgroundColor: '#4f7ee8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
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
