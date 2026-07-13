jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

import { getNextPairing } from '../src/utils/tournamentUtils';

// Deterministic PRNG (mulberry32) so randomized scenarios are reproducible.
const makeRng = (seed: number) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const makeMatch = (opponent: string, playedAt: number, finishedAt: number | null) => ({
  id: `${opponent}-${playedAt}`,
  opponent,
  color: 'white',
  result: 'win',
  speed: 'blitz',
  playedAt,
  finishedAt,
  rating: 1500,
});

describe('getNextPairing', () => {
  it('never suggests a rematch for either player right after they play each other', () => {
    const players = ['A', 'B', 'C', 'D'];
    const tournament = {
      players,
      matches: {
        A: [makeMatch('B', 1000, 1100)],
        B: [makeMatch('A', 1000, 1100)],
        C: [],
        D: [],
      },
      ongoingMatches: { A: [], B: [], C: [], D: [] },
    };

    const nextForA = getNextPairing(tournament, 'A');
    const nextForB = getNextPairing(tournament, 'B');

    expect(nextForA).not.toBe('B');
    expect(nextForB).not.toBe('A');
    expect(['C', 'D']).toContain(nextForA);
    expect(['C', 'D']).toContain(nextForB);
  });

  it('returns no pairing if the last opponent is the only idle player left', () => {
    const players = ['A', 'B', 'C', 'D'];
    const tournament = {
      players,
      matches: {
        A: [makeMatch('B', 1000, 1100)],
      },
      ongoingMatches: {
        A: [],
        B: [],
        C: [{ id: 'busy1' }],
        D: [{ id: 'busy2' }],
      },
    };

    expect(getNextPairing(tournament, 'A')).toBeNull();
  });

  it('returns null when every other player is busy', () => {
    const players = ['A', 'B', 'C', 'D'];
    const tournament = {
      players,
      matches: {},
      ongoingMatches: {
        A: [],
        B: [{ id: 'busy1' }],
        C: [{ id: 'busy2' }],
        D: [{ id: 'busy3' }],
      },
    };

    expect(getNextPairing(tournament, 'A')).toBeNull();
  });

  it('is deterministic across repeated calls with the same state', () => {
    const players = ['A', 'B', 'C', 'D'];
    const tournament = {
      players,
      matches: {
        A: [makeMatch('C', 500, 600)],
      },
      ongoingMatches: { A: [], B: [], C: [], D: [] },
    };

    const first = getNextPairing(tournament, 'A');
    for (let i = 0; i < 10; i++) {
      expect(getNextPairing(tournament, 'A')).toBe(first);
    }
  });

  it('holds the no-immediate-rematch invariant across random scenarios', () => {
    const rng = makeRng(42);
    const players = ['A', 'B', 'C', 'D'];

    for (let scenario = 0; scenario < 200; scenario++) {
      // Pick two players who "just played" each other.
      const shuffled = [...players].sort(() => rng() - 0.5);
      const [justPlayedA, justPlayedB, ...rest] = shuffled;
      const playedAt = 1000 + scenario;

      const matches: Record<string, any[]> = {
        [justPlayedA]: [makeMatch(justPlayedB, playedAt, playedAt + 100)],
        [justPlayedB]: [makeMatch(justPlayedA, playedAt, playedAt + 100)],
      };

      // Randomly decide whether the other two players are idle or mid-match.
      const ongoingMatches: Record<string, any[]> = {
        [justPlayedA]: [],
        [justPlayedB]: [],
      };
      for (const p of rest) {
        ongoingMatches[p] = rng() < 0.5 ? [] : [{ id: `busy-${p}-${scenario}` }];
      }

      const tournament = { players, matches, ongoingMatches };

      const idleOthers = (target: string) =>
        players.filter(p => p !== target && (ongoingMatches[p] ?? []).length === 0);

      for (const [player, lastOpponent] of [
        [justPlayedA, justPlayedB],
        [justPlayedB, justPlayedA],
      ] as const) {
        const result = getNextPairing(tournament, player);
        const candidates = idleOthers(player);

        const nonRematchCandidates = candidates.filter(p => p !== lastOpponent);

        if (nonRematchCandidates.length === 0) {
          // Either no one is idle, or the only idle player is the one we
          // just played — either way, no pairing should be suggested.
          expect(result).toBeNull();
        } else {
          expect(nonRematchCandidates).toContain(result);
          expect(result).not.toBe(lastOpponent);
        }
      }
    }
  });
});
