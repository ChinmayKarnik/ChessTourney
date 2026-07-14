import { DatabaseController, LichessController } from '../data/controllers';

// Public feed of tournaments to auto-import — anyone with this URL can push a
// tournament into every friend's app, so keep this strictly read/import-only.
const TOURNAMENT_FEED_URL =
  'https://gist.githubusercontent.com/ChinmayKarnik/3d2c100cef1086fb1b48f51614a6deff/raw/tournaments-feed.json';

const feedTournamentChanged = (existing: any, feed: any): boolean =>
  Object.keys(feed).some(
    key => JSON.stringify(existing[key]) !== JSON.stringify(feed[key]),
  );

const importFeedTournaments = async (): Promise<void> => {
  let feed: any[];
  try {
    // Cache-busting query param: the gist CDN sends `cache-control:
    // max-age=300`, and RN's fetch will otherwise happily serve a stale
    // response for up to 5 minutes after the first request.
    const url = `${TOURNAMENT_FEED_URL}?t=${Date.now()}`;
    console.log('TOURNAMENT_FEED fetching', url);
    const response = await fetch(url);
    feed = await response.json();
    console.log('TOURNAMENT_FEED fetched', JSON.stringify(feed));
  } catch (error) {
    console.log('failed to fetch tournament feed', error);
    return;
  }

  const existingById = new Map(
    DatabaseController.getInstance()
      .getTournaments()
      .map(t => [t.id, t]),
  );

  for (const tournament of feed) {
    const existing = existingById.get(tournament.id);
    if (!existing) {
      console.log('TOURNAMENT_FEED adding new tournament', tournament.id);
      await DatabaseController.getInstance().addTournament(tournament);
    } else if (feedTournamentChanged(existing, tournament)) {
      console.log(
        'TOURNAMENT_FEED updating tournament',
        tournament.id,
        'existing:',
        JSON.stringify(existing),
        'feed:',
        JSON.stringify(tournament),
      );
      await DatabaseController.getInstance().updateTournament(
        tournament.id,
        tournament,
      );
    } else {
      console.log('TOURNAMENT_FEED no changes for', tournament.id);
    }
  }
};

const setLatestDataForTournament = async (id: string) => {
  // get trouanment from the database.
  const tournament = DatabaseController.getInstance()
    .getTournaments()
    .find(t => t.id === id);

  if (!tournament) {
    return;
  }

  // for all the players, get all the matches corresponding to the time frame within the torunament
  // ie. the last match should start before the tournament end time and the first match should start after the tournament start time.
  const startTime = tournament.startTime;
  const endTime = Math.min(
    tournament.startTime + tournament.duration,
    Date.now(),
  );

  const matches: any = {};

  for (const player of tournament.players) {
    let playerGames: any[] = [];
    try {
      playerGames = await LichessController.getInstance().getGamesInTimeRange(
        player,
        startTime,
        endTime,
      );
    } catch (error) {
      console.log('failed to fetch games for', player, error);
    }

    // only games against other tournament players count towards this tournament.
    // matches[player] = playerGames.filter((m: any) =>
    //   tournament.players.includes(m.opponent),
    // );
    matches[player] = playerGames;

    console.log(player, matches[player]);
  }

  // points: win = 2, draw = 1, loss = 0. Only count matches that have finished.
  // If streakEnabled, wins from the 3rd consecutive win onward score 4 instead
  // of 2 — streak is tracked in play order and resets on a draw or loss.
  const points: Record<string, number> = {};

  for (const player of tournament.players) {
    const finishedMatches = matches[player]
      .filter((m: any) => m.finishedAt <= Date.now())
      .sort((a: any, b: any) => a.playedAt - b.playedAt);

    let winStreak = 0;
    points[player] = finishedMatches.reduce((total: number, m: any) => {
      if (m.result === 'win') {
        winStreak += 1;
        const onStreak = tournament.streakEnabled && winStreak >= 3;
        return total + (onStreak ? 4 : 2);
      }
      winStreak = 0;
      if (m.result === 'draw') return total + 1;
      return total;
    }, 0);
  }

  // ongoing matches: started before now, and either have no finish time or finish after now.
  const ongoingMatches: any = {};

  for (const player of tournament.players) {
    ongoingMatches[player] = matches[player].filter(
      (m: any) =>
        m.playedAt < Date.now() && (!m.finishedAt || m.finishedAt > Date.now()),
    );
  }

  // leaderboard: one row per player, ranked by points (ties broken alphabetically).
  const leaderboard = tournament.players
    .map((player: string) => {
      const rating = matches[player][0]?.rating;
      return { player, points: points[player] ?? 0, rating };
    })
    .sort(
      (a: any, b: any) => b.points - a.points || a.player.localeCompare(b.player),
    );

  console.log(new Date(Date.now()).toISOString(), 'updating tournament', {
    matches,
    points,
    ongoingMatches,
    leaderboard,
  });

  await DatabaseController.getInstance().updateTournament(id, {
    matches,
    points,
    ongoingMatches,
    leaderboard,
  });
};

const getNextPairing = (tournament: any, player: string): string | null => {
  const ongoingMatches = tournament.ongoingMatches ?? {};
  const matches = tournament.matches ?? {};

  const isIdle = (p: string) => (ongoingMatches[p] ?? []).length === 0;

  const idleOpponents = tournament.players.filter(
    (p: string) => p !== player && isIdle(p),
  );

  if (idleOpponents.length === 0) {
    return null;
  }

  const playerMatches = matches[player] ?? [];
  const lastMatch = [...playerMatches].sort(
    (a: any, b: any) => b.playedAt - a.playedAt,
  )[0];
  const lastOpponent = lastMatch?.opponent;

  const candidates = idleOpponents.filter((p: string) => p !== lastOpponent);

  if (candidates.length === 0) {
    return null;
  }

  return tournament.players.find((p: string) => candidates.includes(p)) ?? null;
};

// Determines which color `player` should play as against `opponent` for their
// next match: if they've played each other before, reverse the color from
// their most recent match against each other; otherwise the alphabetically
// earlier username gets white. Deterministic, so every device agrees.
const getMatchColor = (
  tournament: any,
  player: string,
  opponent: string,
): 'white' | 'black' => {
  const matches = tournament.matches ?? {};
  const priorMatches = (matches[player] ?? []).filter(
    (m: any) => m.opponent === opponent,
  );
  const lastMatch = [...priorMatches].sort(
    (a: any, b: any) => b.playedAt - a.playedAt,
  )[0];

  if (lastMatch) {
    return lastMatch.color === 'white' ? 'black' : 'white';
  }

  return player < opponent ? 'white' : 'black';
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// Maps an oddsInfo piece code to its standard starting file — independent of
// color, since the same file holds that piece on both back ranks.
const ODDS_PIECE_FILES: Record<string, string> = {
  Ra: 'a',
  Nb: 'b',
  Bc: 'c',
  Q: 'd',
  Bf: 'f',
  Ng: 'g',
  Rh: 'h',
};

// Pawn codes (Pa-Ph) name the file directly, since there's one pawn per file.
const isPawnCode = (piece: string): boolean => /^P[a-h]$/.test(piece);

const rankToFen = (rank: (string | null)[]): string => {
  let segment = '';
  let empty = 0;
  for (const square of rank) {
    if (square === null) {
      empty += 1;
      continue;
    }
    if (empty > 0) {
      segment += empty;
      empty = 0;
    }
    segment += square;
  }
  if (empty > 0) {
    segment += empty;
  }
  return segment;
};

// Builds a standard-start FEN with `missing` pieces removed from the odds
// giver's back rank. `giverColor` is the color the giver is actually playing
// in this match — the pieces come off rank 1 or rank 8 accordingly, since a
// handicap belongs to the player, not to whichever color they're assigned.
const buildOddsFen = (
  missing: string[],
  giverColor: 'white' | 'black',
): string => {
  const whiteBackRank: (string | null)[] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  const blackBackRank: (string | null)[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  const whitePawnRank: (string | null)[] = Array(8).fill('P');
  const blackPawnRank: (string | null)[] = Array(8).fill('p');

  const targetBackRank = giverColor === 'white' ? whiteBackRank : blackBackRank;
  const targetPawnRank = giverColor === 'white' ? whitePawnRank : blackPawnRank;

  for (const piece of missing) {
    if (isPawnCode(piece)) {
      targetPawnRank[FILES.indexOf(piece[1])] = null;
      continue;
    }
    const file = ODDS_PIECE_FILES[piece];
    if (!file) {
      continue;
    }
    targetBackRank[FILES.indexOf(file)] = null;
  }

  let castling = '';
  if (whiteBackRank[7]) castling += 'K';
  if (whiteBackRank[0]) castling += 'Q';
  if (blackBackRank[7]) castling += 'k';
  if (blackBackRank[0]) castling += 'q';

  const ranks = [
    rankToFen(blackBackRank),
    rankToFen(blackPawnRank),
    '8',
    '8',
    '8',
    '8',
    rankToFen(whitePawnRank),
    rankToFen(whiteBackRank),
  ];

  return `${ranks.join('/')} w ${castling || '-'} - 0 1`;
};

const getOddsForMatch = (
  tournament: any,
  player: string,
  opponent: string,
): { giver: string; missing: string[] } | null => {
  const players: string[] = tournament.players;
  const playerIndex = players.indexOf(player);
  const opponentIndex = players.indexOf(opponent);
  if (playerIndex === -1 || opponentIndex === -1) {
    return null;
  }

  const key = [playerIndex, opponentIndex].sort((a, b) => a - b).join('-');
  const entry = (tournament.oddsInfo ?? {})[key];
  if (!entry) {
    return null;
  }

  return { giver: players[entry.giver], missing: entry.missing };
};

// Generates the odds-adjusted starting FEN for a match, from `player`'s point
// of view. `playerColor` is the color `player` is assigned for this match;
// the giver's color (white or black) is derived from it since the two
// players are always assigned opposite colors.
const getMatchFen = (
  tournament: any,
  player: string,
  opponent: string,
  playerColor: 'white' | 'black',
): string => {
  const odds = getOddsForMatch(tournament, player, opponent);
  if (!odds) {
    return '';
  }

  const giverColor =
    odds.giver === player
      ? playerColor
      : playerColor === 'white'
      ? 'black'
      : 'white';

  return buildOddsFen(odds.missing, giverColor);
};

export {
  setLatestDataForTournament,
  importFeedTournaments,
  getNextPairing,
  getMatchColor,
  buildOddsFen,
  getMatchFen,
};
