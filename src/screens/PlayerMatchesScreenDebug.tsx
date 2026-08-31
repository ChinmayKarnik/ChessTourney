import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import whiteLeftArrow from '../images/white-left-arrow.png';
import { normalize, normalizeWidth, normalizeHeight } from '../utils/normalize';

type Props = NativeStackScreenProps<RootStackParamList, 'PlayerMatches'>;

const WIN_BADGE_BG = '#1f6b3f';
const LOSS_BADGE_BG = '#7a3030';
const DRAW_BADGE_BG = 'rgba(255,255,255,0.08)';
const ONGOING_BADGE_BG = '#2d4a86';
const ONGOING_ACCENT = '#4f7ee8';

const PLAYER_NAME = 'kkr19';

const MATCHES: { opponent: string; result: 'win' | 'loss' | 'draw' | 'ongoing'; speed: string; playedAt: string }[] = [
  { opponent: 'BlindFork', result: 'ongoing', speed: 'Blitz', playedAt: '5:10 PM' },
  { opponent: 'SicilianSlayer', result: 'loss', speed: 'Blitz', playedAt: '4:57 PM' },
  { opponent: 'HarshB20000', result: 'win', speed: 'Blitz', playedAt: '4:44 PM' },
  { opponent: 'ChessWizard88', result: 'win', speed: 'Blitz', playedAt: '4:31 PM' },
  { opponent: 'PawnStormer', result: 'draw', speed: 'Blitz', playedAt: '4:18 PM' },
  { opponent: 'KnightRider22', result: 'win', speed: 'Blitz', playedAt: '4:05 PM' },
];

const resultLabel = (result: 'win' | 'loss' | 'draw' | 'ongoing') => {
  if (result === 'win') return 'WON';
  if (result === 'loss') return 'LOST';
  if (result === 'ongoing') return 'LIVE';
  return 'DRAW';
};

const resultBadgeBg = (result: 'win' | 'loss' | 'draw' | 'ongoing') => {
  if (result === 'win') return WIN_BADGE_BG;
  if (result === 'loss') return LOSS_BADGE_BG;
  if (result === 'ongoing') return ONGOING_BADGE_BG;
  return DRAW_BADGE_BG;
};

export const PlayerMatchesScreenDebug = ({ navigation }: Props) => {
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
          {PLAYER_NAME}
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Match History</Text>
          <Text style={styles.listCount}>{MATCHES.length} matches</Text>
        </View>

        {MATCHES.map((m, i) => (
          <View
            key={`${m.opponent}-${i}`}
            style={[styles.matchCard, m.result === 'ongoing' && styles.matchCardLive]}
          >
            <View style={styles.matchTopRow}>
              <View style={styles.opponentRow}>
                {m.result === 'ongoing' && <View style={styles.liveDot} />}
                <Text style={styles.opponentText} numberOfLines={1}>
                  vs {m.opponent}
                </Text>
              </View>
              <View style={[styles.resultBadge, { backgroundColor: resultBadgeBg(m.result) }]}>
                <Text
                  style={[
                    styles.resultBadgeText,
                    m.result === 'draw' && styles.resultBadgeTextMuted,
                  ]}
                >
                  {resultLabel(m.result)}
                </Text>
              </View>
            </View>
            <View style={styles.matchMetaRow}>
              <View style={styles.speedTag}>
                <Text style={styles.speedTagText}>{m.speed}</Text>
              </View>
              <View style={styles.timeRow}>
                <View style={styles.clockIcon}>
                  <View style={styles.clockHand} />
                </View>
                <Text style={styles.matchMetaTime}>{m.playedAt}</Text>
              </View>
            </View>
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
  listHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e7ebf5',
    letterSpacing: 0.2,
  },
  listCount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9198b5',
    letterSpacing: 0.3,
  },
  matchCard: {
    borderRadius: 12,
    backgroundColor: '#252d47',
    borderWidth: 1,
    borderColor: '#3d4563',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  matchCardLive: {
    borderLeftWidth: 3,
    borderLeftColor: ONGOING_ACCENT,
  },
  matchTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  opponentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
    backgroundColor: ONGOING_ACCENT,
  },
  opponentText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#e7ebf5',
  },
  resultBadge: {
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  resultBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.6,
  },
  resultBadgeTextMuted: {
    color: '#9198b5',
  },
  matchMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  speedTag: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginRight: 9,
  },
  speedTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#c7cce3',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 1.5,
    borderColor: '#767c99',
    marginRight: 6,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockHand: {
    width: 1.5,
    height: 4.5,
    borderRadius: 1,
    backgroundColor: '#767c99',
    marginBottom: 2.5,
  },
  matchMetaTime: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9198b5',
  },
});
