import { DatabaseController, LichessController } from '../data/controllers';

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
  const points: Record<string, number> = {};

  for (const player of tournament.players) {
    points[player] = matches[player]
      .filter((m: any) => m.finishedAt <= Date.now())
      .reduce((total: number, m: any) => {
        if (m.result === 'win') return total + 2;
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

  console.log(new Date(Date.now()).toISOString(), 'updating tournament', {
    matches,
    points,
    ongoingMatches
  });

  await DatabaseController.getInstance().updateTournament(id, {
    matches,
    points,
    ongoingMatches,
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

export { setLatestDataForTournament, getNextPairing, getMatchColor };
