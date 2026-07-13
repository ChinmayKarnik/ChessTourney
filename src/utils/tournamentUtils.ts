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

export { setLatestDataForTournament };
